import Medicine from "../models/Medicine.js";

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


