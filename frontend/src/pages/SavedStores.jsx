import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ChevronLeft, Star, MapPin, Navigation, Clock,
    Search, Heart, Store, ExternalLink, Phone, MapPinOff
} from "lucide-react";
import { motion } from "framer-motion";
import StoreCard from "../components/StoreCard";

const SavedStores = () => {
    const navigate = useNavigate();
    const [savedStores, setSavedStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchSavedStores();
    }, []);

    const fetchSavedStores = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch("https://medistock-3a3y.onrender.com/api/stores/saved", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setSavedStores(data.stores);
            }
        } catch (error) {
            console.error("Error fetching saved stores:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleSave = async (storeId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`https://medistock-3a3y.onrender.com/api/stores/toggle-save/${storeId}`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                // Refresh list
                setSavedStores(prev => prev.filter(s => s.id !== storeId));
            }
        } catch (error) {
            console.error("Error toggling save:", error);
        }
    };

    const filteredStores = savedStores.filter(store =>
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/user-dashboard")}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                Saved Pharmacies <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                            </h1>
                            <p className="text-gray-400 text-sm">Pharmacies you've bookmarked for quick access</p>
                        </div>
                    </div>

                    <div className="relative flex-1 md:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search saved stores..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/5 focus:border-emerald-500/50 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none transition-all"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredStores.length === 0 ? (
                    <div className="text-center py-24 bg-[#121212] rounded-3xl border border-white/5">
                        <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Star className="w-10 h-10 text-yellow-500/50" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-400">No saved pharmacies</h3>
                        <p className="text-gray-500 mt-2">
                            {searchQuery ? "No matches found for your search." : "Stores you save will appear here for easy access."}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => navigate("/user-dashboard")}
                                className="mt-8 bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"
                            >
                                Browse Nearby Stores
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredStores.map((store, idx) => (
                            <StoreCard
                                key={store.id}
                                store={{ ...store, isSaved: true, onToggleSave: handleToggleSave }}
                                index={idx}
                                onClick={() => navigate(`/store/${store.id}`)}
                            />
                        ))}
                    </div>
                )}

                {/* Quick Info Tip */}
                {filteredStores.length > 0 && (
                    <div className="mt-12 p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 flex-shrink-0">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Save Tip</p>
                            <p className="text-xs text-gray-400 mt-1">
                                Saving your favorite pharmacies allows you to quickly check their current medicine inventory without refreshing your location.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedStores;
