import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft, Search, MapPin, Store, Navigation,
    Package, AlertCircle, ShoppingBag, Loader, Building2
} from "lucide-react";
import { motion } from "framer-motion";
import { getCurrentLocation } from "../utils/locationUtils";
import OrderModal from "../components/OrderModal";
import { API_URLS } from "../api";

const MedicineSearch = () => {
    const { medicineName } = useParams();
    const navigate = useNavigate();
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                // Try to get location from localStorage first
                const savedLocation = localStorage.getItem("userLocation");
                let location = savedLocation ? JSON.parse(savedLocation) : null;

                if (!location) {
                    location = await getCurrentLocation();
                    if (location) {
                        localStorage.setItem("userLocation", JSON.stringify(location));
                    }
                }

                setUserLocation(location);
                fetchStoresForMedicine(location);
            } catch (error) {
                console.error("Location error:", error);
                fetchStoresForMedicine(null);
            }
        };
        init();
    }, [medicineName]);

    const fetchStoresForMedicine = async (location) => {
        setLoading(true);
        try {
            let url = `${API_URLS.STORES}/search?medicine=${encodeURIComponent(medicineName)}&radius=50`;

            if (location) {
                url += `&lat=${location.latitude}&lng=${location.longitude}`;
            } else {
                // Fallback coordinates if no location
                url += `&lat=19.0760&lng=72.8777`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                setStores(data.stores);
            }
        } catch (error) {
            console.error("Error fetching stores:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-['Outfit'] pb-20">
            {/* Background Ambience */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10">
                {/* Header */}
                <div className="sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 p-4">
                    <div className="max-w-3xl mx-auto flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-white/5 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-white" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-white line-clamp-1">{medicineName}</h1>
                            <p className="text-xs text-gray-400">Available in stores nearby</p>
                        </div>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto p-4 space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader className="w-10 h-10 text-emerald-500 animate-spin" />
                            <p className="text-gray-500 animate-pulse">Finding stores with {medicineName}...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Store className="w-5 h-5 text-emerald-400" />
                                    Participating Pharmacies
                                </h2>
                                <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full font-medium">
                                    {stores.length} found
                                </span>
                            </div>

                            {stores.length === 0 ? (
                                <div className="p-12 bg-[#121212] border border-white/5 rounded-2xl text-center space-y-4">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                                        <Package className="w-8 h-8 text-gray-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-bold text-white">No Stores Found</h3>
                                        <p className="text-gray-400 max-w-xs mx-auto">
                                            Unfortunately, we couldn't find any stores nearby that have "{medicineName}" in stock.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => navigate('/user-dashboard')}
                                        className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-bold transition-all"
                                    >
                                        Back to Dashboard
                                    </button>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {stores.map((store, idx) => (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            key={store.id}
                                            onClick={() => navigate(`/store/${store.id}`)}
                                            className="bg-[#121212] border border-white/5 rounded-2xl p-5 cursor-pointer hover:border-emerald-500/30 hover:bg-white/[0.02] transition-all group relative overflow-hidden"
                                        >
                                            <div className="flex gap-4">
                                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/10 flex items-center justify-center flex-shrink-0 group-hover:from-emerald-500/20 group-hover:to-teal-500/20 transition-all">
                                                    <Building2 className="w-7 h-7 text-emerald-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <h3 className="font-bold text-white text-lg group-hover:text-emerald-400 transition-colors truncate">
                                                                {store.name}
                                                            </h3>
                                                            <div className="flex items-center gap-2 text-sm text-gray-400 mt-0.5">
                                                                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                                                <span className="truncate">{store.address}</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right flex-shrink-0">
                                                            <div className="text-xl font-bold text-emerald-400">
                                                                ₹{store.medicines?.[0]?.price || 'N/A'}
                                                            </div>
                                                            {store.distance !== undefined && (
                                                                <div className="flex items-center justify-end gap-1 text-xs text-indigo-400 font-semibold mt-1">
                                                                    <Navigation className="w-3 h-3" />
                                                                    {store.distance} km
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${store.isOpen ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                                <div className={`w-1.5 h-1.5 rounded-full ${store.isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
                                                                {store.isOpen ? 'Open' : 'Closed'}
                                                            </span>
                                                            {store.medicines?.[0]?.brand && (
                                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded">
                                                                    {store.medicines[0].brand}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {store.isOpen && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedMedicine({
                                                                        ...store.medicines[0],
                                                                        storeId: { _id: store.id, storeName: store.name }
                                                                    });
                                                                    setShowOrderModal(true);
                                                                }}
                                                                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-black rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                                                            >
                                                                <ShoppingBag className="w-3.5 h-3.5" />
                                                                Request Now
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <OrderModal
                isOpen={showOrderModal}
                onClose={() => setShowOrderModal(false)}
                medicine={selectedMedicine}
                onOrderSuccess={() => {
                    fetchStoresForMedicine(userLocation);
                }}
            />
        </div>
    );
};

export default MedicineSearch;
