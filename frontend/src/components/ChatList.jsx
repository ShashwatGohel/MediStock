import React, { useState, useEffect } from "react";
import { MessageSquare, User, Store, Search, Loader2 } from "lucide-react";
import { API_URLS } from "../api";

const ChatList = ({ role, onSelectChat }) => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const endpoint = role === "user" ? "/user/rooms" : "/store/rooms";
                const response = await fetch(`${API_URLS.CHAT || "http://localhost:5005/api/chat"}${endpoint}`, {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                });
                const data = await response.json();
                setRooms(data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch rooms:", error);
                setLoading(false);
            }
        };

        fetchRooms();
    }, [role]);

    const filteredRooms = rooms.filter(room => {
        const name = role === "user" ? room.store?.storeName : room.user?.name;
        return name?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="flex flex-col h-full bg-[#121212] border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-white/5">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-500" />
                    Messages
                </h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-['Outfit']"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="p-10 text-center text-gray-500 flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <p className="text-xs font-['Outfit']">Loading chats...</p>
                    </div>
                ) : filteredRooms.length === 0 ? (
                    <div className="p-10 text-center text-gray-500 opacity-50 flex flex-col items-center gap-3">
                        <MessageSquare className="w-10 h-10" />
                        <p className="text-sm font-['Outfit']">No conversations yet</p>
                    </div>
                ) : (
                    filteredRooms.map((room) => {
                        const recipient = role === "user" ? room.store : room.user;
                        const unreadCount = role === "user" ? room.unreadCountUser : room.unreadCountStore;

                        return (
                            <button
                                key={room._id}
                                onClick={() => onSelectChat(room)}
                                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-all text-left border-b border-white/5 last:border-0"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 flex-shrink-0">
                                        {role === "user" ? <Store className="w-6 h-6 text-emerald-400" /> : <User className="w-6 h-6 text-emerald-400" />}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-white font-bold text-sm truncate font-['Outfit']">
                                            {role === "user" ? recipient.storeName : recipient.name}
                                        </h4>
                                        <p className="text-xs text-gray-500 truncate font-['Outfit']">
                                            {room.lastMessage?.content || "Start a new chat"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                    <span className="text-[10px] text-gray-500 font-['Outfit']">
                                        {room.updatedAt && new Date(room.updatedAt).toLocaleDateString()}
                                    </span>
                                    {unreadCount > 0 && (
                                        <span className="w-5 h-5 bg-emerald-500 text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ChatList;
