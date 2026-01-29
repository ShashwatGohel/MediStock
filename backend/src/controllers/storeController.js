import User from "../models/User.js";
import Medicine from "../models/Medicine.js";

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

// 💊 Search stores that have a specific medicine
export const searchStoresByMedicine = async (req, res) => {
  try {
    const { lat, lng, radius = 5, medicine } = req.query;

    if (!lat || !lng || !medicine) {
      return res.status(400).json({
        success: false,
        message: "Latitude, longitude, and medicine name are required"
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusInMeters = parseFloat(radius) * 1000;

    // Find medicines matching the search
    const medicines = await Medicine.find({
      name: { $regex: medicine, $options: "i" },
      isAvailable: true,
      quantity: { $gt: 0 },
    }).populate("storeId", "name storeName storeAddress location latitude longitude isStoreOpen operatingHours phone");

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
          longitude: med.storeId.longitude,
          medicines: storeMedicines,
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



