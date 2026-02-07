import mongoose from "mongoose";

const dailyRecordSchema = new mongoose.Schema(
    {
        storeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        totalSales: {
            type: Number,
            default: 0,
        },
        orderCount: {
            type: Number,
            default: 0,
        },
        billCount: {
            type: Number,
            default: 0,
        },
        visitCount: {
            type: Number,
            default: 0,
        },
        // Breakdown by source
        salesFromBills: {
            type: Number,
            default: 0,
        },
        salesFromOrders: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Create compound index to ensure one document per store per day
dailyRecordSchema.index({ storeId: 1, date: 1 }, { unique: true });

// Helper method to get or create today's record
dailyRecordSchema.statics.getOrCreateTodayRecord = async function (storeId) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    let record = await this.findOne({ storeId, date: startOfToday });

    if (!record) {
        record = await this.create({
            storeId,
            date: startOfToday,
            totalSales: 0,
            orderCount: 0,
            billCount: 0,
            visitCount: 0,
            salesFromBills: 0,
            salesFromOrders: 0,
        });
    }

    return record;
};

export default mongoose.model("DailyRecord", dailyRecordSchema);
