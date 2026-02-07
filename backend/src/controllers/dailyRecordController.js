import DailyRecord from "../models/DailyRecord.js";

// Get daily record history for a store
export const getDailyRecordHistory = async (req, res) => {
    try {
        const storeId = req.user.id;
        const limit = parseInt(req.query.limit) || 30;

        const records = await DailyRecord.find({ storeId })
            .sort({ date: -1 })
            .limit(limit);

        res.json({
            success: true,
            records
        });
    } catch (error) {
        console.error("Error fetching daily records:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch daily records",
            error: error.message
        });
    }
};

// Get specific day's record
export const getDailyRecordByDate = async (req, res) => {
    try {
        const storeId = req.user.id;
        const { date } = req.params;

        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        const record = await DailyRecord.findOne({
            storeId,
            date: targetDate
        });

        if (!record) {
            return res.status(404).json({
                success: false,
                message: "No record found for this date"
            });
        }

        res.json({
            success: true,
            record
        });
    } catch (error) {
        console.error("Error fetching daily record:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch daily record",
            error: error.message
        });
    }
};

// Helper function to update daily record (called internally)
export const updateDailyRecord = async (storeId, updates) => {
    try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const record = await DailyRecord.findOneAndUpdate(
            { storeId, date: startOfToday },
            { $inc: updates },
            { upsert: true, new: true }
        );

        return record;
    } catch (error) {
        console.error("Error updating daily record:", error);
        throw error;
    }
};
