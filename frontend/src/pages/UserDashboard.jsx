import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Search, MapPin, Bell, User, History, Upload, FileText,
    Navigation, Filter, HeartPulse, ChevronRight, Star, Clock,
    AlertCircle, Phone, Activity, Sparkles, Thermometer, Pill,
    Stethoscope, Smile, Dumbbell, Zap, Loader, MapPinOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import RangeSlider from "../components/RangeSlider";
import StoreCard from "../components/StoreCard";
import { getCurrentLocation, saveLocation, getSavedLocation } from "../utils/locationUtils";

const UserDashboard = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [user, setUser] = useState(null);
    const [showSOS, setShowSOS] = useState(false);

    // Location and stores state
    const [userLocation, setUserLocation] = useState(null);
    const [searchRadius, setSearchRadius] = useState(5);
    const [nearbyStores, setNearbyStores] = useState([]);
    const [loadingLocation, setLoadingLocation] = useState(true);
    const [loadingStores, setLoadingStores] = useState(false);
    const [locationError, setLocationError] = useState("");

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        }

        // Get user location
        initializeLocation();
    }, []);

    useEffect(() => {
        // Fetch stores when location or radius changes
        if (userLocation) {
            fetchNearbyStores();
        }
    }, [userLocation, searchRadius]);

    const initializeLocation = async () => {
        try {
            setLoadingLocation(true);
            setLocationError("");

            // Try to get saved location first
            const saved = getSavedLocation();
            if (saved && saved.latitude && saved.longitude) {
                setUserLocation(saved);
                setLoadingLocation(false);
                return;
            }

            // Get current location
            const location = await getCurrentLocation();
            setUserLocation(location);
            saveLocation(location.latitude, location.longitude);
        } catch (error) {
            console.error("Location error:", error);
            setLocationError(error.message);
            // Use default location (Mumbai) as fallback
            const defaultLocation = { latitude: 19.0760, longitude: 72.8777 };
            setUserLocation(defaultLocation);
        } finally {
            setLoadingLocation(false);
        }
    };

    const fetchNearbyStores = async () => {
        if (!userLocation) return;

        try {
            setLoadingStores(true);
            const response = await fetch(
                `http://localhost:5000/api/stores/nearby?lat=${userLocation.latitude}&lng=${userLocation.longitude}&radius=${searchRadius}`
            );
            const data = await response.json();

            if (data.success) {
                setNearbyStores(data.stores);
            } else {
                console.error("Failed to fetch stores:", data.message);
                setNearbyStores([]);
            }
        } catch (error) {
            console.error("Error fetching nearby stores:", error);
            setNearbyStores([]);
        } finally {
            setLoadingStores(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");
        localStorage.removeItem("isLoggedIn");
        navigate("/login");
    };

    const handleStoreClick = (storeId) => {
        navigate(`/store/${storeId}`);
    };

    const recentSearches = ["Dolo 650", "Azithromycin", "Vitamin C", "Cotton Bandage"];

    const categories = [
        { name: "Medicines", icon: Pill, color: "text-blue-400", bg: "bg-blue-500/10" },
        { name: "First Aid", icon: Activity, color: "text-red-400", bg: "bg-red-500/10" },
        { name: "Skincare", icon: Sparkles, color: "text-purple-400", bg: "bg-purple-500/10" },
        { name: "Baby Care", icon: Smile, color: "text-yellow-400", bg: "bg-yellow-500/10" },
        { name: "Devices", icon: Thermometer, color: "text-orange-400", bg: "bg-orange-500/10" },
        { name: "Fitness", icon: Dumbbell, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-['Outfit'] selection:bg-emerald-500/30 overflow-x-hidden relative pb-20">

            {/* 🔮 Background Ambience */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px]" />
            </div>

            {/* 🧭 Navbar */}
            <nav className="sticky top-0 z-50 w-full bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                            <HeartPulse className="text-white w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white hidden sm:block">
                            Medi<span className="text-emerald-500">Stock</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-black"></span>
                        </button>
                        <div className="h-8 w-px bg-white/10 mx-1"></div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-xs font-bold text-black border border-white/10">
                                {user ? user.name.charAt(0).toUpperCase() : "U"}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* 📍 Context Header */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
                >
                    <div>
                        <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-1">
                            {loadingLocation ? (
                                <>
                                    <Loader className="w-4 h-4 animate-spin" />
                                    <span>Getting your location...</span>
                                </>
                            ) : locationError ? (
                                <>
                                    <MapPinOff className="w-4 h-4" />
                                    <span>Using default location</span>
                                </>
                            ) : (
                                <>
                                    <MapPin className="w-4 h-4" />
                                    <span>Your Location</span>
                                </>
                            )}
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-white">
                            Hello, {user ? user.name.split(" ")[0] : "User"} 👋
                        </h1>
                        <p className="text-gray-400 mt-1">What medicine are you looking for today?</p>
                    </div>
                </motion.div>

                {/* 🔍 Primary Search Section */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative"
                >
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                        <div className="relative bg-[#121212] border border-white/10 rounded-2xl p-2 flex items-center shadow-2xl">
                            <div className="pl-4 pr-3 text-gray-400">
                                <Search className="w-6 h-6" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for medicines, health products..."
                                className="w-full bg-transparent text-lg text-white placeholder:text-gray-500 focus:outline-none py-3"
                            />
                            <button className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-xl font-bold transition-all transform active:scale-95 flex items-center gap-2">
                                Search
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            System Online
                        </div>
                        <span className="text-gray-500 hidden sm:inline">•</span>
                        <div className="text-gray-400">
                            <span className="text-white font-semibold">{nearbyStores.length}</span> active pharmacies nearby
                        </div>
                    </div>
                </motion.div>

                {/* Range Slider */}
                {!loadingLocation && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-[#121212] border border-white/5 rounded-2xl p-6"
                    >
                        <RangeSlider
                            value={searchRadius}
                            onChange={setSearchRadius}
                            min={1}
                            max={50}
                            unit="km"
                        />
                    </motion.div>
                )}


                {/* ✨ Promo Banner */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 md:p-8 flex items-center justify-between"
                >
                    <div className="relative z-10 max-w-lg">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-3">
                            <Zap className="w-3 h-3 fill-yellow-400 text-yellow-400" /> New Offer
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Get 20% Off Your First Order</h2>
                        <p className="text-indigo-100 mb-6">Use code <span className="font-mono bg-white/20 px-2 py-0.5 rounded text-white font-bold">MEDIFIRST</span> at checkout.</p>
                        <button className="bg-white text-indigo-600 px-5 py-2.5 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                            Claim Now
                        </button>
                    </div>
                    <div className="absolute right-0 top-0 h-full w-1/3 opacity-20 bg-[url('https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&q=80&w=600')] bg-cover bg-center mix-blend-overlay"></div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                </motion.div>

                {/* 🛍️ Shop by Category */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white">Shop by Category</h2>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                        {categories.map((cat, idx) => (
                            <button key={idx} className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-[#121212] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all group">
                                <div className={`w-12 h-12 rounded-full ${cat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <cat.icon className={`w-6 h-6 ${cat.color}`} />
                                </div>
                                <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* ⚡ Quick Actions (Already Implemented) & Nearby Stores */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-2"
                    >
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            Quick Actions
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { icon: Upload, label: "Upload Rx", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
                                { icon: FileText, label: "My Orders", color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
                                { icon: Star, label: "Saved Stores", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
                                { icon: Navigation, label: "Map View", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" }
                            ].map((action, i) => (
                                <button
                                    key={i}
                                    className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border ${action.border} ${action.bg} hover:bg-opacity-20 transition-all hover:-translate-y-1 group`}
                                >
                                    <action.icon className={`w-8 h-8 ${action.color} group-hover:scale-110 transition-transform`} />
                                    <span className="font-semibold text-white/90 text-sm">{action.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Recent Searches (Moved here for better flow) */}
                        <div className="mt-8">
                            <div className="flex items-center gap-2 mb-3 text-gray-400 text-sm font-medium uppercase tracking-wider">
                                <History className="w-4 h-4" /> Recent Searches
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {recentSearches.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSearchQuery(item)}
                                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-sm text-gray-300 transition-colors"
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                Nearby Stores
                            </h2>
                            {nearbyStores.length > 0 && (
                                <span className="text-xs font-semibold text-emerald-400">
                                    {nearbyStores.length} found
                                </span>
                            )}
                        </div>

                        <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                            {loadingStores ? (
                                <div className="text-center py-12">
                                    <Loader className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-2" />
                                    <p className="text-gray-400 text-sm">Finding nearby stores...</p>
                                </div>
                            ) : nearbyStores.length === 0 ? (
                                <div className="text-center py-12">
                                    <MapPinOff className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-50" />
                                    <p className="text-gray-400 text-sm">No stores found in this area</p>
                                    <p className="text-gray-500 text-xs mt-2">Try increasing your search radius</p>
                                </div>
                            ) : (
                                nearbyStores.map((store, index) => (
                                    <StoreCard
                                        key={store.id}
                                        store={store}
                                        index={index}
                                        onClick={() => handleStoreClick(store.id)}
                                    />
                                ))
                            )}
                        </div>
                    </motion.div>

                </div>

            </div>

            {/* 🚨 SOS Floating Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <AnimatePresence>
                    {showSOS && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.9 }}
                            className="absolute bottom-16 right-0 mb-2 w-64 bg-[#1a1a1a] border border-red-500/20 rounded-2xl shadow-2xl p-4"
                        >
                            <h3 className="text-red-500 font-bold mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Emergency</h3>
                            <p className="text-gray-400 text-xs mb-3">Call ambulance or nearest hospital immediately.</p>
                            <div className="space-y-2">
                                <button className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                                    <Phone className="w-4 h-4" /> 102 (Ambulance)
                                </button>
                                <button className="w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-bold">
                                    Nearby Hospital
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={() => setShowSOS(!showSOS)}
                    className="w-14 h-14 bg-red-600 hover:bg-red-500 text-white rounded-full shadow-[0_0_30px_rgba(239,68,68,0.4)] flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 relative"
                >
                    <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-75"></span>
                    <AlertCircle className="w-6 h-6 relative z-10" />
                </button>
            </div>

        </div>
    );
};

export default UserDashboard;


