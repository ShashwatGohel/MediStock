import VaultItem from "../models/VaultItem.js";

export const addVaultItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { medicineName, dosage, frequency, timings, notes, startDate, endDate } = req.body;

        const newItem = await VaultItem.create({
            userId,
            medicineName,
            dosage,
            frequency,
            timings,
            notes,
            startDate,
            endDate
        });

        res.status(201).json({ success: true, item: newItem });
    } catch (error) {
        console.error("Error adding vault item:", error);
        res.status(500).json({ success: false, message: "Failed to add medication to vault" });
    }
};

export const getVaultItems = async (req, res) => {
    try {
        const userId = req.user.id;
        const items = await VaultItem.find({ userId }).sort({ createdAt: -1 });
        res.json({ success: true, items });
    } catch (error) {
        console.error("Error fetching vault items:", error);
        res.status(500).json({ success: false, message: "Failed to fetch vault items" });
    }
};

export const deleteVaultItem = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const item = await VaultItem.findOneAndDelete({ _id: id, userId });
        if (!item) return res.status(404).json({ success: false, message: "Item not found" });

        res.json({ success: true, message: "Medication removed from vault" });
    } catch (error) {
        console.error("Error deleting vault item:", error);
        res.status(500).json({ success: false, message: "Failed to remove medication" });
    }
};

export const updateVaultItem = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const updates = req.body;

        const item = await VaultItem.findOneAndUpdate(
            { _id: id, userId },
            { $set: updates },
            { new: true }
        );

        if (!item) return res.status(404).json({ success: false, message: "Item not found" });

        res.json({ success: true, item });
    } catch (error) {
        console.error("Error updating vault item:", error);
        res.status(500).json({ success: false, message: "Failed to update medication" });
    }
};
