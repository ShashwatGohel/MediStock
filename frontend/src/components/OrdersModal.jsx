import { useState, useEffect } from "react";
import { X, ShoppingCart, Calendar, User, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URLS } from "../api";
import CountdownTimer from "./CountdownTimer";

const OrdersModal = ({ isOpen, onClose }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchTodaysOrders();
        }
    }, [isOpen]);

    const fetchTodaysOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URLS.ORDERS}/store-orders`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                // Filter for today's orders
                const today = new Date();
                const todayStr = today.toISOString().split('T')[0];
                const todaysOrders = data.orders.filter(order => {
                    const orderDateStr = new Date(order.createdAt).toISOString().split('T')[0];
                    return orderDateStr === todayStr;
                });
                setOrders(todaysOrders);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: "text-yellow-400 bg-yellow-400/10",
            approved: "text-blue-400 bg-blue-400/10",
            confirmed: "text-emerald-400 bg-emerald-400/10",
            cancelled: "text-red-400 bg-red-400/10"
        };
        return colors[status] || "text-gray-400 bg-gray-400/10";
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                            <div className="bg-[#121212] border-b border-white/5 p-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <ShoppingCart className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Today's Orders</h2>
                                        <p className="text-sm text-gray-400 mt-0.5">{orders.length} orders today</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <p className="text-center text-gray-500 py-12">No orders today</p>
                                ) : (
                                    <div className="space-y-3">
                                        {orders.map((order) => (
                                            <div
                                                key={order._id}
                                                className="bg-white/5 rounded-xl p-4 border border-white/5"
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="text-white font-semibold">Order #{order._id.slice(-6)}</h3>
                                                        <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                                                            <User className="w-3 h-3" />
                                                            {order.userId?.name || "Unknown User"}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold text-emerald-400">₹{order.totalAmount.toFixed(2)}</p>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                                                            {order.status.toUpperCase()}
                                                        </span>
                                                        {order.status === 'approved' && (
                                                            <div className="mt-2 text-xs font-bold text-blue-400 flex items-center justify-end gap-2">
                                                                <span>ENDS IN:</span>
                                                                <CountdownTimer targetDate={order.preservationExpiresAt} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    {order.items.map((item, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                                                            <Package className="w-3 h-3" />
                                                            <span>{item.medicineName} × {item.quantity}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default OrdersModal;
