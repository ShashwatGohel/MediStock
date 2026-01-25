import express from "express";
import {
    createBill,
    getDailyStats,
    getStoreBills,
    incrementVisit
} from "../controllers/billController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createBill);
router.get("/daily-stats", authMiddleware, getDailyStats);
router.get("/my-bills", authMiddleware, getStoreBills);
router.post("/increment-visit", incrementVisit); // No auth - called from public pages

export default router;
