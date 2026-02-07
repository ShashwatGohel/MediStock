import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Package, Search, ArrowLeft, Loader, Building2, Tag,
    DollarSign, Calendar, Trash2, Plus, Upload, Eye, Pill
} from "lucide-react";
import { motion } from "framer-motion";
import AddMedicineModal from "../components/AddMedicineModal";
import BulkUploadModal from "../components/BulkUploadModal";
import MedicineDetailModal from "../components/MedicineDetailModal";
import { API_URLS } from "../api";

const InventoryPage = () => {
    const navigate = useNavigate();
    const [allMedicines, setAllMedicines] = useState([]);
    const [filteredMedicines, setFilteredMedicines] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);

    useEffect(() => {
        fetchAllMedicines();
    }, []);

    const fetchAllMedicines = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URLS.MEDICINES}/my-medicines`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setAllMedicines(data.medicines);
                setFilteredMedicines(data.medicines);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        setFilteredMedicines(
            query === "" ? allMedicines : allMedicines.filter(med =>
                med.name.toLowerCase().includes(query) ||
                (med.brand && med.brand.toLowerCase().includes(query)) ||
                (med.category && med.category.toLowerCase().includes(query))
            )
        );
    };

    const handleDeleteMedicine = async (id) => {
        if (!window.confirm("Are you sure you want to delete this medicine?")) return;
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URLS.MEDICINES}/delete/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                fetchAllMedicines();
            } else {
                alert(data.message || "Failed to delete medicine");
            }
        } catch (err) {
            console.error(err);
            alert("Error deleting medicine");
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-['Outfit']">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <button
                        onClick={() => navigate("/owner-dashboard")}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back to Dashboard</span>
                    </button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                <Package className="w-8 h-8 text-indigo-400" />
                                Inventory Management
                            </h1>
                            <p className="text-gray-400 mt-1">
                                {filteredMedicines.length} {filteredMedicines.length === 1 ? "medicine" : "medicines"} available
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsBulkModalOpen(true)}
                                className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-white/10 transition-all"
                            >
                                <Upload className="w-4 h-4 text-indigo-400" />
                                Bulk Upload
                            </button>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-4 py-2 bg-indigo-500 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-600 transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                Add Item
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearch}
                            placeholder="Search by medicine name, brand, or category..."
                            className="w-full bg-[#121212] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-gray-600"
                        />
                    </div>
                </div>

                {/* Medicines Grid */}
                {loading ? (
                    <div className="text-center py-20">
                        <Loader className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">Loading inventory...</p>
                    </div>
                ) : filteredMedicines.length === 0 ? (
                    <div className="text-center py-20">
                        <Package className="w-20 h-20 text-gray-600 mx-auto mb-4 opacity-50" />
                        <p className="text-gray-400 text-lg">
                            {searchQuery ? "No medicines found matching your search" : "No medicines in inventory"}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="mt-4 px-6 py-3 bg-indigo-500 text-white rounded-lg font-bold hover:bg-indigo-600 transition-all"
                            >
                                Add Your First Item
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredMedicines.map((medicine, index) => (
                            <motion.div
                                key={medicine._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="bg-[#121212] border border-white/5 rounded-xl p-5 hover:border-indigo-500/30 transition-all group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                                            {medicine.name}
                                        </h3>
                                        {medicine.brand && (
                                            <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                                                <Building2 className="w-3.5 h-3.5" />
                                                {medicine.brand}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`text-xs px-2 py-0.5 rounded border ${medicine.type === 'Instrument'
                                                ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                } flex items-center gap-1`}>
                                                {medicine.type === 'Instrument' ? <Package className="w-3 h-3" /> : <Pill className="w-3 h-3" />}
                                                {medicine.type || 'Medicine'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedMedicine(medicine);
                                                setIsDetailModalOpen(true);
                                            }}
                                            className="p-2 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white rounded-lg transition-all"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteMedicine(medicine._id)}
                                            className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm">
                                    {medicine.category && (
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Tag className="w-3.5 h-3.5" />
                                            <span>{medicine.category}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">Stock:</span>
                                        <span className={`font-bold ${medicine.quantity <= 10 ? 'text-red-400' : 'text-emerald-400'}`}>
                                            {medicine.quantity}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">Price:</span>
                                        <span className="font-bold text-white flex items-center gap-1">
                                            <DollarSign className="w-3.5 h-3.5" />
                                            ₹{medicine.price}
                                        </span>
                                    </div>
                                    {medicine.expiryDate && (
                                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                            <span className="text-gray-400 flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                Expires:
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(medicine.expiryDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            <AddMedicineModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchAllMedicines}
            />
            <BulkUploadModal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                onSuccess={fetchAllMedicines}
            />
            {selectedMedicine && (
                <MedicineDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => {
                        setIsDetailModalOpen(false);
                        setSelectedMedicine(null);
                    }}
                    medicine={selectedMedicine}
                />
            )}
        </div>
    );
};

export default InventoryPage;
