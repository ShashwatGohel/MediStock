import { useState, useEffect } from "react";
import { X, FileText, Calendar, DollarSign, User, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URLS } from "../api";

const BillsModal = ({ isOpen, onClose }) => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchBills();
        }
    }, [isOpen]);

    const fetchBills = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URLS.BILLS}/my-bills`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setBills(data.bills);
            }
        } catch (error) {
            console.error("Error fetching bills:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
                        onClick={() => { setSelectedBill(null); onClose(); }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                            {/* Header */}
                            <div className="bg-[#121212] border-b border-white/5 p-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                                        <FileText className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">All Bills</h2>
                                        <p className="text-sm text-gray-400 mt-0.5">View all transaction history</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setSelectedBill(null); onClose(); }}
                                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                                    </div>
                                ) : selectedBill ? (
                                    /* Bill Details View */
                                    <div className="space-y-4">
                                        <button
                                            onClick={() => setSelectedBill(null)}
                                            className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-2"
                                        >
                                            ← Back to all bills
                                        </button>

                                        <div className="bg-white/5 rounded-xl p-6 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-xl font-bold text-white">{selectedBill.billNumber}</h3>
                                                    <p className="text-sm text-gray-400">{formatDate(selectedBill.date)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-emerald-400">₹{selectedBill.totalAmount.toFixed(2)}</p>
                                                    <p className="text-xs text-gray-400 uppercase">{selectedBill.paymentMethod}</p>
                                                </div>
                                            </div>

                                            {selectedBill.customerName && (
                                                <div className="border-t border-white/5 pt-4 space-y-2">
                                                    <div className="flex items-center gap-2 text-gray-300">
                                                        <User className="w-4 h-4" />
                                                        <span>{selectedBill.customerName}</span>
                                                    </div>
                                                    {selectedBill.customerPhone && (
                                                        <div className="flex items-center gap-2 text-gray-300">
                                                            <Phone className="w-4 h-4" />
                                                            <span>{selectedBill.customerPhone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="border-t border-white/5 pt-4">
                                                <h4 className="text-sm font-semibold text-gray-400 mb-3">Items</h4>
                                                <div className="space-y-2">
                                                    {selectedBill.items.map((item, idx) => (
                                                        <div key={idx} className="flex justify-between items-center bg-black/20 p-3 rounded-lg">
                                                            <div>
                                                                <p className="text-white font-medium">{item.medicineName}</p>
                                                                <p className="text-xs text-gray-400">Qty: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                                                            </div>
                                                            <p className="text-white font-semibold">₹{item.total.toFixed(2)}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Bills List View */
                                    <div className="space-y-3">
                                        {bills.length === 0 ? (
                                            <p className="text-center text-gray-500 py-12">No bills found</p>
                                        ) : (
                                            bills.map((bill) => (
                                                <div
                                                    key={bill._id}
                                                    onClick={() => setSelectedBill(bill)}
                                                    className="bg-white/5 hover:bg-white/10 rounded-xl p-4 cursor-pointer transition-all border border-white/5 hover:border-indigo-500/30"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="text-white font-semibold">{bill.billNumber}</h3>
                                                            <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                                                                <Calendar className="w-3 h-3" />
                                                                {formatDate(bill.date)}
                                                            </p>
                                                            {bill.customerName && (
                                                                <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                                                                    <User className="w-3 h-3" />
                                                                    {bill.customerName}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-bold text-emerald-400">₹{bill.totalAmount.toFixed(2)}</p>
                                                            <p className="text-xs text-gray-500 uppercase mt-1">{bill.paymentMethod}</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 text-xs text-gray-500">
                                                        {bill.items.length} item{bill.items.length !== 1 ? 's' : ''}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default BillsModal;
