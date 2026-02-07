import mongoose from "mongoose";

const vaultItemSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        medicineName: {
            type: String,
            required: true,
            trim: true,
        },
        dosage: {
            type: String, // e.g., "500mg", "1 tablet"
            required: true,
        },
        frequency: {
            type: String, // e.g., "Daily", "Twice a day"
            required: true,
        },
        timings: {
            type: [String], // ["Morning", "Afternoon", "Evening", "Night"]
            default: [],
        },
        startDate: {
            type: Date,
            default: Date.now,
        },
        endDate: {
            type: Date,
        },
        notes: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        }
    },
    { timestamps: true }
);

export default mongoose.model("VaultItem", vaultItemSchema);
