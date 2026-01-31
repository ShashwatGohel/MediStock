import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    Search, MapPin, Bell, User, History, Upload, FileText,
    Navigation, Filter, HeartPulse, ChevronRight, Star, Clock,
    AlertCircle, Phone, Activity, Sparkles, Thermometer, Pill,
    Stethoscope, Smile, Dumbbell, Zap, Loader, MapPinOff, X, PlusCircle, Settings, Heart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import OrderModal from "../components/OrderModal";
import RangeSlider from "../components/RangeSlider";
import StoreCard from "../components/StoreCard";
import { getCurrentLocation, saveLocation, getSavedLocation, getAddressFromCoords } from "../utils/locationUtils";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { userIcon, storeIcon } from "../utils/MapMarkerIcons";
import PrescriptionModal from "../components/PrescriptionModal";
import { API_URLS } from "../api";

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

const UserDashboard = () => {
    const navigate = useNavigate();
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const resultsRef = useRef(null);
    const [selectedStore, setSelectedStore] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [user, setUser] = useState(null);
    const [showSOS, setShowSOS] = useState(false);

    // Location and stores state
    const [userLocation, setUserLocation] = useState(null);
    const [userAddress, setUserAddress] = useState("");
    const [showMap, setShowMap] = useState(false);
    const [searchRadius, setSearchRadius] = useState(5);
    const [nearbyStores, setNearbyStores] = useState([]);
    const [loadingLocation, setLoadingLocation] = useState(true);
    const [loadingStores, setLoadingStores] = useState(false);
    const [locationError, setLocationError] = useState("");
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [userOrders, setUserOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [savedStoreIds, setSavedStoreIds] = useState([]);

    const location = useLocation();

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        }

        // Get user location
        initializeLocation();
    }, []);

    // Prevent map jitter by only updating when location significantly changes or user requests
    useEffect(() => {
        if (userLocation && !loadingLocation) {
            // Optional: debounce this if needed
        }
    }, [userLocation]);

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

            // Get current location first for freshness
            const location = await getCurrentLocation();
            setUserLocation(location);
            saveLocation(location.latitude, location.longitude);

            // Get address for feedback
            const address = await getAddressFromCoords(location.latitude, location.longitude);
            setUserAddress(address);
        } catch (error) {
            console.error("Location error:", error);

            // Fallback to saved location if current fails
            const saved = getSavedLocation();
            if (saved && saved.latitude && saved.longitude) {
                // Check if saved location is not too old (e.g., 1 hour)
                const oneHour = 60 * 60 * 1000;
                if (Date.now() - (saved.timestamp || 0) < oneHour) {
                    setUserLocation(saved);
                    return;
                }
            }

            setLocationError(error.message);
            // Use default location (Mumbai) as fallback
            const defaultLocation = { latitude: 19.0760, longitude: 72.8777 };
            setUserLocation(defaultLocation);
        } finally {
            setLoadingLocation(false);
        }
    };
    const fetchUserOrders = async () => {
        try {
            setLoadingOrders(true);
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URLS.ORDERS}/user-orders`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setUserOrders(data.orders);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoadingOrders(false);
        }
    };

    const fetchSavedStores = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URLS.STORES}/saved`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setSavedStoreIds(data.stores.map(s => s.id));
            }
        } catch (error) {
            console.error("Error fetching saved stores:", error);
        }
    };

    const handleToggleSave = async (storeId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URLS.STORES}/toggle-save/${storeId}`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                if (data.status === "saved") {
                    setSavedStoreIds(prev => [...prev, storeId]);
                } else {
                    setSavedStoreIds(prev => prev.filter(id => id !== storeId));
                }
            }
        } catch (error) {
            console.error("Error toggling save:", error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchUserOrders();
            fetchSavedStores();
        }
    }, [user]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");
        localStorage.removeItem("isLoggedIn");
        navigate("/login");
    };

    const fetchNearbyStores = async () => {
        if (!userLocation) return;
        try {
            setLoadingStores(true);
            const response = await fetch(
                `${API_URLS.STORES}/nearby?lat=${userLocation.latitude}&lng=${userLocation.longitude}&radius=${searchRadius}`
            );
            const data = await response.json();
            if (data.success) {
                setNearbyStores(data.stores);
            } else {
                setNearbyStores([]);
            }
        } catch (error) {
            console.error("Error fetching nearby stores:", error);
            setNearbyStores([]);
        } finally {
            setLoadingStores(false);
        }
    };

    const handleSearchClick = async () => {
        if (!searchQuery.trim()) {
            fetchNearbyStores();
            return;
        }

        try {
            setLoadingStores(true);
            const response = await fetch(
                `${API_URLS.STORES}/search?lat=${userLocation.latitude}&lng=${userLocation.longitude}&radius=${searchRadius}&medicine=${encodeURIComponent(searchQuery)}`
            );
            const data = await response.json();
            if (data.success) {
                setNearbyStores(data.stores);
                setTimeout(() => {
                    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            } else {
                setNearbyStores([]);
            }
        } catch (error) {
            console.error("Error searching medicines:", error);
            setNearbyStores([]);
        } finally {
            setLoadingStores(false);
        }
    };

    const handleCategoryClick = (category) => {
        navigate(`/category/${encodeURIComponent(category)}`);
    };

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearchClick();
        }
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
                        <div className="flex items-center gap-3">
                            <button
                                onClick={initializeLocation}
                                disabled={loadingLocation}
                                className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-1 hover:text-emerald-300 transition-colors group text-left"
                            >
                                {loadingLocation ? (
                                    <>
                                        <Loader className="w-4 h-4 animate-spin" />
                                        <span>Getting your location...</span>
                                    </>
                                ) : locationError ? (
                                    <>
                                        <MapPinOff className="w-4 h-4" />
                                        <span>Using default location (Click to retry)</span>
                                    </>
                                ) : (
                                    <>
                                        <MapPin className="w-4 h-4 group-hover:animate-bounce" />
                                        <span className="truncate max-w-[200px] sm:max-w-md underline decoration-dotted decoration-emerald-500/30 underline-offset-4">{userAddress || "Set Live Location"}</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => setShowLocationModal(true)}
                                className="text-xs text-gray-500 hover:text-white mb-1 px-2 py-0.5 rounded border border-white/5 hover:border-white/20 transition-all"
                            >
                                Change
                            </button>
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
                                onChange={handleSearch}
                                onKeyPress={handleKeyPress}
                                placeholder="Search for medicines, health products..."
                                className="w-full bg-transparent text-lg text-white placeholder:text-gray-500 focus:outline-none py-3"
                            />
                            <button
                                onClick={handleSearchClick}
                                className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-xl font-bold transition-all transform active:scale-95 flex items-center gap-2"
                            >
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
                            <span className="text-white font-semibold">{nearbyStores.length}</span> {searchQuery.trim() ? `active pharmacies with "${searchQuery}"` : "active pharmacies nearby"}
                        </div>
                    </div>
                </motion.div>

                {/* Range Slider */}
                {
                    !loadingLocation && (
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
                    )
                }


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

                {/* 🏷️ Shop by Category */}
                <div id="categories-section" className="space-y-6">
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
                                <button
                                    key={idx}
                                    onClick={() => handleCategoryClick(cat.name)}
                                    className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-[#121212] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all group"
                                >
                                    <div className={`w-12 h-12 rounded-full ${cat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <cat.icon className={`w-6 h-6 ${cat.color}`} />
                                    </div>
                                    <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>

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
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                            {[
                                { icon: Upload, label: "Upload Rx", path: "/upload-rx", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
                                { icon: History, label: "Past Orders", path: "/past-orders", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
                                { icon: PlusCircle, label: "Shop Now", onClick: () => document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' }), color: "text-indigo-400", bg: "bg-indigo-400/10", border: "border-indigo-400/20" },
                                { icon: Heart, label: "Favorites", path: "/saved-stores", color: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/20" },
                                { icon: Navigation, label: "Map View", path: "/map-view", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" }
                            ].map((action, i) => (
                                <button
                                    key={i}
                                    onClick={action.path ? () => navigate(action.path) : action.onClick}
                                    className={`flex-col items-center justify-center gap-3 p-6 rounded-2xl border ${action.border} ${action.bg} hover:bg-opacity-20 transition-all hover:-translate-y-1 group flex`}
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
                        <div ref={resultsRef} className="flex items-center justify-between mb-4">
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
                                        store={{
                                            ...store,
                                            isSaved: savedStoreIds.includes(store.id),
                                            onToggleSave: handleToggleSave
                                        }}
                                        index={index}
                                        onClick={() => handleStoreClick(store.id)}
                                        onOrderClick={(med) => {
                                            setSelectedMedicine(med);
                                            setShowOrderModal(true);
                                        }}
                                    />
                                ))
                            )}
                        </div>
                    </motion.div>

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

                {/* 🗺️ Full Screen Map Modal */}
                <AnimatePresence>
                    {showMap && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl flex flex-col"
                        >
                            <div className="p-4 flex items-center justify-between border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                                        <Navigation className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Live Store Map</h2>
                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" /> {userAddress || "Detecting address..."}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowMap(false)}
                                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors"
                                >
                                    <Activity className="w-6 h-6 rotate-45" />
                                </button>
                            </div>

                            <div className="flex-1 relative">
                                {userLocation ? (
                                    <MapContainer
                                        center={[userLocation.latitude, userLocation.longitude]}
                                        zoom={14}
                                        style={{ width: "100%", height: "100%", background: "#1a1a1a" }}
                                        zoomControl={false}
                                    >
                                        <TileLayer
                                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                        />
                                        <RecenterMap position={{ lat: userLocation.latitude, lng: userLocation.longitude }} />

                                        {/* User Marker */}
                                        <Marker
                                            position={[userLocation.latitude, userLocation.longitude]}
                                            icon={userIcon}
                                        >
                                            <Popup>
                                                <div className="p-1">
                                                    <p className="font-bold text-xs">Your Location</p>
                                                </div>
                                            </Popup>
                                        </Marker>

                                        {/* Store Markers */}
                                        {nearbyStores.map(store => (
                                            <Marker
                                                key={store.id}
                                                position={[store.latitude, store.longitude]}
                                                icon={storeIcon}
                                                eventHandlers={{
                                                    click: () => setSelectedStore(store),
                                                }}
                                            >
                                                <Popup>
                                                    <div className="p-2 text-black max-w-[200px] min-w-[150px]">
                                                        <h3 className="font-bold text-sm mb-1">{store.name}</h3>
                                                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{store.address}</p>
                                                        <div className="flex justify-between items-center border-t pt-2 mt-1">
                                                            <span className="text-[10px] font-bold text-emerald-600">{store.distance}km away</span>
                                                            <button
                                                                onClick={() => navigate(`/store/${store.id}`)}
                                                                className="text-[10px] bg-emerald-500 hover:bg-emerald-400 text-white px-2 py-1 rounded transition-colors"
                                                            >
                                                                View
                                                            </button>
                                                        </div>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        ))}
                                    </MapContainer>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <Loader className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                                        <p className="text-gray-400">Loading map perspective...</p>
                                    </div>
                                )}

                                {/* Floating Stats */}
                                <div className="absolute bottom-6 left-6 right-6 flex justify-center">
                                    <div className="bg-[#121212]/90 backdrop-blur-md border border-emerald-500/20 px-6 py-3 rounded-2xl flex items-center gap-6 shadow-2xl">
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Stores</span>
                                            <span className="text-lg font-bold text-emerald-400">{nearbyStores.length}</span>
                                        </div>
                                        <div className="w-px h-8 bg-white/10"></div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Radius</span>
                                            <span className="text-lg font-bold text-white">{searchRadius}km</span>
                                        </div>
                                        <button
                                            onClick={() => setShowMap(false)}
                                            className="ml-2 bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-xl font-bold transition-all text-sm"
                                        >
                                            View List
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <PrescriptionModal
                    isOpen={showPrescriptionModal}
                    onClose={() => setShowPrescriptionModal(false)}
                    userLocation={userLocation}
                />

                {/* My Requests Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h2 className="text-xl font-bold text-white mb-4">My Medicine Requests</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {userOrders.length === 0 ? (
                            <div className="col-span-full text-center py-12 bg-[#121212] rounded-2xl border border-white/5">
                                <p className="text-gray-400">No requests sent yet.</p>
                            </div>
                        ) : (
                            userOrders.map(order => (
                                <div key={order._id} className="bg-[#121212] border border-white/5 p-4 rounded-xl">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-white">{order.storeId?.storeName || "Store"}</h3>
                                        <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                            order.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                                                order.status === 'confirmed' ? 'bg-blue-500/10 text-blue-500' :
                                                    'bg-red-500/10 text-red-500'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm text-gray-400">
                                                <span>{item.medicineName} x {item.quantity}</span>
                                                <span>₹{item.price * item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t border-white/5 mt-3 pt-3 flex justify-between items-center">
                                        <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                                        <span className="font-bold text-white">Total: ₹{order.totalAmount}</span>
                                    </div>
                                    {order.status === 'approved' && (
                                        <p className="text-[10px] text-emerald-400 mt-2 bg-emerald-400/5 p-2 rounded border border-emerald-400/10">
                                            Store has kept your medicines aside. Visit the store to confirm.
                                        </p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            {/* 📍 Manual Location Modal */}
            <AnimatePresence>
                {showLocationModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white">Set Your Location</h3>
                                <button onClick={() => setShowLocationModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Search Address</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Enter your area or city..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500"
                                            onKeyPress={async (e) => {
                                                if (e.key === 'Enter') {
                                                    const query = e.target.value;
                                                    try {
                                                        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
                                                        const data = await res.json();
                                                        if (data && data[0]) {
                                                            const newLoc = { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
                                                            setUserLocation(newLoc);
                                                            setUserAddress(data[0].display_name);
                                                            saveLocation(newLoc.latitude, newLoc.longitude);
                                                            setShowLocationModal(false);
                                                        } else {
                                                            alert("Address not found");
                                                        }
                                                    } catch (err) { alert("Error searching address"); }
                                                }
                                            }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-500 italic">Press Enter to search</p>
                                </div>
                            </div>

                            {/* Leaflet Map for Manual Selection */}
                            <div className="h-64 rounded-xl overflow-hidden border border-white/10 relative z-0">
                                {(userLocation || showLocationModal) && (
                                    <MapContainer
                                        center={userLocation ? [userLocation.latitude, userLocation.longitude] : [19.0760, 72.8777]}
                                        zoom={13}
                                        style={{ height: "100%", width: "100%" }}
                                        className="z-0"
                                    >
                                        <TileLayer
                                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                        />
                                        {userLocation && <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon} />}
                                        <LocationMarker setUserLocation={setUserLocation} setUserAddress={setUserAddress} />
                                    </MapContainer>
                                )}
                            </div>

                            <div className="pt-2">
                                <button
                                    onClick={() => { initializeLocation(); setShowLocationModal(false); }}
                                    className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                                >
                                    <Navigation className="w-4 h-4" /> Use My Current GPS Location
                                </button>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={() => setShowLocationModal(false)}
                                    className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold text-sm transition-all"
                                >
                                    Confirm Location
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserDashboard;


