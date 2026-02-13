import ChatRoom from "../models/ChatRoom.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

// GET USER CHAT ROOMS
export const getUserChatRooms = async (req, res) => {
    try {
        const userId = req.user.id;
        const chatRooms = await ChatRoom.find({ user: userId })
            .populate("store", "name storeName")
            .populate("lastMessage")
            .sort({ updatedAt: -1 });

        res.status(200).json(chatRooms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch chat rooms" });
    }
};

// GET STORE CHAT ROOMS
export const getStoreChatRooms = async (req, res) => {
    try {
        const storeId = req.user.id;
        const chatRooms = await ChatRoom.find({ store: storeId })
            .populate("user", "name email")
            .populate("lastMessage")
            .sort({ updatedAt: -1 });

        res.status(200).json(chatRooms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch chat rooms" });
    }
};

// GET MESSAGE HISTORY
export const getMessageHistory = async (req, res) => {
    try {
        const { roomId } = req.params;
        const messages = await Message.find({ chatRoom: roomId })
            .sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch messages" });
    }
};

// START OR GET CHAT ROOM
export const startChat = async (req, res) => {
    try {
        const userId = req.user.id;
        const { storeId } = req.body;

        if (!storeId) {
            return res.status(400).json({ message: "Store ID is required" });
        }

        // Check if room already exists
        let chatRoom = await ChatRoom.findOne({ user: userId, store: storeId });

        if (!chatRoom) {
            chatRoom = await ChatRoom.create({ user: userId, store: storeId });
        }

        res.status(200).json(chatRoom);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to start chat" });
    }
};
