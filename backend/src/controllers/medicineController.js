import Medicine from "../models/Medicine.js";
import { medicineCatalog } from "../config/medicineCatalog.js";
import { calculateDistance } from "../utils/locationHelper.js";

export const addMedicine = async (req, res) => {
    try {
        const {
            name,
            brand,
            category,
            quantity,
            price,
            expiryDate,
        } = req.body;

        const storeId = req.user.id; // from auth middleware

        const medicine = await Medicine.create({
            storeId,
            name,
            brand,
            category,
            quantity,
            price,
            expiryDate,
            isAvailable: quantity > 0,
        });

        res.status(201).json({
            success: true,
            medicine,
        });
    } catch (error) {
        console.error("Error adding medicine:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add medicine",
            error: error.message
        });
    }
};

export const getStoreMedicines = async (req, res) => {
    try {
        const storeId = req.user.id;

        const medicines = await Medicine.find({ storeId });

        res.json({ success: true, medicines });
    } catch (error) {
        console.error("Error fetching medicines:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch medicines"
        });
    }
};

export const getLowStockMedicines = async (req, res) => {
    try {
        const storeId = req.user.id;
        const threshold = parseInt(req.query.threshold) || 10;

        const lowStockMedicines = await Medicine.find({
            storeId,
            quantity: { $lte: threshold }
        }).sort({ quantity: 1 }); // Sort by quantity ascending (lowest first)

        res.json({
            success: true,
            medicines: lowStockMedicines,
            count: lowStockMedicines.length
        });
    } catch (error) {
        console.error("Error fetching low stock medicines:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch low stock medicines"
        });
    }
};

export const deleteMedicine = async (req, res) => {
    try {
        const { id } = req.params;
        const storeId = req.user.id;

        // Find medicine and verify ownership
        const medicine = await Medicine.findById(id);

        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: "Medicine not found"
            });
        }

        if (medicine.storeId.toString() !== storeId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to delete this medicine"
            });
        }

        await Medicine.findByIdAndDelete(id);

        res.json({
            success: true,
            message: "Medicine deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting medicine:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete medicine",
            error: error.message
        });
    }
};

export const getCatalog = async (req, res) => {
    try {
        const { search, category } = req.query;
        let filteredCatalog = [...medicineCatalog];

        if (category) {
            filteredCatalog = filteredCatalog.filter(
                item => item.category.toLowerCase() === category.toLowerCase()
            );
        }

        if (search) {
            const searchLower = search.toLowerCase();
            filteredCatalog = filteredCatalog.filter(
                item => item.name.toLowerCase().includes(searchLower) ||
                    item.brand.toLowerCase().includes(searchLower)
            );
        }

        res.json({
            success: true,
            catalog: filteredCatalog
        });
    } catch (error) {
        console.error("Error fetching catalog:", error);
        res.status(500).json({ success: false, message: "Failed to fetch catalog" });
    }
};

export const getCategoryGlobalSearch = async (req, res) => {
    try {
        const { category, search, lat, lng, radius = 5 } = req.query;

        if (!category) {
            return res.status(400).json({ success: false, message: "Category is required" });
        }

        // Handle singular/plural mismatch (e.g. "Medicines" vs "Medicine")
        let searchCategory = category;
        if (category.toLowerCase().endsWith('s')) {
            searchCategory = category.slice(0, -1);
        }

        const medQuery = {
            category: { $regex: new RegExp(searchCategory, "i") },
            isAvailable: true,
            quantity: { $gt: 0 }
        };

        if (search) {
            medQuery.name = { $regex: search, $options: "i" };
        }

        // Find medicines and populate store info
        let storeMedicines = await Medicine.find(medQuery)
            .populate("storeId", "storeName storeAddress latitude longitude isStoreOpen")
            .lean();

        // Fallback: If no results found in this category, search globally for the name
        // This ensures the "same concept" as the main dashboard search
        if (storeMedicines.length === 0 && search) {
            const globalQuery = {
                name: { $regex: search, $options: "i" },
                isAvailable: true,
                quantity: { $gt: 0 }
            };
            storeMedicines = await Medicine.find(globalQuery)
                .populate("storeId", "storeName storeAddress latitude longitude isStoreOpen")
                .lean();
        }

        // 3. If location provided, filter/sort by distance and include distance info
        let proximalMedicines = [];
        if (lat && lng) {
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lng);

            proximalMedicines = storeMedicines.filter(med => med.storeId).map(med => {
                let distance = null;
                if (med.storeId.latitude && med.storeId.longitude) {
                    const dist = calculateDistance(
                        latitude,
                        longitude,
                        med.storeId.latitude,
                        med.storeId.longitude
                    );
                    distance = parseFloat(dist.toFixed(2));
                }
                return { ...med, distance };
            }).filter(med => med.distance === null || med.distance <= parseFloat(radius))
                .sort((a, b) => {
                    if (a.distance === null) return 1;
                    if (b.distance === null) return -1;
                    return a.distance - b.distance;
                });
        } else {
            proximalMedicines = storeMedicines;
        }

        res.json({
            success: true,
            storeMedicines: proximalMedicines
        });
    } catch (error) {
        console.error("Error in getCategoryGlobalSearch:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


