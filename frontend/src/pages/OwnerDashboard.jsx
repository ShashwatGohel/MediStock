import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    LayoutDashboard, Package, TrendingUp, AlertTriangle, MapPin,
    Settings, LogOut, Moon, Sun, Search, Plus, FileText,
    Truck, DollarSign, Users, Eye, ShieldCheck, HelpCircle,
    ChevronRight, ArrowUpRight, ArrowDownRight, Bell, Store, Clock,
    Building2, Tag, Trash2, Navigation, MapPinOff, Loader, Map
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AddMedicineModal from "../components/AddMedicineModal";
import CreateBillModal from "../components/CreateBillModal";
import { getCurrentLocation, getAddressFromCoords } from "../utils/locationUtils";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { ownerIcon } from "../utils/MapMarkerIcons";

// Helper component to update map view when location changes
const RecenterMap = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.setView([position.lat, position.lng], map.getZoom());
        }
    }, [position, map]);
    return null;
};

// OpenStreetMap/Leaflet doesn't use the same style array as Google Maps
// We use a dark tile layer instead to achieve the same look.

const OwnerDashboard = () => {
    const navigate = useNavigate();
    const [storeStatus, setStoreStatus] = useState(true);
    const [storeData, setStoreData] = useState(null);
    const [detectedLocation, setDetectedLocation] = useState(null);
    const [detectionError, setDetectionError] = useState("");
    const [locationLoading, setLocationLoading] = useState(false);
    // true = Open, false = Closed
    const [ownerName, setOwnerName] = useState("Partner");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBillModalOpen, setIsBillModalOpen] = useState(false);
    const [stockAlerts, setStockAlerts] = useState([]);
    const [allMedicines, setAllMedicines] = useState([]);
    const [filteredMedicines, setFilteredMedicines] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [medicinesLoading, setMedicinesLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [error, setError] = useState("");



    const fetchLowStockMedicines = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            const response = await fetch("https://medistock-3a3y.onrender.com/api/medicines/low-stock?threshold=10", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Transform medicines to stock alerts format
                const alerts = data.medicines.map(med => {
                    let status, type;
                    if (med.quantity === 0) {
                        status = "Out of Stock";
                        type = "critical";
                    } else if (med.quantity <= 5) {
                        status = `Low Stock (${med.quantity} left)`;
                        type = "critical";
                    } else {
                        status = `Low Stock (${med.quantity} left)`;
                        type = "warning";
                    }

                    return {
                        id: med._id,
                        name: med.name,
                        status,
                        type
                    };
                });
                setStockAlerts(alerts);
            } else {
                setError(data.message || "Failed to fetch low stock medicines");
            }
        } catch (err) {
            console.error("Error fetching low stock medicines:", err);
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fetchAllMedicines = async () => {
        try {
            setMedicinesLoading(true);
            const token = localStorage.getItem("token");

            const response = await fetch("https://medistock-3a3y.onrender.com/api/medicines/my-medicines", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setAllMedicines(data.medicines);
                setFilteredMedicines(data.medicines);
            }
        } catch (err) {
            console.error("Error fetching medicines:", err);
        } finally {
            setMedicinesLoading(false);
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        if (query === "") {
            setFilteredMedicines(allMedicines);
        } else {
            const filtered = allMedicines.filter(med =>
                med.name.toLowerCase().includes(query) ||
                (med.brand && med.brand.toLowerCase().includes(query)) ||
                (med.category && med.category.toLowerCase().includes(query))
            );
            setFilteredMedicines(filtered);
        }
    };

    const fetchDailyStats = async () => {
        try {
            setStatsLoading(true);
            const token = localStorage.getItem("token");

            const response = await fetch("https://medistock-3a3y.onrender.com/api/bills/daily-stats", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok && data.success) {
                const { totalSales, salesChange, ordersToday, ordersChange, lowStockCount, profileVisits, visitsChange } = data.stats;

                setStats([
                    {
                        title: "Total Sales",
                        value: `₹${totalSales.toLocaleString()}`,
                        change: `${salesChange >= 0 ? '+' : ''}${salesChange}%`,
                        isPositive: salesChange >= 0,
                        icon: DollarSign,
                        color: "text-emerald-400",
                        bg: "bg-emerald-500/10"
                    },
                    {
                        title: "Orders Today",
                        value: ordersToday.toString(),
                        change: `${ordersChange >= 0 ? '+' : ''}${ordersChange}%`,
                        isPositive: ordersChange >= 0,
                        icon: Package,
                        color: "text-blue-400",
                        bg: "bg-blue-500/10"
                    },
                    {
                        title: "Low Stock",
                        value: `${lowStockCount} Items`,
                        change: lowStockCount > 0 ? "Urgent" : "Good",
                        isPositive: lowStockCount === 0,
                        icon: AlertTriangle,
                        color: "text-red-400",
                        bg: "bg-red-500/10"
                    },
                    {
                        title: "Profile Visits",
                        value: profileVisits.toLocaleString(),
                        change: `${visitsChange >= 0 ? '+' : ''}${visitsChange}%`,
                        isPositive: visitsChange >= 0,
                        icon: Eye,
                        color: "text-purple-400",
                        bg: "bg-purple-500/10"
                    },
                ]);
            }
        } catch (err) {
            console.error("Error fetching daily stats:", err);
        } finally {
            setStatsLoading(false);
        }
    };

    const fetchStoreProfile = async () => {
        try {
            const storedUser = JSON.parse(localStorage.getItem("user"));
            if (!storedUser || !storedUser._id) return;

            const token = localStorage.getItem("token");
            const response = await fetch(`https://medistock-3a3y.onrender.com/api/stores/${storedUser._id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setStoreData(data.store);
                // If address is missing, detect current location
                if (!data.store?.address) {
                    detectCurrentLocation();
                }
            }
        } catch (err) {
            console.error("Error fetching store profile:", err);
        }
    };

    const detectCurrentLocation = async () => {
        try {
            setDetectionError("");
            const position = await getCurrentLocation();
            const address = await getAddressFromCoords(position.latitude, position.longitude);
            setDetectedLocation({ ...position, address });
        } catch (error) {
            console.error("Error detecting current location:", error);
            setDetectionError(error.message || "Could not detect location automatically");
        }
    };

    const handleUpdateLocation = async () => {
        try {
            setLocationLoading(true);
            const position = await getCurrentLocation();
            const { latitude, longitude } = position;

            const address = await getAddressFromCoords(latitude, longitude);

            const token = localStorage.getItem("token");
            const response = await fetch("https://medistock-3a3y.onrender.com/api/stores/location", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    latitude,
                    longitude,
                    address
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert("Location updated successfully!");
                fetchStoreProfile(); // Refresh profile
            } else {
                alert(data.message || "Failed to update location");
            }
        } catch (error) {
            console.error("Error updating location:", error);
            alert(error.message || "Failed to get location");
        } finally {
            setLocationLoading(false);
        }
    };

    const handleMedicineAdded = () => {
        // Refresh both low-stock medicines and all medicines after adding
        fetchLowStockMedicines();
        fetchAllMedicines();
        fetchDailyStats();
    };

    const handleBillCreated = () => {
        // Refresh everything after creating a bill
        fetchLowStockMedicines();
        fetchAllMedicines();
        fetchDailyStats();
    };

    const handleDeleteMedicine = async (medicineId, medicineName) => {
        if (!window.confirm(`Are you sure you want to delete "${medicineName}"?`)) {
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`https://medistock-3a3y.onrender.com/api/medicines/delete/${medicineId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Refresh all data
                fetchLowStockMedicines();
                fetchAllMedicines();
                fetchDailyStats();
            } else {
                alert(data.message || "Failed to delete medicine");
            }
        } catch (err) {
            console.error("Error deleting medicine:", err);
            alert("Network error. Please try again.");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };







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

        // Fetch low-stock medicines, all medicines, and daily stats
        fetchLowStockMedicines();
        fetchAllMedicines();
        fetchDailyStats();
        fetchStoreProfile();
    }, []);

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
                            Welcome {ownerName ? ownerName.split(" ")[0] : "Partner"}
                        </h1>
                        <p className="text-gray-400 mt-1">Your Own Dashboard</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsBillModalOpen(true)}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold shadow-lg shadow-green-500/20 transition-all flex items-center gap-2"
                        >
                            <FileText className="w-4 h-4" /> Create Bill
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-semibold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
                        >
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
                    {statsLoading ? (
                        <div className="col-span-4 text-center py-8 text-gray-400">
                            <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                            Loading stats...
                        </div>
                    ) : (
                        stats.map((stat, idx) => (
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
                        )))
                    }
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
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    placeholder="Search medicines by name, brand, or category..."
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

                        {/*  All Medicines Inventory */}
                        <div className="bg-[#121212] border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Package className="w-5 h-5 text-indigo-400" /> Your Inventory
                                </h2>
                                <span className="text-sm text-gray-400">
                                    {filteredMedicines.length} {filteredMedicines.length === 1 ? 'medicine' : 'medicines'}
                                </span>
                            </div>

                            <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                                {medicinesLoading ? (
                                    <div className="text-center py-8 text-gray-400">
                                        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                                        Loading inventory...
                                    </div>
                                ) : filteredMedicines.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400">
                                        <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">
                                            {searchQuery ? 'No medicines found matching your search' : 'No medicines in inventory yet'}
                                        </p>
                                        {!searchQuery && (
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="mt-3 text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                                            >
                                                Add your first medicine
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    filteredMedicines.map((medicine) => (
                                        <div
                                            key={medicine._id}
                                            className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">
                                                        {medicine.name}
                                                    </h4>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                                        {medicine.brand && (
                                                            <span className="flex items-center gap-1">
                                                                <Building2 className="w-3 h-3" />
                                                                {medicine.brand}
                                                            </span>
                                                        )}
                                                        {medicine.category && (
                                                            <span className="flex items-center gap-1">
                                                                <Tag className="w-3 h-3" />
                                                                {medicine.category}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right ml-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-sm font-bold ${medicine.quantity === 0 ? 'text-red-400' :
                                                            medicine.quantity <= 5 ? 'text-orange-400' :
                                                                medicine.quantity <= 10 ? 'text-yellow-400' :
                                                                    'text-green-400'
                                                            }`}>
                                                            {medicine.quantity}
                                                        </span>
                                                        <span className="text-xs text-gray-500">units</span>
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        ₹{medicine.price}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteMedicine(medicine._id, medicine.name)}
                                                    className="ml-3 p-2 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Delete medicine"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-400 hover:text-red-300" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
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
                                {loading ? (
                                    <div className="text-center py-8 text-gray-400">
                                        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                                        Loading...
                                    </div>
                                ) : error ? (
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                        {error}
                                    </div>
                                ) : stockAlerts.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400">
                                        <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">All medicines are well stocked! 🎉</p>
                                    </div>
                                ) : (
                                    stockAlerts.map((alert) => (
                                        <div key={alert.id} className="p-3 rounded-lg bg-white/5 border border-white/5 flex items-start gap-3">
                                            <AlertTriangle className={`w-5 h-5 mt-0.5 ${alert.type === 'critical' ? 'text-red-500' : 'text-orange-400'}`} />
                                            <div className="flex-1">
                                                <h4 className="text-sm font-semibold text-white">{alert.name}</h4>
                                                <p className={`text-xs mt-1 ${alert.type === 'critical' ? 'text-red-400' : 'text-orange-400'}`}>
                                                    {alert.status}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="ml-auto text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white transition-colors"
                                            >
                                                Restock
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>

                        {/* 📍 Store Location & Live Map */}
                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.35 }}
                            className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden"
                        >
                            <div className="p-6 pb-0">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-emerald-400" /> Store Location
                                </h2>

                                <div className="bg-white/5 rounded-xl p-4 mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-400 text-sm">Store Address</span>
                                        {(storeData?.latitude || detectedLocation?.latitude) && (
                                            <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">Live</span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-200">
                                        {storeData?.address ? (
                                            <div className="space-y-2">
                                                <p className="font-medium text-white line-clamp-2">{storeData.address}</p>
                                                <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                                                    <Navigation className="w-3 h-3" />
                                                    {storeData.latitude.toFixed(6)}, {storeData.longitude.toFixed(6)}
                                                </div>
                                            </div>
                                        ) : detectedLocation ? (
                                            <div className="space-y-2 bg-indigo-500/5 p-3 rounded-lg border border-indigo-500/10">
                                                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                                                    Detected Current Location
                                                </p>
                                                <p className="font-medium text-white line-clamp-2">{detectedLocation.address}</p>
                                                <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                                                    <Navigation className="w-3 h-3" />
                                                    {detectedLocation.latitude.toFixed(6)}, {detectedLocation.longitude.toFixed(6)}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center py-4 bg-white/5 rounded-lg border border-white/5">
                                                <Loader className="w-6 h-6 text-indigo-500 mb-2 animate-spin" />
                                                <span className="text-gray-500 italic text-center text-xs">Detecting current location...</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Live Leaflet Map */}
                            <div className="w-full h-48 bg-black/20 border-y border-white/5 relative group">
                                {(storeData?.latitude || detectedLocation?.latitude) ? (
                                    <MapContainer
                                        center={[
                                            storeData?.latitude || detectedLocation?.latitude,
                                            storeData?.longitude || detectedLocation?.longitude
                                        ]}
                                        zoom={15}
                                        style={{ width: "100%", height: "100%", background: "#1a1a1a" }}
                                        zoomControl={false}
                                    >
                                        <TileLayer
                                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                        />
                                        <RecenterMap
                                            position={{
                                                lat: storeData?.latitude || detectedLocation?.latitude,
                                                lng: storeData?.longitude || detectedLocation?.longitude
                                            }}
                                        />
                                        <Marker
                                            position={[
                                                storeData?.latitude || detectedLocation?.latitude,
                                                storeData?.longitude || detectedLocation?.longitude
                                            ]}
                                            icon={ownerIcon}
                                        />
                                    </MapContainer>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1a1a]">
                                        <Map className="w-10 h-10 text-gray-700 mb-2" />
                                        <span className="text-xs text-gray-600">Map will appear once location is detected</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 pointer-events-none border border-white/5 group-hover:border-indigo-500/20 transition-colors"></div>
                            </div>

                            <div className="p-6 pt-4">
                                <button
                                    onClick={handleUpdateLocation}
                                    disabled={locationLoading}
                                    className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {locationLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <MapPin className="w-4 h-4" /> Save Store Location
                                        </>
                                    )}
                                </button>
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

            {/* Add Medicine Modal */}
            <AddMedicineModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleMedicineAdded}
            />

            {/* Create Bill Modal */}
            <CreateBillModal
                isOpen={isBillModalOpen}
                onClose={() => setIsBillModalOpen(false)}
                onSuccess={handleBillCreated}
            />

        </div>
    );
};

export default OwnerDashboard;
