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

    const handleQuickOrder = (medicineName) => {
        setSearchQuery(medicineName);
        fetchCategoryData(userLocation, medicineName);
        // Scroll to results
        setTimeout(() => {
            const resultsSection = document.getElementById('search-results');
            resultsSection?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const normalizedCategory = categoryName?.toLowerCase() || "";
    const isMedicines = normalizedCategory === "medicines" || normalizedCategory === "medicine";

    const categoryMedicines = {
        "medicines": [
            { id: 1, name: "Paracetamol 500mg", price: 30, unit: "Crocin" },
            { id: 2, name: "Ibuprofen 400mg", price: 45, unit: "Brufen" },
            { id: 3, name: "Azithromycin 500mg", price: 120, unit: "Azithral" },
            { id: 4, name: "Cetirizine 10mg", price: 35, unit: "Okacet" }
        ],
        "first aid": [
            { id: 5, name: "Antiseptic Liquid", price: 95, unit: "Dettol" },
            { id: 6, name: "Adhesive Bandages", price: 45, unit: "Band-Aid" },
            { id: 7, name: "Cotton Wool", price: 30, unit: "Generic" },
            { id: 8, name: "Micropore Tape", price: 55, unit: "3M" }
        ],
        "skincare": [
            { id: 9, name: "Moisturizing Cream", price: 280, unit: "Cetaphil" },
            { id: 10, name: "Sunscreen SPF 50", price: 450, unit: "Neutrogena" },
            { id: 11, name: "Acne Gel", price: 185, unit: "Benzac AC" },
            { id: 12, name: "Aloe Vera Gel", price: 120, unit: "Patanjali" }
        ],
        "baby care": [
            { id: 13, name: "Baby Diapers", price: 750, unit: "Pampers" },
            { id: 14, name: "Baby Wipes", price: 145, unit: "Johnson's" },
            { id: 15, name: "Baby Lotion", price: 210, unit: "Himalaya" },
            { id: 16, name: "Baby Oil", price: 180, unit: "Dabur Lal" }
        ],
        "devices": [
            { id: 17, name: "Digital Thermometer", price: 299, unit: "Dr. Trust" },
            { id: 18, name: "BP Monitor", price: 1950, unit: "Omron" },
            { id: 19, name: "Glucometer", price: 850, unit: "Accu-Chek" },
            { id: 20, name: "Pulse Oximeter", price: 1250, unit: "Dr. Morepen" }
        ],
        "fitness": [
            { id: 21, name: "Whey Protein", price: 2450, unit: "Optimum Nutrition" },
            { id: 22, name: "Multivitamin Tablets", price: 499, unit: "Revital H" },
            { id: 23, name: "Omega 3 Capsules", price: 890, unit: "MuscleBlaze" },
            { id: 24, name: "BCAA Powder", price: 1350, unit: "Scivation Xtend" }
        ]
    };

    // Correct lookup for "Medicines" vs "medicine"
    const featuredItems = isMedicines ? categoryMedicines["medicines"] : categoryMedicines[normalizedCategory];

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
                        {/* Featured Items Section (Predefined) */}
                        {featuredItems && (
                            <div className="space-y-4">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <ShoppingBag className="w-5 h-5 text-indigo-400" />
                                    Featured in {categoryName}
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {featuredItems.map((med) => (
                                        <div
                                            key={med.id}
                                            className="bg-[#121212] border border-white/5 rounded-2xl p-5 hover:border-indigo-500/30 transition-all group relative overflow-hidden flex flex-col justify-between"
                                        >
                                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                                <Package className="w-12 h-12" />
                                            </div>

                                            <div>
                                                <h3 className="font-bold text-white text-base mb-1 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{med.name}</h3>
                                                <p className="text-xs text-gray-500 font-medium">{med.unit}</p>
                                            </div>

                                            <div className="flex items-center justify-between mt-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-gray-600 uppercase font-bold tracking-widest">Price</span>
                                                    <span className="text-xl font-black text-white">₹{med.price}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleQuickOrder(med.name)}
                                                    className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white border border-indigo-500/20 rounded-xl text-xs font-bold transition-all flex items-center gap-2 group/btn active:scale-95"
                                                >
                                                    <Search className="w-3.5 h-3.5" />
                                                    Find Near Me
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

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
