import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ChevronLeft, Package, Clock, Calendar, CheckCircle2,
    XCircle, Clock3, AlertCircle, Phone, MapPin, Search
} from "lucide-react";
import { motion } from "framer-motion";

const MyOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch("https://medistock-3a3y.onrender.com/api/orders/user-orders", {
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

    const getStatusIcon = (status) => {
        switch (status) {
            case "pending": return <Clock3 className="w-4 h-4 text-yellow-500" />;
            case "approved": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case "confirmed": return <Package className="w-4 h-4 text-blue-500" />;
            case "cancelled": return <XCircle className="w-4 h-4 text-red-500" />;
            default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "pending": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
            case "approved": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case "confirmed": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case "cancelled": return "bg-red-500/10 text-red-500 border-red-500/20";
            default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
        }
    };

    const filteredOrders = orders.filter(order => filter === "all" || order.status === filter);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/user-dashboard")}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold">My Medicine Requests</h1>
                            <p className="text-gray-400 text-sm">Track your medicine requests and orders</p>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    {["all", "pending", "approved", "confirmed", "cancelled"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all border ${filter === tab
                                    ? "bg-emerald-500 text-black border-emerald-500"
                                    : "bg-white/5 text-gray-400 border-white/5 hover:border-white/10"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-gray-400">Loading your history...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-20 bg-[#121212] rounded-3xl border border-white/5">
                        <Package className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-bold text-gray-400">No requests found</h3>
                        <p className="text-gray-500 mt-2">You haven't made any medicine requests yet.</p>
                        <button
                            onClick={() => navigate("/user-dashboard")}
                            className="mt-6 bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2.5 rounded-xl font-bold transition-all"
                        >
                            Find Pharmacy
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={order._id}
                                className="bg-[#121212] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all"
                            >
                                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{order.storeId?.storeName || "Pharmacy"}</h3>
                                            <p className="text-gray-500 text-sm flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`self-start px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 ${getStatusStyle(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                        {order.status.toUpperCase()}
                                    </div>
                                </div>

                                <div className="space-y-3 bg-white/5 rounded-xl p-4">
                                    {order.items.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center text-sm">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-200">{item.medicineName}</span>
                                                <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                                            </div>
                                            <span className="font-bold text-white">₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                    <div className="border-t border-white/10 pt-3 mt-1 flex justify-between items-center">
                                        <span className="text-sm font-bold text-gray-400">Total Amount</span>
                                        <span className="text-lg font-bold text-emerald-400">₹{order.totalAmount}</span>
                                    </div>
                                </div>

                                {order.status === 'approved' && (
                                    <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-bold text-emerald-400">Ready for pickup</p>
                                            <p className="text-xs text-emerald-500/70 mt-1">
                                                The store has verified and kept your medicines aside. Please visit the store with your prescription to finalize the purchase.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={() => window.location.href = `tel:${order.storeId?.phone || "1234567890"}`}
                                        className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                                    >
                                        <Phone className="w-4 h-4 text-emerald-500" /> Call Store
                                    </button>
                                    <button
                                        onClick={() => navigate(`/store/${order.storeId?._id}`)}
                                        className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
