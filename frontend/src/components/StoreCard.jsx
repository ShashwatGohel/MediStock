import { MapPin, Navigation, Star, ChevronRight, Clock, Package } from "lucide-react";
import { motion } from "framer-motion";

const StoreCard = ({ store, onClick, index = 0 }) => {
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

                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
            </div>
        </motion.div>
    );
};

export default StoreCard;
