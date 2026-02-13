import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        storeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Store owner
            required: true,
        },
        items: [
            {
                medicineId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Medicine",
                    required: true,
                },
                medicineName: {
                    type: String,
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                price: {
                    type: Number,
                    required: true,
                },
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "confirmed", "cancelled"],
            default: "pending",
        },
        prescriptionImage: {
            type: String, // URL/Path to prescription image if uploaded
        },
        hiddenFromUser: {
            type: Boolean,
            default: false,
        },
        hiddenFromStore: {
            type: Boolean,
            default: false,
        },
        preservationTime: {
            type: Number, // in minutes
            default: 60,
            max: 60
        },
        preservationExpiresAt: {
            type: Date
        }
    },
    { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
