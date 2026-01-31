import { useState, useEffect } from "react";
import { X, Eye, Calendar, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URLS } from "../api";

const VisitsModal = ({ isOpen, onClose }) => {
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchVisitHistory();
        }
    }, [isOpen]);

    const fetchVisitHistory = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URLS.BILLS}/visit-history`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setVisits(data.visits);
            }
        } catch (error) {
            console.error("Error fetching visit history:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const totalVisits = visits.reduce((sum, visit) => sum + visit.count, 0);

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
                                    <div className="p-2 bg-purple-500/10 rounded-lg">
                                        <Eye className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Profile Visits</h2>
                                        <p className="text-sm text-gray-400 mt-0.5">Total: {totalVisits} visits</p>
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
                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                                    </div>
                                ) : visits.length === 0 ? (
                                    <p className="text-center text-gray-500 py-12">No visit history available</p>
                                ) : (
                                    <div className="space-y-3">
                                        {visits.map((visit, idx) => (
                                            <div
                                                key={visit._id}
                                                className="bg-white/5 rounded-xl p-4 border border-white/5 flex justify-between items-center"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-purple-500/10 rounded-lg">
                                                        <Calendar className="w-4 h-4 text-purple-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium">{formatDate(visit.date)}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {idx === 0 ? "Today" : `${idx} day${idx !== 1 ? 's' : ''} ago`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center gap-2">
                                                        <TrendingUp className="w-4 h-4 text-purple-400" />
                                                        <span className="text-2xl font-bold text-purple-400">{visit.count}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500">visits</p>
                                                </div>
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

export default VisitsModal;
