import mongoose from "mongoose";

const visitSchema = new mongoose.Schema(
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

        count: {
            type: Number,
            default: 1,
        },
    },
    { timestamps: true }
);

// Create compound index to ensure one document per store per day
visitSchema.index({ storeId: 1, date: 1 }, { unique: true });

export default mongoose.model("Visit", visitSchema);
