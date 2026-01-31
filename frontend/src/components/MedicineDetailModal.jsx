import { useState, useEffect } from "react";
import { X, Save, Edit2, Package, Tag, Calculator, Calendar, Info, Loader } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URLS } from "../api";

const MedicineDetailModal = ({ isOpen, onClose, medicine, onSuccess }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        brand: "",
        category: "",
        quantity: 0,
        price: 0,
        expiryDate: "",
        description: ""
    });

    useEffect(() => {
        if (medicine) {
            setFormData({
                name: medicine.name || "",
                brand: medicine.brand || "",
                category: medicine.category || "",
                quantity: medicine.quantity || 0,
                price: medicine.price || 0,
                expiryDate: medicine.expiryDate ? new Date(medicine.expiryDate).toISOString().split('T')[0] : "",
                description: medicine.description || ""
            });
            setIsEditing(false);
        }
    }, [medicine]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URLS.MEDICINES}/update/${medicine._id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                onSuccess();
                setIsEditing(false);
            } else {
                alert(data.message || "Failed to update medicine");
            }
        } catch (error) {
            console.error(error);
            alert("Error updating medicine");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !medicine) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-[#121212] border border-white/10 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
                >
                    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-indigo-500/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-lg">
                                <Package className="w-5 h-5 text-indigo-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Medicine Details</h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1.5 block">Medicine Name</label>
                                    <div className="relative group">
                                        <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500/50 group-focus-within:text-indigo-500 transition-colors" />
                                        <input
                                            required
                                            disabled={!isEditing}
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 disabled:opacity-60 transition-all font-Outfit"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1.5 block">Brand / Company</label>
                                    <div className="relative group">
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500/50" />
                                        <input
                                            disabled={!isEditing}
                                            name="brand"
                                            value={formData.brand}
                                            onChange={handleChange}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white disabled:opacity-60"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1.5 block">Category</label>
                                    <input
                                        disabled={!isEditing}
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 px-4 text-white disabled:opacity-60"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1.5 block">Quantity</label>
                                        <input
                                            required
                                            type="number"
                                            disabled={!isEditing}
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 px-4 text-white disabled:opacity-60"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1.5 block">Price (₹)</label>
                                        <input
                                            required
                                            type="number"
                                            step="0.01"
                                            disabled={!isEditing}
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 px-4 text-white disabled:opacity-60"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1.5 block">Expiry Date</label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500/50" />
                                        <input
                                            type="date"
                                            disabled={!isEditing}
                                            name="expiryDate"
                                            value={formData.expiryDate}
                                            onChange={handleChange}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white disabled:opacity-60"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1.5 block">Description / Notes</label>
                            <div className="relative group">
                                <Info className="absolute left-3 top-3 w-4 h-4 text-indigo-500/50" />
                                <textarea
                                    disabled={!isEditing}
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Enter medicine description, dosage info, or side effects..."
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white h-32 resize-none transition-all focus:border-indigo-500/50 focus:bg-indigo-500/5 disabled:opacity-60"
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            {!isEditing ? (
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="flex-1 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                                >
                                    <Edit2 className="w-4 h-4 text-indigo-400" /> Edit Details
                                </button>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 py-3 bg-white/5 border border-white/10 text-gray-400 rounded-xl font-bold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-[2] py-3 bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
                                    </button>
                                </>
                            )}
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default MedicineDetailModal;
