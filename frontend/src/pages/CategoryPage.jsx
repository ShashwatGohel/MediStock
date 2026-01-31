import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, MapPin, Store, Navigation, Package, AlertCircle, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { getCurrentLocation } from "../utils/locationUtils";
import OrderModal from "../components/OrderModal";
import { API_URLS } from "../api";

const CategoryPage = () => {
    const { categoryName } = useParams();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [storeMedicines, setStoreMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);

    useEffect(() => {
        // Get location and then fetch data
        const init = async () => {
            try {
                const location = await getCurrentLocation();
                setUserLocation(location);
                fetchCategoryData(location);
            } catch (error) {
                console.error("Location error:", error);
                // Fetch without location if failed
                fetchCategoryData(null);
            }
        };
        init();
    }, [categoryName]);

    const fetchCategoryData = async (location, query = "") => {
        setLoading(true);
        try {
            let url = `${API_URLS.MEDICINES}/category-search?category=${encodeURIComponent(categoryName)}`;

            if (query) {
                url += `&search=${encodeURIComponent(query)}`;
            }

            if (location) {
                url += `&lat=${location.latitude}&lng=${location.longitude}&radius=10000`; // Global radius (10000km)
            }

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                setStoreMedicines(data.storeMedicines);
            }
        } catch (error) {
            console.error("Error fetching category data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchCategoryData(userLocation, searchQuery);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-['Outfit'] pb-20">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 p-4">
                <div className="max-w-3xl mx-auto flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </button>
                    <h1 className="text-xl font-bold text-white capitalize">{categoryName}</h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto p-4 space-y-6">
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Search in ${categoryName}...`}
                        className="w-full bg-[#121212] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/50 transition-all shadow-lg shadow-black/20"
                    />
                </form>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-500 animate-pulse">Finding medicines...</p>
                    </div>
                ) : (
                    <>
                        {/* Section 1: In Stock Nearby (Real Inventory) */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Store className="w-5 h-5 text-emerald-400" />
                                    Available in Stores
                                </h2>
                                <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full font-medium">
                                    {storeMedicines.length} found
                                </span>
                            </div>

                            {storeMedicines.length === 0 ? (
                                <div className="p-8 bg-[#121212] border border-white/5 rounded-2xl text-center space-y-3">
                                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                                        <Package className="w-6 h-6 text-gray-500" />
                                    </div>
                                    <p className="text-gray-400">No stores nearby have these items in stock right now.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {storeMedicines.map((item) => (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            key={item._id}
                                            onClick={() => navigate(`/medicine/${encodeURIComponent(item.name)}`)}
                                            className="bg-[#121212] border border-white/5 rounded-xl p-4 flex justify-between items-center cursor-pointer hover:border-white/10 hover:bg-white/5 transition-all group"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-bold text-white text-lg group-hover:text-indigo-400 transition-colors">{item.name}</h3>
                                                    {item.quantity > 0 && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedMedicine(item);
                                                                setShowOrderModal(true);
                                                            }}
                                                            className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-lg text-xs font-bold transition-all border border-emerald-500/20 flex items-center gap-1.5"
                                                        >
                                                            <ShoppingBag className="w-3 h-3" />
                                                            Order
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                                    <span className="bg-white/5 px-2 py-0.5 rounded text-xs">{item.brand}</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Store className="w-3 h-3" />
                                                        {item.storeId?.storeName}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right space-y-1">
                                                <p className="text-xl font-bold text-emerald-400">₹{item.price}</p>
                                                {item.distance && (
                                                    <div className="flex items-center justify-end gap-1 text-xs text-indigo-400">
                                                        <Navigation className="w-3 h-3" />
                                                        {item.distance} km
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            <OrderModal
                isOpen={showOrderModal}
                onClose={() => setShowOrderModal(false)}
                medicine={selectedMedicine}
                onOrderSuccess={() => {
                    fetchCategoryData(userLocation, searchQuery);
                }}
            />
        </div>
    );
};

export default CategoryPage;
