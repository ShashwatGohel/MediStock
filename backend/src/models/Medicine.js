import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
    {
        storeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // store owner
            required: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        brand: {
            type: String,
            trim: true,
        },

        category: {
            type: String, // pain, fever, antibiotic etc.
        },

        quantity: {
            type: Number,
            required: true,
            min: 0,
        },

        price: {
            type: Number,
            required: true,
        },

        expiryDate: {
            type: Date,
        },

        isAvailable: {
            type: Boolean,
            default: true,
        },

        reservedQuantity: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Medicine", medicineSchema);
