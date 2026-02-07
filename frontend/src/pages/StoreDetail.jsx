import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    MapPin, Phone, Mail, Clock, Package, Search, ArrowLeft,
    Navigation, Building2, Tag, DollarSign, AlertCircle, Loader,
    ShieldCheck, Star, ChevronRight, ShoppingBag
} from "lucide-react";
import { motion } from "framer-motion";
import OrderModal from "../components/OrderModal";
import { API_URLS } from "../api";

const StoreDetail = () => {
    const { storeId } = useParams();
    const navigate = useNavigate();

    const [store, setStore] = useState(null);
    const [medicines, setMedicines] = useState([]);
    const [filteredMedicines, setFilteredMedicines] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [medicinesLoading, setMedicinesLoading] = useState(true);
    const [error, setError] = useState("");
    const [userLocation, setUserLocation] = useState(null);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [reviewStats, setReviewStats] = useState({ averageRating: 0, count: 0 });
    const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        // Get user location from localStorage
        const savedLocation = localStorage.getItem("userLocation");
        if (savedLocation) {
            setUserLocation(JSON.parse(savedLocation));
        }

        fetchStoreDetails();
        fetchStoreMedicines();
        fetchStoreReviews();
        recordVisit();
    }, [storeId]);

    const recordVisit = async () => {
        try {
            await fetch(`${API_URLS.BILLS}/increment-visit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ storeId })
            });
        } catch (err) {
            console.error("Error recording visit:", err);
        }
    };

    const fetchStoreDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URLS.STORES}/${storeId}`);
            const data = await response.json();

            if (data.success) {
                setStore(data.store);
            } else {
                setError(data.message || "Failed to load store details");
            }
        } catch (err) {
            console.error("Error fetching store details:", err);
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fetchStoreMedicines = async () => {
        try {
            setMedicinesLoading(true);
            const response = await fetch(`${API_URLS.STORES}/${storeId}/medicines`);
            const data = await response.json();

            if (data.success) {
                setMedicines(data.medicines);
                setFilteredMedicines(data.medicines);
            }
        } catch (err) {
            console.error("Error fetching medicines:", err);
        } finally {
            setMedicinesLoading(false);
        }
    };

    const fetchStoreReviews = async () => {
        try {
            setReviewsLoading(true);
            const response = await fetch(`${API_URLS.REVIEWS}/store/${storeId}`);
            const data = await response.json();
            if (data.success) {
                setReviews(data.reviews);
                setReviewStats(data.stats);
            }
        } catch (err) {
            console.error("Error fetching reviews:", err);
        } finally {
            setReviewsLoading(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmittingReview(true);
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Please log in to leave a review");
                return;
            }

            const response = await fetch(`${API_URLS.REVIEWS}/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    storeId,
                    rating: newReview.rating,
                    comment: newReview.comment
                })
            });

            const data = await response.json();
            if (data.success) {
                setNewReview({ rating: 5, comment: "" });
                fetchStoreReviews();
            } else {
                alert(data.message || "Failed to submit review");
            }
        } catch (err) {
            console.error("Error submitting review:", err);
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        if (query === "") {
            setFilteredMedicines(medicines);
        } else {
            const filtered = medicines.filter(
                (med) =>
                    med.name.toLowerCase().includes(query) ||
                    (med.brand && med.brand.toLowerCase().includes(query)) ||
                    (med.category && med.category.toLowerCase().includes(query))
            );
            setFilteredMedicines(filtered);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading store details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Error Loading Store</h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={() => navigate("/user-dashboard")}
                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!store) return null;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-['Outfit']">
            {/* Background Ambience */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10">
                {/* Header */}
                <div className="sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <button
                            onClick={() => navigate("/user-dashboard")}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-medium">Back to Dashboard</span>
                        </button>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                    {/* Store Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#121212] border border-white/5 rounded-2xl p-6 md:p-8"
                    >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                                        <Building2 className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h1 className="text-3xl font-bold text-white mb-2">{store.name}</h1>
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${store.isOpen
                                                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                                                }`}>
                                                <div className={`w-2 h-2 rounded-full ${store.isOpen ? "bg-green-500" : "bg-red-500"}`} />
                                                {store.isOpen ? "Open Now" : "Closed"}
                                            </span>
                                            {store.distance !== undefined && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                    <Navigation className="w-3 h-3" />
                                                    {store.distance} km away
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-start gap-2 text-gray-400">
                                                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                <span>{store.address}</span>
                                            </div>
                                            {store.phone && (
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <Phone className="w-4 h-4 flex-shrink-0" />
                                                    {store.isOpen ? (
                                                        <a href={`tel:${store.phone}`} className="hover:text-emerald-400 transition-colors">
                                                            {store.phone}
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-600 line-through">{store.phone}</span>
                                                    )}
                                                </div>
                                            )}
                                            {store.email && (
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <Mail className="w-4 h-4 flex-shrink-0" />
                                                    {store.isOpen ? (
                                                        <a href={`mailto:${store.email}`} className="hover:text-emerald-400 transition-colors">
                                                            {store.email}
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-600 line-through">{store.email}</span>
                                                    )}
                                                </div>
                                            )}
                                            {store.operatingHours && (
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <Clock className="w-4 h-4 flex-shrink-0" />
                                                    <span>{store.operatingHours}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                                    <Package className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-white">{store.medicineCount || 0}</div>
                                    <div className="text-xs text-gray-400">Medicines Available</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Medicines Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-[#121212] border border-white/5 rounded-2xl p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Package className="w-6 h-6 text-emerald-400" />
                                Available Medicines
                            </h2>
                            <span className="text-sm text-gray-400">
                                {filteredMedicines.length} {filteredMedicines.length === 1 ? "item" : "items"}
                            </span>
                        </div>

                        {/* Search */}
                        <div className="relative mb-6">
                            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearch}
                                placeholder="Search medicines by name, brand, or category..."
                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-gray-600"
                            />
                        </div>

                        {/* Medicines List */}
                        <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                            {medicinesLoading ? (
                                <div className="text-center py-12">
                                    <Loader className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-2" />
                                    <p className="text-gray-400 text-sm">Loading medicines...</p>
                                </div>
                            ) : filteredMedicines.length === 0 ? (
                                <div className="text-center py-12">
                                    <Package className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-50" />
                                    <p className="text-gray-400">
                                        {searchQuery ? "No medicines found matching your search" : "No medicines available"}
                                    </p>
                                </div>
                            ) : (
                                filteredMedicines.map((medicine, index) => (
                                    <motion.div
                                        key={medicine._id}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.02 }}
                                        className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
                                                        {medicine.name}
                                                    </h3>
                                                    {medicine.quantity > 0 && (
                                                        store.isOpen ? (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedMedicine({ ...medicine, storeId: { _id: storeId, storeName: store.name } });
                                                                    setShowOrderModal(true);
                                                                }}
                                                                className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-lg text-xs font-bold transition-all border border-emerald-500/20 flex items-center gap-1.5"
                                                            >
                                                                <ShoppingBag className="w-3 h-3" />
                                                                Order Now
                                                            </button>
                                                        ) : (
                                                            <span className="px-3 py-1 bg-red-500/10 text-red-400 rounded-lg text-xs font-bold border border-red-500/20 flex items-center gap-1.5 cursor-not-allowed">
                                                                <Clock className="w-3 h-3" />
                                                                Store Closed
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-400">
                                                    {medicine.brand && (
                                                        <span className="flex items-center gap-1">
                                                            <Building2 className="w-3.5 h-3.5" />
                                                            {medicine.brand}
                                                        </span>
                                                    )}
                                                    {medicine.category && (
                                                        <span className="flex items-center gap-1">
                                                            <Tag className="w-3.5 h-3.5" />
                                                            {medicine.category}
                                                        </span>
                                                    )}
                                                    <span className={`flex items-center gap-1 font-semibold ${medicine.quantity === 0 ? "text-red-400" :
                                                        medicine.quantity <= 5 ? "text-orange-400" :
                                                            medicine.quantity <= 10 ? "text-yellow-400" :
                                                                "text-green-400"
                                                        }`}>
                                                        <Package className="w-3.5 h-3.5" />
                                                        {medicine.quantity > 0 ? `${medicine.quantity} in stock` : "Out of stock"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right ml-4">
                                                <div className="text-2xl font-bold text-emerald-400">
                                                    ₹{medicine.price}
                                                </div>
                                                {medicine.quantity > 0 && (
                                                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                                                        Available
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>

                    {/* Reviews Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-[#121212] border border-white/5 rounded-2xl p-6"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                                    Ratings & Reviews
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Based on {reviewStats.count} {reviewStats.count === 1 ? 'review' : 'reviews'}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                                <span className="text-3xl font-bold text-white">{reviewStats.averageRating ? reviewStats.averageRating.toFixed(1) : "0.0"}</span>
                                <div className="flex flex-col">
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star key={s} className={`w-3 h-3 ${s <= Math.round(reviewStats.averageRating) ? "text-yellow-500 fill-yellow-500" : "text-gray-600"}`} />
                                        ))}
                                    </div>
                                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Average Rating</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Review Form */}
                            <div className="bg-white/5 rounded-2xl p-6 border border-white/5 h-fit">
                                <h3 className="text-lg font-bold text-white mb-4">Leave a Review</h3>
                                <form onSubmit={handleReviewSubmit} className="space-y-4">
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setNewReview({ ...newReview, rating: s })}
                                                className={`p-2 rounded-lg transition-all ${newReview.rating >= s ? "text-yellow-500" : "text-gray-600"}`}
                                            >
                                                <Star className={`w-6 h-6 ${newReview.rating >= s ? "fill-yellow-500" : ""}`} />
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        value={newReview.comment}
                                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                        placeholder="Share your experience with this pharmacy..."
                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-gray-600 resize-none h-24"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={submittingReview}
                                        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                                    >
                                        {submittingReview ? "Submitting..." : "Submit Review"}
                                    </button>
                                </form>
                            </div>

                            {/* Review List */}
                            <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                {reviewsLoading ? (
                                    <div className="text-center py-8">
                                        <Loader className="w-6 h-6 text-emerald-500 animate-spin mx-auto mb-2" />
                                        <p className="text-gray-500 text-sm">Loading reviews...</p>
                                    </div>
                                ) : reviews.length === 0 ? (
                                    <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
                                        <Star className="w-10 h-10 text-gray-700 mx-auto mb-3 opacity-50" />
                                        <p className="text-gray-500 text-sm italic">No reviews yet. Be the first to rate!</p>
                                    </div>
                                ) : (
                                    reviews.map((review) => (
                                        <div key={review._id} className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-white text-sm">{review.userId?.name || "Anonymous"}</h4>
                                                    <div className="flex gap-0.5 mt-0.5">
                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                            <Star key={s} className={`w-2.5 h-2.5 ${s <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-700"}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <span className="text-[10px] text-gray-600">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-400 leading-relaxed italic">
                                                "{review.comment}"
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <OrderModal
                isOpen={showOrderModal}
                onClose={() => setShowOrderModal(false)}
                medicine={selectedMedicine}
                onOrderSuccess={() => {
                    fetchStoreMedicines();
                }}
            />

            <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.5);
        }
      `}</style>
        </div>
    );
};

export default StoreDetail;
