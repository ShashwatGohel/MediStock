const mongoose = require("mongoose");

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

    // Store-specific
    storeName: String,
    storeAddress: String,
    licenseNumber: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
