import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
    {
        storeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        billNumber: {
            type: String,
            required: true,
            unique: true,
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
                total: {
                    type: Number,
                    required: true,
                },
            },
        ],

        totalAmount: {
            type: Number,
            required: true,
        },

        paymentMethod: {
            type: String,
            enum: ["cash", "card", "upi"],
            default: "cash",
        },

        customerName: {
            type: String,
        },

        customerPhone: {
            type: String,
        },

        date: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Bill", billSchema);
