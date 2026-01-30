import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    LayoutDashboard, Package, TrendingUp, AlertTriangle, MapPin,
    Settings, LogOut, Moon, Sun, Search, Plus, FileText,
    Truck, DollarSign, Users, Eye, ShieldCheck, HelpCircle,
    ChevronRight, ArrowUpRight, ArrowDownRight, Bell, Store, Clock,
    Building2, Tag, Trash2, Navigation, MapPinOff, Loader, Map
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AddMedicineModal from "../components/AddMedicineModal";
import CreateBillModal from "../components/CreateBillModal";
import { getCurrentLocation, getAddressFromCoords } from "../utils/locationUtils";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { ownerIcon } from "../utils/MapMarkerIcons";

const RecenterMap = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.setView([position.lat, position.lng], map.getZoom());
        }
    }, [position, map]);
    return null;
};

const OwnerDashboard = () => {
    const navigate = useNavigate();
    const [storeStatus, setStoreStatus] = useState(true);
    const [storeData, setStoreData] = useState(null);
    const [detectedLocation, setDetectedLocation] = useState(null);
    const [detectionError, setDetectionError] = useState("");
    const [locationLoading, setLocationLoading] = useState(false);
    const [ownerName, setOwnerName] = useState("Partner");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBillModalOpen, setIsBillModalOpen] = useState(false);
    const [stockAlerts, setStockAlerts] = useState([]);
    const [allMedicines, setAllMedicines] = useState([]);
    const [filteredMedicines, setFilteredMedicines] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [medicinesLoading, setMedicinesLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [error, setError] = useState("");
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    const fetchLowStockMedicines = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("https://medistock-3a3y.onrender.com/api/medicines/low-stock?threshold=10", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                const alerts = data.medicines.map(med => ({
                    id: med._id,
                    name: med.name,
                    status: med.quantity === 0 ? "Out of Stock" : `Low Stock (${med.quantity} left)`,
                    type: med.quantity <= 5 ? "critical" : "warning"
                }));
                setStockAlerts(alerts);
            }
        } catch (err) { console.error(err); }
    };

    const fetchAllMedicines = async () => {
        try {
            setMedicinesLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch("https://medistock-3a3y.onrender.com/api/medicines/my-medicines", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setAllMedicines(data.medicines);
                setFilteredMedicines(data.medicines);
            }
        } catch (err) { console.error(err); } finally { setMedicinesLoading(false); }
    };

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        setFilteredMedicines(query === "" ? allMedicines : allMedicines.filter(med =>
            med.name.toLowerCase().includes(query) || (med.brand && med.brand.toLowerCase().includes(query))
        ));
    };

    const fetchDailyStats = async () => {
        try {
            setStatsLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch("https://medistock-3a3y.onrender.com/api/bills/daily-stats", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                const { totalSales, salesChange, ordersToday, ordersChange, lowStockCount, profileVisits, visitsChange } = data.stats;
                setStats([
                    { title: "Total Sales", value: `₹${totalSales.toLocaleString()}`, change: `${salesChange >= 0 ? '+' : ''}${salesChange}%`, isPositive: salesChange >= 0, icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                    { title: "Orders Today", value: ordersToday.toString(), change: `${ordersChange >= 0 ? '+' : ''}${ordersChange}%`, isPositive: ordersChange >= 0, icon: Package, color: "text-blue-400", bg: "bg-blue-500/10" },
                    { title: "Low Stock", value: `${lowStockCount} Items`, change: lowStockCount > 0 ? "Urgent" : "Good", isPositive: lowStockCount === 0, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
                    { title: "Profile Visits", value: profileVisits.toLocaleString(), change: `${visitsChange >= 0 ? '+' : ''}${visitsChange}%`, isPositive: visitsChange >= 0, icon: Eye, color: "text-purple-400", bg: "bg-purple-500/10" },
                ]);
            }
        } catch (err) { console.error(err); } finally { setStatsLoading(false); }
    };

    const fetchStoreProfile = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user?._id) return;
            const token = localStorage.getItem("token");
            const response = await fetch(`https://medistock-3a3y.onrender.com/api/stores/${user._id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) setStoreData(data.store);
        } catch (err) { console.error(err); }
    };

    const handleUpdateLocation = async () => {
        try {
            setLocationLoading(true);
            const pos = await getCurrentLocation();
            const addr = await getAddressFromCoords(pos.latitude, pos.longitude);
            const token = localStorage.getItem("token");
            const response = await fetch("https://medistock-3a3y.onrender.com/api/stores/location", {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ latitude: pos.latitude, longitude: pos.longitude, address: addr })
            });
            if (response.ok) fetchStoreProfile();
        } catch (err) { alert(err.message); } finally { setLocationLoading(false); }
    };

    const fetchStoreOrders = async () => {
        try {
            setOrdersLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch("https://medistock-3a3y.onrender.com/api/orders/store-orders", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) setOrders(data.orders);
        } catch (err) { console.error(err); } finally { setOrdersLoading(false); }
    };

    const handleUpdateOrderStatus = async (orderId, status) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`https://medistock-3a3y.onrender.com/api/orders/${orderId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ status })
            });
            if (response.ok) {
                fetchStoreOrders();
                fetchAllMedicines();
                fetchLowStockMedicines();
            }
        } catch (err) { alert("Failed to update status"); }
    };

    const handleDeleteMedicine = async (id) => {
        if (!window.confirm("Are you sure you want to delete this medicine?")) return;
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`https://medistock-3a3y.onrender.com/api/medicines/delete/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                fetchAllMedicines();
                fetchLowStockMedicines();
                fetchDailyStats();
            } else {
                alert(data.message || "Failed to delete medicine");
            }
        } catch (err) {
            console.error(err);
            alert("Error deleting medicine");
        }
    };

    const handleLogout = () => { localStorage.clear(); navigate("/login"); };

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (user) setOwnerName(JSON.parse(user).name);
        fetchLowStockMedicines();
        fetchAllMedicines();
        fetchDailyStats();
        fetchStoreProfile();
        fetchStoreOrders();
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-['Outfit'] relative pb-20">
            <nav className="sticky top-0 z-50 w-full bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center"><Store className="text-white w-5 h-5" /></div>
                        <span className="text-xl font-bold text-white">Medi<span className="text-indigo-500">Stock</span> Partner</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 cursor-pointer" onClick={() => setStoreStatus(!storeStatus)}>
                            <div className={`w-2.5 h-2.5 rounded-full ${storeStatus ? "bg-green-500" : "bg-red-500"}`}></div>
                            <span className={`text-sm font-semibold ${storeStatus ? "text-green-400" : "text-red-400"}`}>{storeStatus ? "Open" : "Closed"}</span>
                        </div>
                        <button onClick={handleLogout} className="text-gray-400 hover:text-white"><LogOut className="w-5 h-5" /></button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-white">Welcome, {ownerName.split(" ")[0]}</h1>
                        <p className="text-gray-400">Manage your pharmacy inventory and requests.</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setIsBillModalOpen(true)} className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold flex items-center gap-2"><FileText className="w-4 h-4" /> Bill</button>
                        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-indigo-500 text-white rounded-lg font-bold flex items-center gap-2"><Plus className="w-4 h-4" /> Medicine</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-[#121212] border border-white/5 p-5 rounded-2xl">
                            <div className="flex justify-between mb-4">
                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}><stat.icon className="w-6 h-6" /></div>
                                <span className={`text-xs font-bold ${stat.isPositive ? "text-green-400" : "text-red-400"}`}>{stat.change}</span>
                            </div>
                            <h3 className="text-gray-400 text-sm">{stat.title}</h3>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-[#121212] border border-white/5 rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Pending Requests</h2>
                            <div className="space-y-4">
                                {ordersLoading ? <Loader className="w-8 h-8 animate-spin mx-auto text-indigo-500" /> :
                                    orders.length === 0 ? <p className="text-gray-500 text-center py-4">No active requests.</p> :
                                        orders.map(order => (
                                            <div key={order._id} className="bg-white/5 border border-white/10 p-4 rounded-xl">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div><h4 className="font-bold text-white">{order.userId?.name}</h4><p className="text-xs text-gray-400">{order.userId?.phone}</p></div>
                                                    <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${order.status === 'pending' ? 'text-yellow-500 bg-yellow-500/10' : 'text-emerald-500 bg-emerald-500/10'}`}>{order.status}</span>
                                                </div>
                                                <div className="space-y-1 mb-4">
                                                    {order.items.map((it, idx) => <div key={idx} className="flex justify-between text-sm text-gray-300"><span>{it.medicineName} x {it.quantity}</span><span>₹{it.price * it.quantity}</span></div>)}
                                                </div>
                                                <div className="flex gap-2">
                                                    {order.status === 'pending' && <button onClick={() => handleUpdateOrderStatus(order._id, 'approved')} className="flex-1 bg-emerald-500 text-black py-2 rounded-lg font-bold text-sm">Approve</button>}
                                                    {order.status === 'approved' && <button onClick={() => handleUpdateOrderStatus(order._id, 'confirmed')} className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-bold text-sm">Confirm</button>}
                                                    <button onClick={() => handleUpdateOrderStatus(order._id, 'cancelled')} className="px-4 bg-white/5 border border-white/10 text-red-500 py-2 rounded-lg font-bold text-sm">Cancel</button>
                                                </div>
                                            </div>
                                        ))}
                            </div>
                        </div>

                        <div className="bg-[#121212] border border-white/5 rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Inventory</h2>
                            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                                {medicinesLoading ? <Loader className="w-8 h-8 animate-spin mx-auto" /> :
                                    filteredMedicines.map(med => (
                                        <div key={med._id} className="p-3 bg-white/5 rounded-lg border border-white/5 flex justify-between items-center group">
                                            <div>
                                                <h4 className="text-sm font-semibold text-white">{med.name}</h4>
                                                <p className="text-xs text-gray-400">{med.brand} • {med.category}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="font-bold text-white">{med.quantity} <span className="text-gray-500 text-xs">units</span></p>
                                                    <p className="text-xs text-gray-400">₹{med.price}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteMedicine(med._id)}
                                                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                    title="Delete Medicine"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-[#121212] border border-white/5 rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Stock Alerts</h2>
                            <div className="space-y-3">
                                {stockAlerts.length === 0 ? <p className="text-sm text-gray-500">All good!</p> :
                                    stockAlerts.map(alert => (
                                        <div key={alert.id} className="p-3 bg-white/5 rounded-lg flex items-center gap-3">
                                            <AlertTriangle className={`w-5 h-5 ${alert.type === 'critical' ? 'text-red-500' : 'text-orange-400'}`} />
                                            <div><h4 className="text-sm font-semibold text-white">{alert.name}</h4><p className="text-xs text-gray-400">{alert.status}</p></div>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Store Location</h2>
                            <div className="bg-white/5 rounded-xl p-4 mb-4 text-sm">
                                <p className="text-gray-400 mb-1">Current Address</p>
                                <p className="text-white line-clamp-2">{storeData?.address || "Address not set"}</p>
                            </div>
                            <button onClick={handleUpdateLocation} disabled={locationLoading} className="w-full py-3 bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                                {locationLoading ? <Loader className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />} {locationLoading ? "Updating..." : "Update Location"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <AddMedicineModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => { fetchAllMedicines(); fetchLowStockMedicines(); }} />
            <CreateBillModal isOpen={isBillModalOpen} onClose={() => setIsBillModalOpen(false)} onSuccess={() => { fetchAllMedicines(); fetchLowStockMedicines(); fetchDailyStats(); }} />
        </div>
    );
};

export default OwnerDashboard;
