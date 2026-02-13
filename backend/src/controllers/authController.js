import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOTP } from "../utils/emailService.js";
import User from "../models/User.js";

// SIGNUP
const signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      city,
      storeName,
      storeAddress,
      licenseNumber,
      latitude,
      longitude,
    } = req.body;

    // Basic validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (role === "store") {
      if (!storeName || !storeAddress || !licenseNumber) {
        return res.status(400).json({
          message: "Store details are required for store owner",
        });
      }
      if (!latitude || !longitude) {
        return res.status(400).json({
          message: "Location is required for store owner",
        });
      }
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user data
    const userData = {
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      city,
      storeName: role === "store" ? storeName : undefined,
      storeAddress: role === "store" ? storeAddress : undefined,
      licenseNumber: role === "store" ? licenseNumber : undefined,
    };

    // Add location data for store owners
    if (role === "store" && latitude && longitude) {
      userData.latitude = parseFloat(latitude);
      userData.longitude = parseFloat(longitude);
      userData.location = {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
    }

    // Create user
    const user = await User.create(userData);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    // Send OTP
    const emailSent = await sendOTP(user.email, otp);

    if (!emailSent) {
      // If email fails, we might still want to proceed but notify user
      console.error("Failed to send OTP email to", user.email);
    }

    res.status(201).json({
      message: "Signup successful. Please verify your email with the OTP sent.",
      email: user.email,
      requiresVerification: true
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Signup failed" });
  }
};

// VERIFY OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Account already verified" });
    }

    if (user.otp !== otp || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Mark as verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    // Generate Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Email verified successfully",
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Verification failed" });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
};

export { signup, login, verifyOTP };
