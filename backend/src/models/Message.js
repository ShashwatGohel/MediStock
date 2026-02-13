import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    chatRoom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ChatRoom",
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true
    },
    messageType: {
        type: String,
        enum: ["text", "image", "order"],
        default: "text"
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);
export default Message;
