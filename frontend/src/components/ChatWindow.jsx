import React, { useState, useEffect, useRef } from "react";
import { Send, X, User, Store, Loader2, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import socket from "../utils/socket";
import { API_URLS } from "../api";

const ChatWindow = ({ roomId, recipientId, recipientName, recipientRole, currentUser, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await fetch(`${API_URLS.CHAT}/history/${roomId}`, {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                });
                const data = await response.json();
                setMessages(data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch messages:", error);
                setLoading(false);
            }
        };

        if (roomId) {
            fetchMessages();

            // Connect and Join Room
            if (!socket.connected) socket.connect();
            socket.emit("join_room", roomId);

            // Listen for new messages
            socket.on("receive_message", (message) => {
                setMessages((prev) => [...prev, message]);
            });

            // Mark as read
            socket.emit("mark_read", {
                chatRoomId: roomId,
                userId: currentUser.id,
                role: currentUser.role
            });
        }

        return () => {
            socket.off("receive_message");
        };
    }, [roomId, currentUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageData = {
            chatRoomId: roomId,
            senderId: currentUser.id,
            content: newMessage,
            messageType: "text"
        };

        socket.emit("send_message", messageData);
        setNewMessage("");
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="flex flex-col h-[500px] w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        {recipientRole === "store" ? <Store className="w-5 h-5 text-emerald-400" /> : <User className="w-5 h-5 text-emerald-400" />}
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">{recipientName}</h3>
                        <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Online</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-gray-400" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <p className="text-xs">Loading conversation...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-3 opacity-50">
                        <MessageSquare className="w-12 h-12" />
                        <p className="text-sm">Start a conversation with {recipientName}</p>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex ${msg.sender === currentUser.id ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === currentUser.id
                                ? "bg-emerald-500 text-black rounded-tr-none"
                                : "bg-white/10 text-white rounded-tl-none border border-white/5"
                                }`}>
                                {msg.content}
                                <div className={`text-[10px] mt-1 ${msg.sender === currentUser.id ? "text-black/60" : "text-gray-500"}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-white/5">
                <div className="relative flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-3 bg-emerald-500 text-black rounded-xl hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50 disabled:grayscale"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default ChatWindow;
