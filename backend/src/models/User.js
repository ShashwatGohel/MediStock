import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Common
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "store"],
      required: true,
    },

    // User-specific
    phone: String,
    city: String,
    savedStores: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Store-specific
    storeName: String,
    storeAddress: String,
    licenseNumber: String,

    // Geolocation for stores
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: [Number], // [longitude, latitude]
    },
    latitude: Number,
    longitude: Number,
    isStoreOpen: {
      type: Boolean,
      default: true,
    },
    operatingHours: {
      type: String,
      default: "9:00 AM - 9:00 PM",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Create geospatial index for location-based queries
userSchema.index({ location: "2dsphere" });

export default mongoose.model("User", userSchema);

