import { useState, useEffect } from "react";
import { X, Plus, Trash2, Receipt, DollarSign, User, Phone, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CreateBillModal = ({ isOpen, onClose, onSuccess }) => {
    const [medicines, setMedicines] = useState([]);
    const [billItems, setBillItems] = useState([{ medicineId: "", quantity: 1 }]);
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            fetchMedicines();
        }
    }, [isOpen]);

    const fetchMedicines = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/api/medicines/my-medicines", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setMedicines(data.medicines.filter(m => m.quantity > 0));
            }
        } catch (err) {
            console.error("Error fetching medicines:", err);
        }
    };

    const addItem = () => {
        setBillItems([...billItems, { medicineId: "", quantity: 1 }]);
    };

    const removeItem = (index) => {
        if (billItems.length > 1) {
            setBillItems(billItems.filter((_, i) => i !== index));
        }
    };

    const updateItem = (index, field, value) => {
        const updated = [...billItems];
        updated[index][field] = value;
        setBillItems(updated);
    };

    const getMedicine = (medicineId) => {
        return medicines.find(m => m._id === medicineId);
    };

    const calculateTotal = () => {
        return billItems.reduce((total, item) => {
            const medicine = getMedicine(item.medicineId);
            if (medicine && item.quantity > 0) {
                return total + (medicine.price * item.quantity);
            }
            return total;
        }, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Validation
        const validItems = billItems.filter(item => item.medicineId && item.quantity > 0);
        if (validItems.length === 0) {
            setError("Please add at least one item to the bill");
            return;
        }

        // Check stock availability
        for (const item of validItems) {
            const medicine = getMedicine(item.medicineId);
            if (!medicine) {
                setError("Invalid medicine selected");
                return;
            }
            if (medicine.quantity < item.quantity) {
                setError(`Insufficient stock for ${medicine.name}. Available: ${medicine.quantity}`);
                return;
            }
        }

        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            const response = await fetch("http://localhost:5000/api/bills/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    items: validItems,
                    paymentMethod,
                    customerName: customerName || undefined,
                    customerPhone: customerPhone || undefined
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Reset form
                setBillItems([{ medicineId: "", quantity: 1 }]);
                setPaymentMethod("cash");
                setCustomerName("");
                setCustomerPhone("");

                // Call success callback
                if (onSuccess) {
                    onSuccess(data.bill);
                }

                // Close modal
                onClose();
            } else {
                setError(data.message || "Failed to create bill");
            }
        } catch (err) {
            console.error("Error creating bill:", err);
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
                        <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                            {/* Header */}
                            <div className="sticky top-0 bg-[#121212] border-b border-white/5 p-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-500/10 rounded-lg">
                                        <Receipt className="w-6 h-6 text-green-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Create Bill</h2>
                                        <p className="text-sm text-gray-400 mt-0.5">Generate invoice for customer</p>
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
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

                                {/* Bill Items */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm font-medium text-gray-300">
                                            Items <span className="text-red-400">*</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={addItem}
                                            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                                        >
                                            <Plus className="w-3 h-3" /> Add Item
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {billItems.map((item, index) => {
                                            const medicine = getMedicine(item.medicineId);
                                            const itemTotal = medicine && item.quantity > 0
                                                ? medicine.price * item.quantity
                                                : 0;

                                            return (
                                                <div key={index} className="flex gap-3 items-start bg-white/5 p-3 rounded-lg border border-white/5">
                                                    <div className="flex-1 grid grid-cols-2 gap-3">
                                                        <div>
                                                            <select
                                                                value={item.medicineId}
                                                                onChange={(e) => updateItem(index, "medicineId", e.target.value)}
                                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                                                                required
                                                            >
                                                                <option value="">Select Medicine</option>
                                                                {medicines.map(med => (
                                                                    <option key={med._id} value={med._id}>
                                                                        {med.name} (Stock: {med.quantity})
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            {medicine && (
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    ₹{medicine.price} per unit
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <input
                                                                type="number"
                                                                value={item.quantity}
                                                                onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                                                                min="1"
                                                                max={medicine?.quantity || 999}
                                                                placeholder="Qty"
                                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                                                                required
                                                            />
                                                            {itemTotal > 0 && (
                                                                <p className="text-xs text-green-400 mt-1 font-semibold">
                                                                    Total: ₹{itemTotal}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {billItems.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(index)}
                                                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-400" />
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Total Amount */}
                                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300 font-medium">Total Amount</span>
                                        <span className="text-2xl font-bold text-green-400">₹{calculateTotal()}</span>
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-blue-400" />
                                        Payment Method <span className="text-red-400">*</span>
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {["cash", "card", "upi"].map(method => (
                                            <button
                                                key={method}
                                                type="button"
                                                onClick={() => setPaymentMethod(method)}
                                                className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${paymentMethod === method
                                                    ? "bg-indigo-500 text-white"
                                                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                                                    }`}
                                            >
                                                {method.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Customer Details (Optional) */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                            <User className="w-4 h-4 text-purple-400" />
                                            Customer Name
                                        </label>
                                        <input
                                            type="text"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            placeholder="Optional"
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-orange-400" />
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={customerPhone}
                                            onChange={(e) => setCustomerPhone(e.target.value)}
                                            placeholder="Optional"
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                                        />
                                    </div>
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
                                        disabled={loading || calculateTotal() === 0}
                                        className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold shadow-lg shadow-green-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? "Creating..." : "Create Bill"}
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

export default CreateBillModal;
