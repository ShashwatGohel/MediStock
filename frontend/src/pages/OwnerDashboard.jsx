import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    LayoutDashboard, Package, TrendingUp, AlertTriangle,
    Settings, LogOut, Moon, Sun, Search, Plus, FileText,
    Truck, DollarSign, Users, Eye, ShieldCheck, HelpCircle,
    ChevronRight, ArrowUpRight, ArrowDownRight, Bell, Store, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const OwnerDashboard = () => {
    const navigate = useNavigate();
    const [storeStatus, setStoreStatus] = useState(true); // true = Open, false = Closed
    const [ownerName, setOwnerName] = useState("Partner");

    useEffect(() => {
        try {
            // Fetch owner details from local storage or API
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                const user = JSON.parse(storedUser);
                if (user && user.name) {
                    setOwnerName(user.name);
                }
            }
        } catch (error) {
            console.error("Error parsing user data:", error);
        }
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const stats = [
        { title: "Total Sales", value: "₹24,500", change: "+12%", isPositive: true, icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        { title: "Orders Today", value: "45", change: "-5%", isPositive: false, icon: Package, color: "text-blue-400", bg: "bg-blue-500/10" },
        { title: "Low Stock", value: "8 Items", change: "Urgent", isPositive: false, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
        { title: "Profile Visits", value: "1,200", change: "+25%", isPositive: true, icon: Eye, color: "text-purple-400", bg: "bg-purple-500/10" },
    ];

    const stockAlerts = [
        { id: 1, name: "Paracetamol 500mg", status: "Out of Stock", type: "critical" },
        { id: 2, name: "Cetirizine 10mg", status: "Low Stock (5 left)", type: "warning" },
        { id: 3, name: "Insulin Glargine", status: "Expires in 2 days", type: "warning" },
    ];

    const trendingSearches = [
        { name: "Dolo 650", count: 450, trend: "up" },
        { name: "Azithromycin", count: 320, trend: "up" },
        { name: "ORS Packets", count: 210, trend: "stable" },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-['Outfit'] selection:bg-indigo-500/30 overflow-x-hidden relative">

            {/* 🌌 Background Ambience */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]" />
            </div>

            {/* 🧭 Navbar */}
            <nav className="sticky top-0 z-50 w-full bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                            <Store className="text-white w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">
                            Medi<span className="text-indigo-500">Stock</span> <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-400 ml-2">Partner</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                            onClick={() => setStoreStatus(!storeStatus)}>
                            <div className={`w-2.5 h-2.5 rounded-full ${storeStatus ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-red-500"}`}></div>
                            <span className={`text-sm font-semibold ${storeStatus ? "text-green-400" : "text-red-400"}`}>
                                {storeStatus ? "Store Open" : "Store Closed"}
                            </span>
                        </div>
                        <div className="h-8 w-px bg-white/10 mx-1"></div>
                        <button onClick={handleLogout} className="text-gray-400 hover:text-white transition-colors">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </nav>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* 👋 Control Header */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-4"
                >
                    <div>
                        <p className="text-gray-400 text-sm font-medium mb-1">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <h1 className="text-3xl sm:text-4xl font-bold text-white">
                            Good Morning, {ownerName ? ownerName.split(" ")[0] : "Partner"} ☀️
                        </h1>
                        <p className="text-gray-400 mt-1">Here's what's happening in your pharmacy today.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-semibold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add Medicines
                        </button>
                    </div>
                </motion.div>

                {/* 📊 Store Health Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-[#121212] border border-white/5 p-5 rounded-2xl hover:border-white/10 transition-colors group">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <span className={`flex items-center text-xs font-bold px-2 py-1 rounded bg-white/5 ${stat.isPositive ? "text-green-400" : "text-red-400"}`}>
                                    {stat.change} {stat.isPositive ? <ArrowUpRight className="w-3 h-3 ml-1" /> : <ArrowDownRight className="w-3 h-3 ml-1" />}
                                </span>
                            </div>
                            <h3 className="text-gray-400 text-sm font-medium">{stat.title}</h3>
                            <p className="text-2xl font-bold text-white mt-1 group-hover:scale-105 transition-transform origin-left">{stat.value}</p>
                        </div>
                    ))}
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* 📦 Inventory & Medicine Management */}
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2 space-y-6"
                    >
                        {/* Search & Quick Inventory Actions */}
                        <div className="bg-[#121212] border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    Inventory Overview
                                </h2>
                                <button className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">View Full Inventory</button>
                            </div>

                            <div className="relative mb-6">
                                <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search inventory to update stock or price..."
                                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-gray-600"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[
                                    { label: "Update Pricing", icon: DollarSign, color: "text-green-400" },
                                    { label: "Expiry Check", icon: Clock, color: "text-orange-400" },
                                    { label: "New Batch", icon: Package, color: "text-blue-400" },
                                ].map((item, i) => (
                                    <button key={i} className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group">
                                        <item.icon className={`w-6 h-6 ${item.color} group-hover:scale-110 transition-transform`} />
                                        <span className="text-sm font-medium text-gray-300">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 📈 Search Demand Insights */}
                        <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <TrendingUp className="w-32 h-32 text-indigo-500" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2 relative z-10">
                                <TrendingUp className="w-5 h-5 text-indigo-400" /> Market Insights
                            </h2>
                            <p className="text-sm text-gray-400 mb-6 relative z-10">Real-time demand in your area (5km radius)</p>

                            <div className="space-y-4 relative z-10">
                                {trendingSearches.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-black/20 p-3 rounded-lg border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-bold text-gray-500 w-6">#{idx + 1}</span>
                                            <span className="font-semibold text-white">{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm text-gray-400">{item.count} searches</span>
                                            <ArrowUpRight className="w-4 h-4 text-green-400" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column */}
                    <div className="space-y-6">

                        {/*  Stock Alerts */}
                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-[#121212] border border-white/5 rounded-2xl p-6"
                        >
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Bell className="w-5 h-5 text-orange-400" /> Action Required
                            </h2>
                            <div className="space-y-3">
                                {stockAlerts.map((alert) => (
                                    <div key={alert.id} className="p-3 rounded-lg bg-white/5 border border-white/5 flex items-start gap-3">
                                        <AlertTriangle className={`w-5 h-5 mt-0.5 ${alert.type === 'critical' ? 'text-red-500' : 'text-orange-400'}`} />
                                        <div>
                                            <h4 className="text-sm font-semibold text-white">{alert.name}</h4>
                                            <p className={`text-xs mt-1 ${alert.type === 'critical' ? 'text-red-400' : 'text-orange-400'}`}>
                                                {alert.status}
                                            </p>
                                        </div>
                                        <button className="ml-auto text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white transition-colors">
                                            Restock
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* ⚡ Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-[#121212] border border-white/5 rounded-2xl p-6"
                        >
                            <h2 className="text-xl font-bold text-white mb-4">Quick Shortcuts</h2>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: "Scan Bill", icon: FileText },
                                    { label: "Track Rider", icon: Truck },
                                    { label: "View Ledger", icon: DollarSign },
                                    { label: "Shop Profile", icon: Store },
                                ].map((action, i) => (
                                    <button key={i} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-colors text-left group">
                                        <action.icon className="w-5 h-5 text-gray-400 group-hover:text-indigo-400 mb-2 transition-colors" />
                                        <span className="text-sm font-medium text-gray-300 group-hover:text-white block">{action.label}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        {/* ⚙️ Support & Settings */}
                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-[#121212] border border-white/5 rounded-2xl p-6"
                        >
                            <h2 className="text-xl font-bold text-white mb-4">Support</h2>
                            <div className="space-y-2">
                                <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                                    <span className="flex items-center gap-3"><ShieldCheck className="w-4 h-4" /> Store Visibility & Trust</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                                <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                                    <span className="flex items-center gap-3"><Settings className="w-4 h-4" /> Account Settings</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                                <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                                    <span className="flex items-center gap-3"><HelpCircle className="w-4 h-4" /> Help Center</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>

                    </div>
                </div>

            </div>

        </div>
    );
};

export default OwnerDashboard;
