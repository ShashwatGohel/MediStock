import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        storeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Stores are also users with role 'store'
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

// Ensure a user can only review a store once
reviewSchema.index({ userId: 1, storeId: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
