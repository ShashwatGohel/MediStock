import express from "express";
import { addReview, getStoreReviews, deleteReview } from "../controllers/reviewController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/store/:storeId", getStoreReviews);
router.post("/add", authMiddleware, addReview);
router.delete("/:id", authMiddleware, deleteReview);

export default router;
