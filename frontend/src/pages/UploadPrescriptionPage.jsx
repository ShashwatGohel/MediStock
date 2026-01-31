import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    X, Upload, Search, Pill, Store, Loader,
    CheckCircle2, AlertCircle, FileText, ArrowLeft,
    Bell, HeartPulse, Sparkles, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URLS } from "../api";

const UploadPrescriptionPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [prescription, setPrescription] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [foundStores, setFoundStores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) setUser(JSON.parse(userData));

        const savedLocation = localStorage.getItem("userLocation");
        if (savedLocation) setUserLocation(JSON.parse(savedLocation));
    }, []);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPrescription(URL.createObjectURL(file));
            setStep(2);
        }
    };

    const searchMedicines = async () => {
        if (!searchQuery || !userLocation) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_URLS.STORES}/search?medicine=${encodeURIComponent(searchQuery)}&lat=${userLocation.latitude}&lng=${userLocation.longitude}&radius=10`);
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
            const response = await fetch(`${API_URLS.ORDERS}/request`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    storeId,
                    items,
                    totalAmount: total,
                    prescriptionImage: prescription
                })
            });
            const data = await response.json();
            if (data.success) {
                alert("Request sent successfully!");
                navigate('/my-orders');
            }
        } catch (error) {
            alert("Failed to send request");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-['Outfit'] relative pb-20">
            {/* 🔮 Background Ambience */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
            </div>

            {/* 🧭 Navbar */}
            <nav className="sticky top-0 z-50 w-full bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/user-dashboard')}
                            className="p-2 hover:bg-white/5 rounded-full transition-colors group"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white" />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                                <FileText className="text-white w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white">
                                Prescription Upload
                            </span>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
                <header className="mb-12 text-center">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="text-4xl font-bold text-white mb-4">
                            {step === 1 ? "Upload Your Prescription" : "Search Medicines"}
                        </h1>
                        <p className="text-gray-400 max-w-xl mx-auto">
                            {step === 1
                                ? "Get your medicines faster by uploading a clear photo of your doctor's prescription."
                                : "Identify the medicines from your prescription to find them in nearby stores."
                            }
                        </p>
                    </motion.div>
                </header>

                <div className="bg-[#121212] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="p-8">
                        {step === 1 ? (
                            <div className="space-y-8">
                                <div className="border-2 border-dashed border-white/10 rounded-2xl p-16 text-center group hover:border-emerald-500/50 transition-all bg-white/[0.02]">
                                    <input
                                        type="file"
                                        id="prescription-page-upload"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                        accept="image/*"
                                    />
                                    <label htmlFor="prescription-page-upload" className="cursor-pointer flex flex-col items-center">
                                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                            <Upload className="w-10 h-10 text-emerald-500" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-2">Select Image</h3>
                                        <p className="text-gray-400">PNG, JPG or PDF up to 10MB</p>
                                    </label>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="h-px flex-1 bg-white/5"></div>
                                    <span className="text-gray-600 font-bold text-sm">OR</span>
                                    <div className="h-px flex-1 bg-white/5"></div>
                                </div>
                                <button
                                    onClick={() => setStep(2)}
                                    className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                                >
                                    <Search className="w-5 h-5" /> Continue with Manual Search
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Type medicine name..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && searchMedicines()}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500 transition-all"
                                        />
                                    </div>
                                    <button
                                        onClick={searchMedicines}
                                        className="bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-4 rounded-2xl font-bold transition-all active:scale-95"
                                    >
                                        Search
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {loading ? (
                                        <div className="flex flex-col items-center py-20">
                                            <Loader className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                                            <p className="text-gray-400">Finding best stores for you...</p>
                                        </div>
                                    ) : foundStores.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-4">
                                            {foundStores.map(store => (
                                                <motion.div
                                                    key={store.id}
                                                    initial={{ opacity: 0, scale: 0.98 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition-all"
                                                >
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div>
                                                            <h4 className="text-xl font-bold text-white mb-1">{store.name}</h4>
                                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                                <Store className="w-3 h-3" /> {store.address}
                                                            </p>
                                                        </div>
                                                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-bold rounded-full border border-emerald-500/20">
                                                            {store.distance}km away
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {store.medicines.map(med => (
                                                            <div key={med.id} className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                                                                        <Pill className="w-5 h-5 text-indigo-400" />
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-white font-bold">{med.name}</span>
                                                                        <span className="text-xs text-gray-500">{med.brand} • In Stock: {med.quantity}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-6">
                                                                    <span className="text-xl font-bold text-white">₹{med.price}</span>
                                                                    <button
                                                                        onClick={() => handleSendRequest(
                                                                            store.id,
                                                                            [{ medicineId: med.id, medicineName: med.name, quantity: 1, price: med.price }],
                                                                            med.price
                                                                        )}
                                                                        className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"
                                                                    >
                                                                        Request
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : searchQuery && (
                                        <div className="text-center py-20 bg-white/[0.02] rounded-2xl border border-white/5">
                                            <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-50" />
                                            <p className="text-gray-400">No stores found with this medicine nearby.</p>
                                            <p className="text-gray-600 text-sm mt-2">Try searching for a different medicine or broaden your search area.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadPrescriptionPage;
