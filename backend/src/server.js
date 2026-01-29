import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import medicineRoutes from "./routes/medicineRoutes.js";
import billRoutes from "./routes/billRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Connect Database
connectDB();

const app = express();


// // 🌍 CORS CONFIG (IMPORTANT)
// const allowedOrigins = [
//   "http://localhost:5173", // Local Vite frontend
//   "https://medi-stock-shashwat-gohel-s-projects.vercel.app",
//   "https://medi-stock-theta.vercel.app" // 🔥 REPLACE with your actual Vercel URL
// ];   

// app.use(cors({
//   origin: function (origin, callback) {
//     // Allow requests with no origin (like Postman, mobile apps)
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.indexOf(origin) === -1) {
//       return callback(new Error("CORS not allowed for this origin"), false);
//     }
//     return callback(null, true);
//   },
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true
// }));
const allowedOrigins = [
  "http://localhost:5173",
  "https://medi-stock-shashwat-gohel-s-projects.vercel.app",
  "https://medi-stock-theta.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || origin.includes("vercel.app")) {
      return callback(null, true);
    }

    return callback(new Error("CORS not allowed for this origin"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));


// Handle preflight requests
app.options("*", cors());


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/stores", storeRoutes);


// Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({ message: "🚀 MediStock Backend Running" });
});


// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});


// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server Error" });
});


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
