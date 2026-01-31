import { useState } from "react";
import { X, Package, DollarSign, Calendar, Tag, Pill, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URLS } from "../api";

const AddMedicineModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: "",
        brand: "",
        category: "",
        quantity: "",
        price: "",
        expiryDate: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [catalogResults, setCatalogResults] = useState([]);
    const [searchingCatalog, setSearchingCatalog] = useState(false);
    const [showCatalogDropdown, setShowCatalogDropdown] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(""); // Clear error on input change

        if (name === "name") {
            handleCatalogSearch(value);
        }
    };

    const handleCatalogSearch = async (query) => {
        if (!query.trim() || query.length < 2) {
            setCatalogResults([]);
            setShowCatalogDropdown(false);
            return;
        }

        try {
            setSearchingCatalog(true);
            const response = await fetch(`${API_URLS.MEDICINES}/catalog?search=${encodeURIComponent(query)}`);
            const data = await response.json();
            if (data.success) {
                setCatalogResults(data.catalog);
                setShowCatalogDropdown(data.catalog.length > 0);
            }
        } catch (err) {
            console.error("Catalog search error:", err);
        } finally {
            setSearchingCatalog(false);
        }
    };

    const selectFromCatalog = (item) => {
        setFormData(prev => ({
            ...prev,
            name: item.name,
            brand: item.brand,
            category: item.category
        }));
        setShowCatalogDropdown(false);
        setCatalogResults([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Validation
        if (!formData.name || !formData.quantity || !formData.price) {
            setError("Please fill in all required fields");
            return;
        }

        if (parseFloat(formData.quantity) < 0) {
            setError("Quantity cannot be negative");
            return;
        }

        if (parseFloat(formData.price) <= 0) {
            setError("Price must be greater than 0");
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`${API_URLS.MEDICINES}/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    quantity: parseInt(formData.quantity),
                    price: parseFloat(formData.price),
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Reset form
                setFormData({
                    name: "",
                    brand: "",
                    category: "",
                    quantity: "",
                    price: "",
                    expiryDate: "",
                });

                // Call success callback
                if (onSuccess) {
                    onSuccess(data.medicine);
                }

                // Close modal
                onClose();
            } else {
                setError(data.message || "Failed to add medicine");
            }
        } catch (err) {
            console.error("Error adding medicine:", err);
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            {/* Header */}
                            <div className="sticky top-0 bg-[#121212] border-b border-white/5 p-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                                        <Package className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Add New Medicine</h2>
                                        <p className="text-sm text-gray-400 mt-0.5">Add medicine to your inventory</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                {/* Error Message */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                {/* Medicine Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                        <Pill className="w-4 h-4 text-indigo-400" />
                                        Medicine Name <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            onFocus={() => formData.name.length >= 2 && setShowCatalogDropdown(true)}
                                            placeholder="e.g., Paracetamol 500mg"
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                                            required
                                            autoComplete="off"
                                        />

                                        {/* Catalog Dropdown */}
                                        <AnimatePresence>
                                            {showCatalogDropdown && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="absolute z-[60] left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto"
                                                >
                                                    {catalogResults.map((item, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => selectFromCatalog(item)}
                                                            className="w-full text-left px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors flex items-center justify-between group"
                                                        >
                                                            <div>
                                                                <p className="text-white font-medium group-hover:text-indigo-400 transition-colors">{item.name}</p>
                                                                <p className="text-xs text-gray-500">{item.brand} • {item.category}</p>
                                                            </div>
                                                            <div className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded uppercase">Catalog</div>
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Brand & Category */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-blue-400" />
                                            Brand
                                        </label>
                                        <input
                                            type="text"
                                            name="brand"
                                            value={formData.brand}
                                            onChange={handleChange}
                                            placeholder="e.g., Crocin"
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-purple-400" />
                                            Category
                                        </label>
                                        <input
                                            type="text"
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            placeholder="e.g., Pain Relief"
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Quantity & Price */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                            <Package className="w-4 h-4 text-green-400" />
                                            Quantity <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            placeholder="0"
                                            min="0"
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-emerald-400" />
                                            Price (₹) <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0"
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Expiry Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-orange-400" />
                                        Expiry Date
                                    </label>
                                    <input
                                        type="date"
                                        name="expiryDate"
                                        value={formData.expiryDate}
                                        onChange={handleChange}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg font-semibold transition-all border border-white/10"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-semibold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? "Adding..." : "Add Medicine"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AddMedicineModal;
