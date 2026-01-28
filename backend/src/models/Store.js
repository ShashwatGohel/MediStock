import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        storeName: {
            type: String,
            required: true,
        },
        storeAddress: {
            type: String,
            required: true,
        },
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true,
            },
        },
        latitude: {
            type: Number,
            required: true,
        },
        longitude: {
            type: Number,
            required: true,
        },
        isStoreOpen: {
            type: Boolean,
            default: true,
        },
        operatingHours: {
            type: String,
            default: "9:00 AM - 9:00 PM",
        },
        phone: {
            type: String,
        },
        licenseNumber: {
            type: String,
        },
    },
    { timestamps: true }
);

// Create geospatial index for location-based queries
storeSchema.index({ location: "2dsphere" });

export default mongoose.model("Store", storeSchema);
