import { MapPin, Navigation, Star, ChevronRight, Clock, Package, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

const StoreCard = ({ store, onClick, onOrderClick, index = 0 }) => {
    const getStatusColor = () => {
        if (!store.isOpen) return "text-red-400";
        return "text-green-400";
    };

    const getStatusText = () => {
        if (!store.isOpen) return "Closed";
        return store.operatingHours || "Open";
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={onClick}
            className="group bg-[#121212] hover:bg-[#1a1a1a] border border-white/5 hover:border-emerald-500/30 rounded-xl p-4 transition-all cursor-pointer"
        >
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                        <MapPin className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-200 group-hover:text-emerald-400 transition-colors truncate">
                            {store.name}
                        </h3>

                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {store.address}
                        </p>

                        <div className="flex items-center gap-3 mt-2 text-xs">
                            <span className="flex items-center gap-1 text-gray-400">
                                <Navigation className="w-3 h-3" />
                                {store.distance} km
                            </span>

                            {store.medicineCount !== undefined && (
                                <>
                                    <span className="text-gray-600">•</span>
                                    <span className="flex items-center gap-1 text-gray-400">
                                        <Package className="w-3 h-3" />
                                        {store.medicineCount} items
                                    </span>
                                </>
                            )}

                            <span className="text-gray-600">•</span>
                            <span className={`flex items-center gap-1 ${getStatusColor()}`}>
                                <Clock className="w-3 h-3" />
                                {getStatusText()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (store.onToggleSave) store.onToggleSave(store.id);
                        }}
                        className={`p-2 rounded-lg border transition-all ${store.isSaved ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'}`}
                    >
                        <Star className={`w-4 h-4 ${store.isSaved ? 'fill-yellow-500' : ''}`} />
                    </button>
                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
            </div>

            {/* Matching Medicines */}
            {store.medicines && store.medicines.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2">Matching Medicines</p>
                    <div className="grid gap-2">
                        {store.medicines.map((med) => (
                            <div key={med.id} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/5 group/med">
                                <div className="min-w-0">
                                    <h4 className="text-sm font-semibold text-white truncate">{med.name}</h4>
                                    <p className="text-[10px] text-gray-500">{med.brand} • ₹{med.price}</p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onOrderClick) onOrderClick({ ...med, storeId: { _id: store.id, storeName: store.name } });
                                    }}
                                    className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-lg text-[10px] font-bold transition-all border border-emerald-500/10 flex items-center gap-1.5 whitespace-nowrap"
                                >
                                    <ShoppingBag className="w-3 h-3" />
                                    Order Now
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default StoreCard;
