import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Pill, Plus, Clock, Calendar, Trash2, Edit2, AlertCircle,
    CheckCircle2, ChevronLeft, Bell, BellRing, Info, ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URLS } from "../api";
import { checkInteractions } from "../utils/interactionChecker";

const MedicineVault = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [interactionAlerts, setInteractionAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [itemForm, setItemForm] = useState({
        medicineName: "",
        dosage: "",
        frequency: "Daily",
        timings: [],
        notes: "",
        startDate: new Date().toISOString().split('T')[0]
    });

    const timingOptions = ["Morning", "Afternoon", "Evening", "Night"];

    useEffect(() => {
        fetchVaultItems();
    }, []);

    const fetchVaultItems = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URLS.VAULT}/my-vault`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setItems(data.items);
                setInteractionAlerts(checkInteractions(data.items));
            }
        } catch (error) {
            console.error("Error fetching vault:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const url = editingItem ? `${API_URLS.VAULT}/update/${editingItem._id}` : `${API_URLS.VAULT}/add`;
            const method = editingItem ? "PATCH" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(itemForm)
            });

            const data = await response.json();
            if (data.success) {
                fetchVaultItems();
                setShowAddModal(false);
                setEditingItem(null);
                setItemForm({
                    medicineName: "",
                    dosage: "",
                    frequency: "Daily",
                    timings: [],
                    notes: "",
                    startDate: new Date().toISOString().split('T')[0]
                });
            }
        } catch (error) {
            console.error("Error saving vault item:", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to remove this medication?")) return;
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URLS.VAULT}/delete/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) fetchVaultItems();
        } catch (error) {
            console.error("Error deleting vault item:", error);
        }
    };

    const toggleTiming = (timing) => {
        setItemForm(prev => ({
            ...prev,
            timings: prev.timings.includes(timing)
                ? prev.timings.filter(t => t !== timing)
                : [...prev.timings, timing]
        }));
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-['Outfit'] pb-20">
            {/* 🔮 Background Ambience */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
            </div>

            <nav className="sticky top-0 z-50 w-full bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                        <span className="font-medium">Back</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <Pill className="text-indigo-500 w-6 h-6" />
                        <span className="text-xl font-bold text-white">Medicine Vault</span>
                    </div>
                    <div className="w-10" /> {/* Spacer */}
                </div>
            </nav>

            <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">My Medications</h1>
                        <p className="text-gray-400 mt-1">Track your daily dosage and schedule reminders.</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-1"
                    >
                        <Plus className="w-5 h-5" /> Add New Medicine
                    </button>
                </div>

                {/* 🛡️ Interaction Alert Simulation */}
                {interactionAlerts.length > 0 ? (
                    <div className="space-y-3 mb-8">
                        {interactionAlerts.map((alert, idx) => (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={idx}
                                className={`border rounded-2xl p-4 flex gap-4 items-start ${alert.severity === 'Critical' ? 'bg-red-500/10 border-red-500/20' : 'bg-amber-500/10 border-amber-500/20'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg ${alert.severity === 'Critical' ? 'bg-red-500/20' : 'bg-amber-500/20'
                                    }`}>
                                    <ShieldAlert className={`w-5 h-5 ${alert.severity === 'Critical' ? 'text-red-500' : 'text-amber-500'
                                        }`} />
                                </div>
                                <div>
                                    <h3 className={`font-bold text-sm ${alert.severity === 'Critical' ? 'text-red-500' : 'text-amber-500'
                                        }`}>
                                        Interaction Warning: {alert.meds.join(" + ")} ({alert.severity})
                                    </h3>
                                    <p className="text-gray-400 text-xs mt-1">{alert.warning}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-8 flex gap-4 items-start">
                        <div className="bg-emerald-500/20 p-2 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <h3 className="text-emerald-500 font-bold text-sm">Safe to Proceed</h3>
                            <p className="text-gray-400 text-xs mt-1">No known drug interactions found among your currently active medications.</p>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-500 mt-4">Loading your vault...</p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-20 bg-[#121212] rounded-3xl border border-white/5 border-dashed">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Pill className="w-10 h-10 text-gray-600" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Your Vault is Empty</h2>
                        <p className="text-gray-500 max-w-xs mx-auto">Add the medicines you take daily to stay on top of your health.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {items.map(item => (
                            <motion.div
                                key={item._id}
                                layout
                                className="bg-[#121212] border border-white/5 rounded-2xl p-5 hover:border-indigo-500/30 transition-all group"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                                            <Pill className="w-6 h-6 text-indigo-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{item.medicineName}</h3>
                                            <p className="text-sm text-gray-400">{item.dosage} • {item.frequency}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingItem(item);
                                                setItemForm({
                                                    medicineName: item.medicineName,
                                                    dosage: item.dosage,
                                                    frequency: item.frequency,
                                                    timings: item.timings,
                                                    notes: item.notes || "",
                                                    startDate: item.startDate.split('T')[0]
                                                });
                                                setShowAddModal(true);
                                            }}
                                            className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-wrap gap-3">
                                    {timingOptions.map(t => (
                                        <div
                                            key={t}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 ${item.timings.includes(t)
                                                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                                                : "bg-white/5 text-gray-600 border border-transparent"
                                                }`}
                                        >
                                            <Clock className="w-3 h-3" />
                                            {t}
                                        </div>
                                    ))}
                                </div>

                                {item.notes && (
                                    <div className="mt-4 p-3 bg-white/5 rounded-xl text-xs text-gray-400 italic">
                                        {item.notes}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

            {/* Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-[#121212] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white">{editingItem ? "Edit Medication" : "Add Medication"}</h2>
                                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400">
                                    <Edit2 className="w-5 h-5 rotate-45" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Medicine Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={itemForm.medicineName}
                                        onChange={(e) => setItemForm({ ...itemForm, medicineName: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                        placeholder="e.g. Paracetamol"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Dosage</label>
                                        <input
                                            required
                                            type="text"
                                            value={itemForm.dosage}
                                            onChange={(e) => setItemForm({ ...itemForm, dosage: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                            placeholder="e.g. 500mg or 1 tab"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Frequency</label>
                                        <select
                                            value={itemForm.frequency}
                                            onChange={(e) => setItemForm({ ...itemForm, frequency: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                        >
                                            <option value="Daily">Daily</option>
                                            <option value="Twice Daily">Twice Daily</option>
                                            <option value="Weekly">Weekly</option>
                                            <option value="As Needed">As Needed</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Daily Timings</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {timingOptions.map(t => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => toggleTiming(t)}
                                                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${itemForm.timings.includes(t)
                                                    ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20"
                                                    : "bg-white/5 text-gray-400 border-white/5 hover:border-white/20"
                                                    }`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Notes (Optional)</label>
                                    <textarea
                                        value={itemForm.notes}
                                        onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none h-24"
                                        placeholder="e.g. Take after food"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold shadow-xl shadow-indigo-600/20 transition-all"
                                >
                                    {editingItem ? "Update Medication" : "Add medication to Vault"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MedicineVault;
