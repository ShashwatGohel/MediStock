import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, Package, AlertCircle, CheckCircle2, Loader } from "lucide-react";
import { API_URLS } from "../api";

const OrderModal = ({ isOpen, onClose, medicine, onOrderSuccess }) => {
    const [quantity, setQuantity] = useState(1);
    const [preservationTime, setPreservationTime] = useState(60);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [status, setStatus] = useState("idle"); // idle, success

    if (!medicine) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URLS.ORDERS}/request`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    storeId: medicine.storeId?._id || medicine.storeId,
                    items: [{
                        medicineId: medicine._id,
                        medicineName: medicine.name,
                        quantity: parseInt(quantity) || 1,
                        price: medicine.price
                    }],
                    totalAmount: medicine.price * (parseInt(quantity) || 1),
                    preservationTime: parseInt(preservationTime) || 60
                })
            });

            const data = await response.json();
            if (data.success) {
                setStatus("success");
                if (onOrderSuccess) onOrderSuccess();
                setTimeout(() => {
                    onClose();
                    setStatus("idle");
                    setQuantity(1);
                }, 2000);
            } else {
                setError(data.message || "Failed to place order");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
                    >
                        {status === "success" ? (
                            <div className="p-8 text-center space-y-4">
                                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Order Sent!</h2>
                                <p className="text-gray-400">Your request has been sent to the store owner for approval.</p>
                            </div>
                        ) : (
                            <>
                                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        <ShoppingBag className="w-5 h-5 text-emerald-400" />
                                        Confirm Order
                                    </h2>
                                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-6">
                                    <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                                        <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Package className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg">{medicine.name}</h3>
                                            <p className="text-sm text-gray-400">₹{medicine.price} per unit</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400">Quantity</label>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                    className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors text-xl font-bold"
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    value={quantity}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === "") {
                                                            setQuantity("");
                                                        } else {
                                                            const num = parseInt(val);
                                                            if (!isNaN(num)) {
                                                                setQuantity(Math.min(medicine.quantity, num));
                                                            }
                                                        }
                                                    }}
                                                    className="flex-1 bg-black/40 border border-white/10 rounded-xl py-3 text-center text-white text-xl font-bold focus:outline-none focus:border-emerald-500/50"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setQuantity(Math.min(medicine.quantity, quantity + 1))}
                                                    className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors text-xl font-bold"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <p className="text-xs text-center text-gray-500">{medicine.quantity} units available</p>
                                        </div>

                                        <div className="space-y-4 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-medium text-emerald-400">Preservation Time</label>
                                                <span className="text-sm font-bold text-white bg-emerald-500/20 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                                                    {preservationTime} mins
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                min="1"
                                                max="60"
                                                value={preservationTime}
                                                onChange={(e) => setPreservationTime(e.target.value)}
                                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                            />
                                            <div className="flex justify-between text-[10px] text-gray-500 font-medium">
                                                <span>1 Min</span>
                                                <span>Restored if not confirmed</span>
                                                <span>60 Mins</span>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-white/5 space-y-3">
                                            <div className="flex items-center justify-between text-lg">
                                                <span className="text-gray-400">Total Amount</span>
                                                <span className="font-bold text-emerald-400 text-2xl">₹{medicine.price * (parseInt(quantity) || 0)}</span>
                                            </div>

                                            {error && (
                                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-500 text-sm">
                                                    <AlertCircle className="w-4 h-4" />
                                                    {error}
                                                </div>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                                            >
                                                {loading ? <Loader className="w-5 h-5 animate-spin" /> : <ShoppingBag className="w-5 h-5" />}
                                                Place Request
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default OrderModal;
