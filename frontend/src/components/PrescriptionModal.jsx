import React, { useState } from "react";
import { X, Upload, Search, Pill, Store, Loader, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PrescriptionModal = ({ isOpen, onClose, userLocation }) => {
    const [step, setStep] = useState(1);
    const [prescription, setPrescription] = useState(null);
    const [medicines, setMedicines] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [foundStores, setFoundStores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedMedicines, setSelectedMedicines] = useState([]);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPrescription(URL.createObjectURL(file));
            setStep(2);
        }
    };

    const searchMedicines = async () => {
        if (!searchQuery) return;
        setLoading(true);
        try {
            // Find stores that have this medicine
            const response = await fetch(`http://localhost:5000/api/stores/search?medicine=${encodeURIComponent(searchQuery)}&lat=${userLocation.latitude}&lng=${userLocation.longitude}&radius=10`);
            const data = await response.json();
            if (data.success) {
                setFoundStores(data.stores);
            }
        } catch (error) {
            console.error("Error searching medicines:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendRequest = async (storeId, items, total) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/api/orders/request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    storeId,
                    items,
                    totalAmount: total,
                    prescriptionImage: prescription // In a real app, upload to S3 first
                })
            });
            const data = await response.json();
            if (data.success) {
                alert("Request sent successfully!");
                onClose();
            }
        } catch (error) {
            alert("Failed to send request");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-500" />
                        {step === 1 ? "Upload Prescription" : "Find Medicines"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {step === 1 ? (
                        <div className="space-y-6">
                            <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 text-center group hover:border-emerald-500/50 transition-colors">
                                <input
                                    type="file"
                                    id="prescription-upload"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    accept="image/*"
                                />
                                <label htmlFor="prescription-upload" className="cursor-pointer flex flex-col items-center">
                                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Upload className="w-8 h-8 text-emerald-500" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">Select Prescription Image</h3>
                                    <p className="text-gray-400 text-sm">Upload a clear photo of your doctor's prescription</p>
                                </label>
                            </div>
                            <div className="text-center">
                                <p className="text-gray-500 text-sm mb-4">OR</p>
                                <button
                                    onClick={() => setStep(2)}
                                    className="text-emerald-500 hover:text-emerald-400 font-bold transition-colors flex items-center gap-2 mx-auto"
                                >
                                    <Search className="w-4 h-4" /> Continue with Manual Search
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Type medicine name from prescription..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <button
                                    onClick={searchMedicines}
                                    className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-xl font-bold transition-colors"
                                >
                                    Search
                                </button>
                            </div>

                            <div className="space-y-4">
                                {loading ? (
                                    <div className="flex flex-col items-center py-8">
                                        <Loader className="w-8 h-8 text-emerald-500 animate-spin mb-2" />
                                        <p className="text-gray-400">Searching stores...</p>
                                    </div>
                                ) : foundStores.length > 0 ? (
                                    foundStores.map(store => (
                                        <div key={store.id} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-white">{store.name}</h4>
                                                <span className="text-[10px] font-bold text-emerald-400">{store.distance}km away</span>
                                            </div>
                                            <div className="space-y-2">
                                                {store.medicines.map(med => (
                                                    <div key={med.id} className="flex items-center justify-between bg-white/5 p-2 rounded-lg">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm text-gray-200 font-medium">{med.name}</span>
                                                            <span className="text-[10px] text-gray-500">{med.brand} • In Stock: {med.quantity}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-sm font-bold text-white">₹{med.price}</span>
                                                            <button
                                                                onClick={() => handleSendRequest(
                                                                    store.id,
                                                                    [{ medicineId: med.id, medicineName: med.name, quantity: 1, price: med.price }],
                                                                    med.price
                                                                )}
                                                                className="bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1 rounded-lg text-xs font-bold transition-all"
                                                            >
                                                                Request
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : searchQuery && (
                                    <p className="text-center text-gray-500 py-8">No stores found with this medicine nearby.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default PrescriptionModal;
