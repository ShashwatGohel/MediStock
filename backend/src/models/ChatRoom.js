import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Stores are also Users with role 'store'
        required: true
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },
    unreadCountUser: {
        type: Number,
        default: 0
    },
    unreadCountStore: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Ensure unique chat room per user-store pair
chatRoomSchema.index({ user: 1, store: 1 }, { unique: true });

const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);
export default ChatRoom;
