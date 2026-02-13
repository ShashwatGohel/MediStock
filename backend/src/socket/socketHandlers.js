import ChatRoom from "../models/ChatRoom.js";
import Message from "../models/Message.js";

const socketHandlers = (io) => {
    io.on("connection", (socket) => {
        console.log(`New connection: ${socket.id}`);

        socket.on("join_room", (roomId) => {
            socket.join(roomId);
            console.log(`Socket ${socket.id} joined room ${roomId}`);
        });

        socket.on("send_message", async (data) => {
            const { chatRoomId, senderId, content, messageType } = data;

            try {
                // Save message to database
                const newMessage = await Message.create({
                    chatRoom: chatRoomId,
                    sender: senderId,
                    content,
                    messageType: messageType || "text"
                });

                // Update chat room last message and unread counts
                const chatRoom = await ChatRoom.findById(chatRoomId);
                if (chatRoom) {
                    chatRoom.lastMessage = newMessage._id;

                    // Increment unread count for the recipient
                    if (senderId.toString() === chatRoom.user.toString()) {
                        chatRoom.unreadCountStore += 1;
                    } else {
                        chatRoom.unreadCountUser += 1;
                    }

                    await chatRoom.save();
                }

                // Emit to the room
                io.to(chatRoomId).emit("receive_message", newMessage);

                // Also emit notification to the recipient for the chat list update
                const recipientId = senderId.toString() === chatRoom.user.toString() ? chatRoom.store : chatRoom.user;
                io.to(recipientId.toString()).emit("new_message_notification", {
                    chatRoomId,
                    lastMessage: newMessage
                });

            } catch (error) {
                console.error("Socket send_message error:", error);
            }
        });

        socket.on("mark_read", async ({ chatRoomId, userId, role }) => {
            try {
                const chatRoom = await ChatRoom.findById(chatRoomId);
                if (chatRoom) {
                    if (role === "user") {
                        chatRoom.unreadCountUser = 0;
                    } else {
                        chatRoom.unreadCountStore = 0;
                    }
                    await chatRoom.save();
                }
            } catch (error) {
                console.error("Socket mark_read error:", error);
            }
        });

        socket.on("disconnect", () => {
            console.log(`Disconnected: ${socket.id}`);
        });
    });
};

export default socketHandlers;
