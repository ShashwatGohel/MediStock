import User from "../models/User.js";
import Medicine from "../models/Medicine.js";
import Review from "../models/Review.js";
import mongoose from "mongoose";

// 📍 Get all stores within radius
export const getNearbyStores = async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required"
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusInMeters = parseFloat(radius) * 1000;

    // Find stores within radius using geospatial query
    const stores = await User.find({
      role: "store",
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: radiusInMeters,
        },
      },
    }).select("name storeName storeAddress location latitude longitude isStoreOpen operatingHours phone");

    // Calculate distance for each store
    const storesWithDistance = await Promise.all(
      stores.map(async (store) => {
        const distance = calculateDistance(
          latitude,
          longitude,
          store.latitude,
          store.longitude
        );

        // Get medicine count for this store
        const medicineCount = await Medicine.countDocuments({
          storeId: store._id,
          isAvailable: true
        });

        // Get review stats
        const reviewStats = await Review.aggregate([
          { $match: { storeId: store._id } },
          { $group: { _id: "$storeId", averageRating: { $avg: "$rating" }, count: { $sum: 1 } } }
        ]);

        return {
          id: store._id,
          name: store.storeName || store.name,
          address: store.storeAddress,
          distance: parseFloat(distance.toFixed(2)),
          isOpen: store.isStoreOpen,
          operatingHours: store.operatingHours,
          phone: store.phone,
          latitude: store.latitude,
          longitude: store.longitude,
          medicineCount,
          rating: reviewStats[0]?.averageRating || 0,
          reviewCount: reviewStats[0]?.count || 0
        };
      })
    );

    // Sort by distance
    storesWithDistance.sort((a, b) => a.distance - b.distance);

    res.json({
      success: true,
      stores: storesWithDistance,
      count: storesWithDistance.length
    });
  } catch (err) {
    console.error("Error in getNearbyStores:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 🏪 Get all registered stores (for directory page)
export const getAllStores = async (req, res) => {
  try {
    const { search, sortBy = 'name' } = req.query;

    // Build query
    const query = { role: "store" };

    if (search) {
      query.$or = [
        { storeName: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { storeAddress: { $regex: search, $options: "i" } }
      ];
    }

    // Fetch stores
    const stores = await User.find(query)
      .select("name storeName storeAddress location latitude longitude isStoreOpen operatingHours phone")
      .lean();

    // Get medicine count and review stats for each store
    const storesWithDetails = await Promise.all(
      stores.map(async (store) => {
        const medicineCount = await Medicine.countDocuments({
          storeId: store._id,
          isAvailable: true
        });

        const reviewStats = await Review.aggregate([
          { $match: { storeId: store._id } },
          { $group: { _id: "$storeId", averageRating: { $avg: "$rating" }, count: { $sum: 1 } } }
        ]);

        return {
          id: store._id,
          name: store.storeName || store.name,
          address: store.storeAddress,
          isOpen: store.isStoreOpen,
          operatingHours: store.operatingHours,
          phone: store.phone,
          latitude: store.latitude,
          longitude: store.longitude,
          medicineCount,
          rating: reviewStats[0]?.averageRating || 0,
          reviewCount: reviewStats[0]?.count || 0
        };
      })
    );

    // Sort results
    if (sortBy === 'rating') {
      storesWithDetails.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'name') {
      storesWithDetails.sort((a, b) => a.name.localeCompare(b.name));
    }

    res.json({
      success: true,
      stores: storesWithDetails,
      count: storesWithDetails.length
    });
  } catch (err) {
    console.error("Error in getAllStores:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 🏪 Get single store details
export const getStoreById = async (req, res) => {
  try {
    const { storeId } = req.params;

    const store = await User.findOne({
      _id: storeId,
      role: "store"
    }).select("name storeName storeAddress location latitude longitude isStoreOpen operatingHours phone email licenseNumber");

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found"
      });
    }

    // Get medicine count
    const medicineCount = await Medicine.countDocuments({
      storeId: store._id,
      isAvailable: true
    });

    // Get review stats
    const reviewStats = await Review.aggregate([
      { $match: { storeId: store._id } },
      { $group: { _id: "$storeId", averageRating: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      store: {
        id: store._id,
        name: store.storeName || store.name,
        address: store.storeAddress,
        latitude: store.latitude,
        longitude: store.longitude,
        isOpen: store.isStoreOpen,
        operatingHours: store.operatingHours,
        phone: store.phone,
        email: store.email,
        licenseNumber: store.licenseNumber,
        medicineCount,
        rating: reviewStats[0]?.averageRating || 0,
        reviewCount: reviewStats[0]?.count || 0
      },
    });
  } catch (err) {
    console.error("Error in getStoreById:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 💊 Get medicines for a specific store
export const getStoreMedicines = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { search } = req.query;

    // Verify store exists
    const store = await User.findOne({ _id: storeId, role: "store" });
    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found"
      });
    }

    // Build query
    const query = { storeId };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const medicines = await Medicine.find(query).sort({ name: 1 });

    res.json({
      success: true,
      medicines,
      count: medicines.length,
      storeName: store.storeName || store.name,
    });
  } catch (err) {
    console.error("Error in getStoreMedicines:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 🔄 Update store status and operating hours
export const updateStoreStatus = async (req, res) => {
  try {
    const storeId = req.user.id;
    const { isStoreOpen, operatingHours } = req.body;

    const updateData = {};
    if (isStoreOpen !== undefined) updateData.isStoreOpen = isStoreOpen;
    if (operatingHours !== undefined) updateData.operatingHours = operatingHours;

    const updatedStore = await User.findByIdAndUpdate(
      storeId,
      updateData,
      { new: true }
    ).select("isStoreOpen operatingHours storeName");

    res.json({
      success: true,
      message: "Store status updated successfully",
      store: updatedStore
    });
  } catch (err) {
    console.error("Error in updateStoreStatus:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 💊 Search stores that have a specific medicine
export const searchStoresByMedicine = async (req, res) => {
  try {
    const { lat, lng, radius = 5, medicine, category } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required"
      });
    }

    if (!medicine && !category) {
      return res.status(400).json({
        success: false,
        message: "Either medicine name or category is required"
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusInMeters = parseFloat(radius) * 1000;

    // Find medicines matching the search
    const medQuery = {
      isAvailable: true,
      quantity: { $gt: 0 },
    };

    if (medicine) {
      medQuery.name = { $regex: medicine, $options: "i" };
    }

    if (category) {
      medQuery.category = { $regex: category, $options: "i" };
    }

    const medicines = await Medicine.find(medQuery).populate("storeId", "name storeName storeAddress location latitude longitude isStoreOpen operatingHours phone");

    // Filter stores within radius and calculate distance
    const storesWithMedicine = [];
    const seenStores = new Set();

    for (const med of medicines) {
      if (!med.storeId || !med.storeId.latitude || !med.storeId.longitude) continue;

      const storeId = med.storeId._id.toString();
      if (seenStores.has(storeId)) continue;

      const distance = calculateDistance(
        latitude,
        longitude,
        med.storeId.latitude,
        med.storeId.longitude
      );

      if (distance <= parseFloat(radius)) {
        seenStores.add(storeId);

        // Get all matching medicines from this store
        const storeMedicines = medicines
          .filter(m => m.storeId && m.storeId._id.toString() === storeId)
          .map(m => ({
            id: m._id,
            name: m.name,
            brand: m.brand,
            price: m.price,
            quantity: m.quantity,
          }));

        storesWithMedicine.push({
          id: med.storeId._id,
          name: med.storeId.storeName || med.storeId.name,
          address: med.storeId.storeAddress,
          distance: parseFloat(distance.toFixed(2)),
          isOpen: med.storeId.isStoreOpen,
          operatingHours: med.storeId.operatingHours,
          phone: med.storeId.phone,
          latitude: med.storeId.latitude,
          latitude: med.storeId.latitude,
          longitude: med.storeId.longitude,
          medicines: storeMedicines,
          rating: (await Review.aggregate([
            { $match: { storeId: med.storeId._id } },
            { $group: { _id: "$storeId", averageRating: { $avg: "$rating" } } }
          ]))[0]?.averageRating || 0,
        });
      }
    }

    // Sort by distance
    storesWithMedicine.sort((a, b) => a.distance - b.distance);

    res.json({
      success: true,
      stores: storesWithMedicine,
      count: storesWithMedicine.length
    });
  } catch (err) {
    console.error("Error in searchStoresByMedicine:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 📍 Update store location
export const updateStoreLocation = async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;
    const userId = req.user.id; // From auth middleware

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required"
      });
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: "Invalid coordinates"
      });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== "store") {
      return res.status(403).json({
        success: false,
        message: "Only store owners can update location"
      });
    }

    user.latitude = latitude;
    user.longitude = longitude;
    user.location = {
      type: "Point",
      coordinates: [longitude, latitude],
    };

    if (address) {
      user.storeAddress = address;
    }

    await user.save();

    res.json({
      success: true,
      message: "Location updated successfully",
      location: {
        latitude: user.latitude,
        longitude: user.longitude,
        address: user.storeAddress,
      },
    });
  } catch (err) {
    console.error("Error in updateStoreLocation:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ⭐ Toggle save/unsave store
export const toggleSaveStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const index = user.savedStores.indexOf(storeId);
    if (index === -1) {
      user.savedStores.push(storeId);
      await user.save();
      res.json({ success: true, message: "Store saved", status: "saved" });
    } else {
      user.savedStores.splice(index, 1);
      await user.save();
      res.json({ success: true, message: "Store removed", status: "unsaved" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 📂 Get saved stores
export const getSavedStores = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("savedStores", "name storeName storeAddress location latitude longitude isStoreOpen operatingHours phone");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const savedStores = user.savedStores.map(store => ({
      id: store._id,
      name: store.storeName || store.name,
      address: store.storeAddress,
      isOpen: store.isStoreOpen,
      operatingHours: store.operatingHours,
      phone: store.phone,
      latitude: store.latitude,
      longitude: store.longitude,
    }));

    res.json({ success: true, stores: savedStores });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 👤 Get current store profile
export const getStoreProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const store = await User.findById(userId).select("name storeName storeAddress location latitude longitude isStoreOpen operatingHours phone email licenseNumber");

    if (!store || store.role !== "store") {
      return res.status(404).json({ success: false, message: "Store profile not found" });
    }

    res.json({
      success: true,
      store: {
        id: store._id,
        name: store.storeName || store.name,
        address: store.storeAddress,
        latitude: store.latitude,
        longitude: store.longitude,
        isOpen: store.isStoreOpen,
        operatingHours: store.operatingHours,
        phone: store.phone,
        email: store.email,
        licenseNumber: store.licenseNumber,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}



