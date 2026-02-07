import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bell, ArrowLeft, Trash, ShoppingBag, Zap, Info,
    Eye, Check, Trash2, BellOff, Settings
} from "lucide-react";

const NotificationsPage = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([
        { id: 1, title: "Order Confirmed", message: "Your order from City Pharma is confirmed.", time: "2 mins ago", type: "order", read: false },
        { id: 2, title: "Price Drop!", message: "Dolo 650 is now 10% cheaper at Wellness Meds.", time: "1 hour ago", type: "deal", read: false },
        { id: 3, title: "Prescription Approved", message: "Your uploaded Rx has been verified.", time: "3 hours ago", type: "health", read: true },
        { id: 4, title: "Welcome back!", message: "Check out new pharmacies added in your area.", time: "1 day ago", type: "system", read: true },
    ]);

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const deleteNotif = (id) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-['Outfit'] pb-20">
            {/* Context Header */}
            <div className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 p-4">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-white/5 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-white" />
                        </button>
                        <h1 className="text-xl font-bold text-white">Notifications</h1>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="max-w-3xl mx-auto p-4 space-y-6">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 font-medium">
                        {notifications.filter(n => !n.read).length} Unread Notifications
                    </p>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={markAllRead}
                            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-wider"
                        >
                            Mark all read
                        </button>
                        <button
                            onClick={clearAll}
                            className="text-xs font-bold text-gray-500 hover:text-red-400 transition-colors uppercase tracking-wider"
                        >
                            Clear all
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {notifications.length > 0 ? (
                            notifications.map((notif) => (
                                <motion.div
                                    key={notif.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`p-5 rounded-2xl border transition-all group relative overflow-hidden ${!notif.read
                                            ? 'bg-emerald-500/[0.03] border-emerald-500/20 shadow-[0_4px_20px_rgba(16,185,129,0.05)]'
                                            : 'bg-[#121212] border-white/5 hover:border-white/10'
                                        }`}
                                >
                                    <div className="flex gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${notif.type === 'order' ? 'bg-blue-500/10 text-blue-400' :
                                                notif.type === 'deal' ? 'bg-amber-500/10 text-amber-400' :
                                                    'bg-emerald-500/10 text-emerald-400'
                                            }`}>
                                            {notif.type === 'order' ? <ShoppingBag className="w-6 h-6" /> :
                                                notif.type === 'deal' ? <Zap className="w-6 h-6" /> :
                                                    <Info className="w-6 h-6" />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className={`font-bold text-base mb-1 ${!notif.read ? 'text-white' : 'text-gray-300'}`}>
                                                        {notif.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 leading-relaxed">
                                                        {notif.message}
                                                    </p>
                                                </div>
                                                <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest whitespace-nowrap pt-1">
                                                    {notif.time}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-3 mt-4">
                                                <button
                                                    onClick={() => navigate(notif.type === 'order' ? '/past-orders' : '#')}
                                                    className="px-4 py-2 bg-emerald-500 text-black text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-emerald-400 transition-all active:scale-95 shadow-lg shadow-emerald-500/10"
                                                >
                                                    <Eye className="w-4 h-4" /> View Details
                                                </button>
                                                <button
                                                    onClick={() => deleteNotif(notif.id)}
                                                    className="p-2.5 bg-white/5 text-gray-400 rounded-xl hover:bg-red-500/20 hover:text-red-400 transition-all active:scale-95 border border-white/5"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {!notif.read && (
                                        <div className="absolute top-0 right-0 w-1.5 h-full bg-emerald-500" />
                                    )}
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="py-20 text-center"
                            >
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <BellOff className="w-10 h-10 text-gray-600" />
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">No notifications yet</h2>
                                <p className="text-gray-500 max-w-xs mx-auto text-sm">
                                    We'll notify you when there are updates about your orders or health tools.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;
