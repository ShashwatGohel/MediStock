import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    getUserChatRooms,
    getStoreChatRooms,
    getMessageHistory,
    startChat
} from "../controllers/chatController.js";

const router = express.Router();

router.get("/user/rooms", protect, getUserChatRooms);
router.get("/store/rooms", protect, getStoreChatRooms);
router.get("/history/:roomId", protect, getMessageHistory);
router.post("/start", protect, startChat);

export default router;
