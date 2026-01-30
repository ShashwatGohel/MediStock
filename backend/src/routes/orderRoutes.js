import express from "express";
import {
    createOrder,
    getUserOrders,
    getStoreOrders,
    updateOrderStatus,
    deleteOrder
} from "../controllers/orderController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/request", authMiddleware, createOrder);
router.get("/user-orders", authMiddleware, getUserOrders);
router.get("/store-orders", authMiddleware, getStoreOrders);
router.patch("/:id/status", authMiddleware, updateOrderStatus);
router.delete("/:id", authMiddleware, deleteOrder);

export default router;
