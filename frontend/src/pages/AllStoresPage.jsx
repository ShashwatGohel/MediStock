import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search, MapPin, Star, Clock, Phone, ArrowLeft, Filter,
    Loader, MapPinOff, HeartPulse, Pill
} from "lucide-react";
import { motion } from "framer-motion";
import { API_URLS } from "../api";
import StoreCard from "../components/StoreCard";

const AllStoresPage = () => {
    const navigate = useNavigate();
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [savedStoreIds, setSavedStoreIds] = useState([]);

    useEffect(() => {
        fetchAllStores();
        fetchSavedStores();
    }, [sortBy]);

    const fetchAllStores = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URLS.STORES}/all?sortBy=${sortBy}`);
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

    const fetchSavedStores = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

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

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            fetchAllStores();
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${API_URLS.STORES}/all?search=${encodeURIComponent(searchQuery)}&sortBy=${sortBy}`);
            const data = await response.json();
            if (data.success) {
                setStores(data.stores);
            }
        } catch (error) {
            console.error("Error searching stores:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-['Outfit']">
            {/* Background */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px]" />
            </div>

            {/* Header */}
            <nav className="sticky top-0 z-50 w-full bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                                <HeartPulse className="text-white w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white">
                                All Stores
                            </span>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Search & Filter */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <div className="flex gap-4">
                        <div className="flex-1 relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity" />
                            <div className="relative bg-[#121212] border border-white/10 rounded-2xl p-2 flex items-center">
                                <div className="pl-4 pr-3 text-gray-400">
                                    <Search className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="Search by name or address..."
                                    className="w-full bg-transparent text-white placeholder:text-gray-500 focus:outline-none py-2"
                                />
                                <button
                                    onClick={handleSearch}
                                    className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2 rounded-xl font-bold transition-all"
                                >
                                    Search
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-[#121212] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                        >
                            <option value="name">Sort by Name</option>
                            <option value="rating">Sort by Rating</option>
                        </select>
                        <span className="text-sm text-gray-400">
                            {stores.length} stores found
                        </span>
                    </div>
                </motion.div>

                {/* Stores Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loading ? (
                        <div className="col-span-full text-center py-12">
                            <Loader className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-2" />
                            <p className="text-gray-400 text-sm">Loading stores...</p>
                        </div>
                    ) : stores.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <MapPinOff className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-50" />
                            <p className="text-gray-400 text-sm">No stores found</p>
                        </div>
                    ) : (
                        stores.map((store, index) => (
                            <StoreCard
                                key={store.id}
                                store={{
                                    ...store,
                                    isSaved: savedStoreIds.includes(store.id),
                                    onToggleSave: handleToggleSave
                                }}
                                index={index}
                                onClick={() => navigate(`/store/${store.id}`)}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllStoresPage;
