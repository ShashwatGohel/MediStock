import express from "express";
import { getDailyRecordHistory, getDailyRecordByDate } from "../controllers/dailyRecordController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get daily record history
router.get("/history", protect, getDailyRecordHistory);

// Get specific day's record
router.get("/:date", protect, getDailyRecordByDate);

export default router;
