import { X, AlertTriangle, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LowStockModal = ({ isOpen, onClose, lowStockMedicines }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                            <div className="bg-[#121212] border-b border-white/5 p-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-500/10 rounded-lg">
                                        <AlertTriangle className="w-6 h-6 text-orange-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Low Stock Items</h2>
                                        <p className="text-sm text-gray-400 mt-0.5">{lowStockMedicines.length} items need restocking</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                {lowStockMedicines.length === 0 ? (
                                    <p className="text-center text-gray-500 py-12">All items are well stocked!</p>
                                ) : (
                                    <div className="space-y-3">
                                        {lowStockMedicines.map((medicine) => (
                                            <div
                                                key={medicine._id}
                                                className="bg-white/5 rounded-xl p-4 border border-orange-500/20"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h3 className="text-white font-semibold">{medicine.name}</h3>
                                                        <p className="text-sm text-gray-400 mt-1">{medicine.brand} • {medicine.category}</p>
                                                        {medicine.expiryDate && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Exp: {new Date(medicine.expiryDate).toLocaleDateString('en-IN')}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="flex items-center gap-2">
                                                            <Package className="w-4 h-4 text-orange-400" />
                                                            <span className={`text-lg font-bold ${medicine.quantity === 0 ? 'text-red-400' : 'text-orange-400'}`}>
                                                                {medicine.quantity}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1">₹{medicine.price.toFixed(2)}</p>
                                                    </div>
                                                </div>
                                                {medicine.quantity === 0 && (
                                                    <div className="mt-2 text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded">
                                                        OUT OF STOCK
                                                    </div>
                                                )}
                                            </div>
                                        ))}
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

export default LowStockModal;
