import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    History, ArrowLeft, Search, Filter, Calendar,
    MapPin, ChevronRight, Package, Clock3, CheckCircle2,
    XCircle, AlertCircle, Phone, Loader, Trash2, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URLS } from "../api";

const PastOrdersPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URLS.ORDERS}/user-orders`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setOrders(data.orders);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm("Delete this order from history?")) return;
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URLS.ORDERS}/${orderId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                fetchOrders();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case "pending": return { icon: Clock3, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", label: "PENDING" };
            case "approved": return { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", label: "APPROVED" };
            case "confirmed": return { icon: Package, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20", label: "DELIVERED" };
            case "cancelled": return { icon: XCircle, color: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/20", label: "CANCELLED" };
            default: return { icon: AlertCircle, color: "text-gray-400", bg: "bg-gray-400/10", border: "border-gray-400/20", label: "UNKNOWN" };
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesFilter = filter === "all" || order.status === filter;
        const matchesSearch = order.storeId?.storeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.items.some(item => item.medicineName.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-['Outfit'] relative pb-20">
            {/* 🔮 Background Ambience */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            {/* 🧭 Navbar */}
            <nav className="sticky top-0 z-50 w-full bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/user-dashboard')}
                            className="p-2 hover:bg-white/5 rounded-full transition-colors group"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white" />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                                <History className="text-white w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white">
                                Past Orders
                            </span>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="relative z-10 max-w-5xl mx-auto px-4 py-12">
                <header className="mb-12">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-4">Order History</h1>
                            <p className="text-gray-400 max-w-xl">
                                Review your previous medicine requests, track ongoing orders, and quickly reorder from your favorite pharmacies.
                            </p>
                        </div>
                        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                            {["all", "pending", "approved", "confirmed"].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setFilter(t)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${filter === t ? 'bg-emerald-500 text-black' : 'text-gray-400 hover:text-white'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </header>

                {/* 🔍 Search & Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by pharmacy or medicine..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#121212] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all shadow-xl"
                        />
                    </div>
                    <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 flex items-center gap-4 shadow-xl">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Orders</p>
                            <p className="text-2xl font-black text-white">{orders.length}</p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center py-32">
                        <Loader className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                        <p className="text-gray-500 animate-pulse">Retrieving your medical archive...</p>
                    </div>
                ) : filteredOrders.length > 0 ? (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 gap-6"
                    >
                        {filteredOrders.map((order) => {
                            const status = getStatusInfo(order.status);
                            return (
                                <motion.div
                                    key={order._id}
                                    variants={item}
                                    className="group bg-[#121212] border border-white/5 rounded-3xl overflow-hidden hover:border-white/20 transition-all duration-300 shadow-xl"
                                >
                                    <div className="p-6 md:p-8">
                                        <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                                            <div className="flex gap-5">
                                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors border border-white/5">
                                                    <MapPin className="w-8 h-8" />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors mb-1">
                                                        {order.storeId?.storeName || "Unknown Pharmacy"}
                                                    </h3>
                                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1.5">
                                                            <Calendar className="w-4 h-4" />
                                                            {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </span>
                                                        <span className="w-1 h-1 bg-gray-700 rounded-full" />
                                                        <span className="flex items-center gap-1.5 uppercase font-bold tracking-tighter text-[10px]">
                                                            ID: {order._id.slice(-6)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`self-start px-4 py-2 rounded-xl text-xs font-black border flex items-center gap-2 ${status.bg} ${status.color} ${status.border}`}>
                                                <status.icon className="w-4 h-4" />
                                                {status.label}
                                            </div>
                                        </div>

                                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-8">
                                            <div className="space-y-4">
                                                {order.items.map((item, i) => (
                                                    <div key={i} className="flex justify-between items-center text-sm">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-2 h-2 bg-emerald-500/40 rounded-full" />
                                                            <span className="font-bold text-gray-300">{item.medicineName}</span>
                                                            <span className="text-xs text-gray-500 px-2 py-0.5 bg-white/5 rounded">x{item.quantity}</span>
                                                        </div>
                                                        <span className="font-mono text-white">₹{(item.price * item.quantity).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
                                                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Grand Total</span>
                                                <span className="text-2xl font-black text-emerald-400">₹{order.totalAmount.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                onClick={() => navigate(`/store/${order.storeId?._id}`)}
                                                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-sm transition-all border border-white/5 flex items-center gap-2"
                                            >
                                                Buy Again <ArrowRight className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => window.location.href = `tel:${order.storeId?.phone}`}
                                                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-sm transition-all border border-white/5 flex items-center gap-2"
                                            >
                                                <Phone className="w-4 h-4" /> Contact
                                            </button>
                                            <div className="flex-1" />
                                            {(order.status === 'confirmed' || order.status === 'cancelled') && (
                                                <button
                                                    onClick={() => handleDeleteOrder(order._id)}
                                                    className="p-3 text-gray-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                                    title="Delete from history"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                ) : (
                    <div className="text-center py-32 bg-[#121212] rounded-[40px] border border-white/5 shadow-2xl">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Package className="w-12 h-12 text-gray-600 opacity-20" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-400 mb-2">No records found</h3>
                        <p className="text-gray-600 max-w-sm mx-auto mb-8">
                            It looks like you haven't placed any orders yet or your current filters are too strict.
                        </p>
                        <button
                            onClick={() => navigate('/user-dashboard')}
                            className="bg-emerald-500 hover:bg-emerald-400 text-black px-10 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20"
                        >
                            Explore Pharmacies
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PastOrdersPage;
