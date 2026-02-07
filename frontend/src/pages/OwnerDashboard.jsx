import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    LayoutDashboard, Package, TrendingUp, AlertTriangle, MapPin,
    Settings, LogOut, Moon, Sun, Search, Plus, FileText,
    Truck, DollarSign, Users, Eye, ShieldCheck, HelpCircle,
    ChevronRight, ArrowUpRight, ArrowDownRight, Bell, Store, Clock,
    Building2, Tag, Trash2, Navigation, MapPinOff, Loader, Map, Table,
    Zap, Command, Keyboard, CreditCard, Wallet, ShoppingCart, Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import AddMedicineModal from "../components/AddMedicineModal";
import BulkUploadModal from "../components/BulkUploadModal";
import CreateBillModal from "../components/CreateBillModal";
import MedicineDetailModal from "../components/MedicineDetailModal";
import BillsModal from "../components/BillsModal";
import OrdersModal from "../components/OrdersModal";
import LowStockModal from "../components/LowStockModal";
import VisitsModal from "../components/VisitsModal";
import { getCurrentLocation, getAddressFromCoords } from "../utils/locationUtils";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { ownerIcon } from "../utils/MapMarkerIcons";
import { API_URLS } from "../api";
import { io } from "socket.io-client";

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
    const [currentAddress, setCurrentAddress] = useState("");
    const [locationAccuracy, setLocationAccuracy] = useState(null);
    const [ownerName, setOwnerName] = useState("Partner");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [isBillModalOpen, setIsBillModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [isBillsModalOpen, setIsBillsModalOpen] = useState(false);
    const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
    const [isLowStockModalOpen, setIsLowStockModalOpen] = useState(false);
    const [isVisitsModalOpen, setIsVisitsModalOpen] = useState(false);
    const [lowStockMedicines, setLowStockMedicines] = useState([]);
    const [stockAlerts, setStockAlerts] = useState([]);
    const [expiryAlerts, setExpiryAlerts] = useState([]);
    const [reorderSuggestions, setReorderSuggestions] = useState([]);
    const [allMedicines, setAllMedicines] = useState([]);
    const [filteredMedicines, setFilteredMedicines] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [medicinesLoading, setMedicinesLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [orderSearchQuery, setOrderSearchQuery] = useState("");
    const [error, setError] = useState("");
    const [orders, setOrders] = useState([]);

    // Quick Actions & Notifications
    const [quickSearchOpen, setQuickSearchOpen] = useState(false);
    const [quickSearchQuery, setQuickSearchQuery] = useState("");
    const [newOrdersCount, setNewOrdersCount] = useState(0);

    // Today's Sales Summary
    const [todaysSales, setTodaysSales] = useState({
        totalSales: 0,
        transactionCount: 0,
        averageOrderValue: 0,
        medicinesSold: 0,
        cashPayments: 0,
        digitalPayments: 0
    });

    const fetchLowStockMedicines = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URLS.MEDICINES}/low-stock?threshold=10`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setLowStockMedicines(data.medicines);
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

    const fetchExpiringMedicines = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URLS.MEDICINES}/expiring-medicines?days=60`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                const alerts = data.medicines.map(med => ({
                    id: med._id,
                    name: med.name,
                    expiryDate: med.expiryDate,
                    status: `Expires in ${Math.ceil((new Date(med.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))} days`,
                    type: "warning"
                }));
                setExpiryAlerts(alerts);
            }
        } catch (err) { console.error(err); }
    };

    const fetchReorderSuggestions = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URLS.MEDICINES}/reorder-suggestions`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) setReorderSuggestions(data.suggestions);
        } catch (err) { console.error(err); }
    };

    const fetchAllMedicines = async () => {
        try {
            setMedicinesLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URLS.MEDICINES}/my-medicines`, {
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
            const response = await fetch(`${API_URLS.BILLS}/daily-stats`, {
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
            const response = await fetch(`${API_URLS.STORES}/profile`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setStoreData(data.store);
                setStoreStatus(data.store.isStoreOpen);
            }
        } catch (err) { console.error(err); }
    };

    const handleToggleStoreStatus = async () => {
        try {
            const newStatus = !storeStatus;
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URLS.STORES}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ isStoreOpen: newStatus })
            });
            const data = await response.json();
            if (data.success) {
                setStoreStatus(newStatus);
                fetchStoreProfile();
            }
        } catch (err) { console.error(err); }
    };

    const handleUpdateOperatingHours = async (hours) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URLS.STORES}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ operatingHours: hours })
            });
            const data = await response.json();
            if (data.success) fetchStoreProfile();
        } catch (err) { console.error(err); }
    };

    const handleUpdateLocation = async () => {
        try {
            setLocationLoading(true);

            // Get current location using IP tracking
            const pos = await getCurrentLocation();
            const addr = pos.address || await getAddressFromCoords(pos.latitude, pos.longitude);

            // Save address and accuracy to state for immediate display
            setCurrentAddress(addr);
            setLocationAccuracy(pos.accuracy);

            // Update location on backend
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URLS.STORES}/location`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ latitude: pos.latitude, longitude: pos.longitude, address: addr })
            });

            if (response.ok) {
                fetchStoreProfile();
                toast.success("📍 Location updated successfully!");
            } else {
                const data = await response.json();
                toast.error(data.message || "Failed to update location");
            }
        } catch (err) {
            console.error("Location error:", err);

            // Show user-friendly error message
            let errorMessage = "Unable to get your location";
            if (err.message.includes("permission")) {
                errorMessage = "Location permission denied. Please enable location access in your browser settings.";
            } else if (err.message.includes("unavailable")) {
                errorMessage = "Location unavailable. Please check your GPS signal.";
            } else if (err.message.includes("timeout")) {
                errorMessage = "Location request timed out. Please try again.";
            }

            toast.error(errorMessage);
        } finally {
            setLocationLoading(false);
        }
    };

    const fetchStoreOrders = async () => {
        try {
            setOrdersLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URLS.ORDERS}/store-orders`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) setOrders(data.orders);
        } catch (err) { console.error(err); } finally { setOrdersLoading(false); }
    };

    const handleUpdateOrderStatus = async (orderId, status) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URLS.ORDERS}/${orderId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ status })
            });
            if (response.ok) {
                fetchStoreOrders();
                fetchAllMedicines();
                fetchLowStockMedicines();
                fetchDailyStats();
            } else {
                const data = await response.json();
                alert(data.message || "Failed to update status");
            }
        } catch (err) {
            console.error(err);
            alert("Network error. Failed to update status.");
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm("Delete this transaction record?")) return;
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URLS.ORDERS}/${orderId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                fetchStoreOrders();
                fetchDailyStats();
            } else {
                const data = await response.json();
                alert(data.message || "Failed to delete order");
            }
        } catch (err) {
            console.error(err);
            alert("Error deleting order");
        }
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

    // Calculate Today's Sales
    const calculateTodaysSales = () => {
        const today = new Date().toISOString().split('T')[0];
        const todaysOrders = orders.filter(o =>
            o.status === 'confirmed' &&
            new Date(o.createdAt).toISOString().split('T')[0] === today
        );

        const totalSales = todaysOrders.reduce((sum, o) =>
            sum + o.items.reduce((s, i) => s + (i.price * i.quantity), 0), 0
        );

        const medicinesSold = todaysOrders.reduce((sum, o) =>
            sum + o.items.reduce((s, i) => s + i.quantity, 0), 0
        );

        setTodaysSales({
            totalSales,
            transactionCount: todaysOrders.length,
            averageOrderValue: todaysOrders.length > 0 ? totalSales / todaysOrders.length : 0,
            medicinesSold,
            cashPayments: todaysOrders.filter(o => o.paymentMethod === 'cash').length,
            digitalPayments: todaysOrders.filter(o => o.paymentMethod === 'digital').length
        });
    };

    // Play notification sound
    const playNotificationSound = () => {
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUKXh8LRkHQU2kdXzyn0tBSp+zPLaizsKGGS46+mnVhMJRp/g8r5sIAUsgs/y2Ik2Bxpqvu/mnE4MDlCl4fC0ZB0FNpHV88p9LQUqfszy2os7ChhluevrqFYTCUaf4PK+bCAFLILP8tiJNgcaa77v5pxODA5QpeHwtGQdBTaR1fPKfS0FKn7M8tqLOwoYZbnr66hWEwlGn+DyvmwgBSyCz/LYiTYHGmq+7+acTgwOUKXh8LRkHQU2kdXzyn0tBSp+zPLaizsKGGW56+uoVhMJRp/g8r5sIAUsgs/y2Ik2Bxpqvu/mnE4MDlCl4fC0ZB0FNpHV88p9LQUqfszy2os7ChhluevrqFYTCUaf4PK+bCAFLILP8tiJNgcaa77v5pxODA5QpeHwtGQdBTaR1fPKfS0FKn7M8tqLOwoYZbnr66hWEwlGn+DyvmwgBSyCz/LYiTYHGmq+7+acTgwOUKXh8LRkHQU2kdXzyn0tBSp+zPLaizsKGGW56+uoVhMJRp/g8r5sIAUsgs/y2Ik2Bxpqvu/mnE4MDlCl4fC0ZB0FNpHV88p9LQUqfszy2os7ChhluevrqFYTCUaf4PK+bCAFLILP8tiJNgcaa77v5pxODA5QpeHwtGQdBTaR1fPKfS0FKn7M8tqLOwoYZbnr66hWEwlGn+DyvmwgBSyCz/LYiTYHGmq+7+acTgwOUKXh8LRkHQU2kdXzyn0tBSp+zPLaizsKGGW56+uoVhMJRp/g8r5sIAUsgs/y2Ik2Bxpqvu/mnE4MDlCl4fC0ZB0FNpHV88p9LQUqfszy2os7ChhluevrqFYTCUaf4PK+bCAFLILP8tiJNgcaa77v5pxODA5QpeHwtGQdBTaR1fPKfS0FKn7M8tqLOwoYZbnr66hWEwlGn+DyvmwgBSyCz/LYiTYHGmq+7+acTgwOUKXh8LRkHQU2kdXzyn0tBSp+zPLaizsKGGW56+uoVhMJRp/g8r5sIAUsgs/y2Ik2Bxpqvu/mnE4MDlCl4fC0ZB0FNpHV88p9LQUqfszy2os7ChhluevrqFYTCUaf4PK+bCAFLILP8tiJNgcaa77v5pxODA5QpeHwtGQdBTaR1fPKfS0FKn7M8tqLOwoYZbnr66hWEwlGn+DyvmwgBSyCz/LYiTYHGmq+7+acTgwOUKXh8LRkHQU2kdXzyn0tBSp+zPLaizsKGGW56+uoVhMJRp/g8r5sIAUsgs/y2Ik2Bxpqvu/mnE4MDlCl4fC0ZB0FNpHV88p9LQUqfszy');
            audio.volume = 0.3;
            audio.play().catch(err => console.log('Audio play failed:', err));
        } catch (err) {
            console.log('Notification sound error:', err);
        }
    };

    const handleLogout = () => { localStorage.clear(); navigate("/login"); };

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (user) setOwnerName(JSON.parse(user).name);
        fetchLowStockMedicines();
        fetchExpiringMedicines();
        fetchReorderSuggestions();
        fetchAllMedicines();
        fetchDailyStats();
        fetchStoreProfile();
        fetchStoreOrders();
        handleUpdateLocation(); // Auto-fetch live location on page load
    }, []);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'b') { e.preventDefault(); setIsBillModalOpen(true); }
                if (e.key === 'm') { e.preventDefault(); setIsModalOpen(true); }
                if (e.key === 'i') { e.preventDefault(); navigate('/inventory'); }
                if (e.key === 'f') { e.preventDefault(); setQuickSearchOpen(true); }
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [navigate]);

    // Calculate Today's Sales when orders change
    useEffect(() => {
        if (orders.length > 0) {
            calculateTodaysSales();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orders]);

    // Socket.io for real-time notifications - Temporarily disabled
    // useEffect(() => {
    //     try {
    //         const socket = io(API_URLS.BASE.replace('/api', ''), {
    //             transports: ['websocket', 'polling'],
    //             reconnection: true,
    //             reconnectionAttempts: 5,
    //             reconnectionDelay: 1000,
    //         });

    //         const user = JSON.parse(localStorage.getItem("user"));

    //         if (user?._id) {
    //             socket.on('connect', () => {
    //                 console.log('Socket connected');
    //                 socket.emit('join-store', user._id);
    //             });

    //             socket.on('new-order', (order) => {
    //                 playNotificationSound();
    //                 toast.success(`🔔 New order from ${order.userId?.name || 'Customer'}!`, {
    //                     duration: 5000,
    //                     style: {
    //                         background: '#1a1a1a',
    //                         color: '#fff',
    //                         border: '1px solid rgba(99, 102, 241, 0.3)',
    //                     },
    //                 });
    //                 setNewOrdersCount(prev => prev + 1);
    //                 fetchStoreOrders();
    //             });

    //             socket.on('connect_error', (error) => {
    //                 console.log('Socket connection error:', error);
    //             });
    //         }

    //         return () => {
    //             socket.disconnect();
    //         };
    //     } catch (error) {
    //         console.error('Socket initialization error:', error);
    //     }
    // }, []);

    // Request browser notification permission
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
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
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 cursor-pointer" onClick={handleToggleStoreStatus}>
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
                        <button onClick={() => navigate("/inventory")} className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-lg font-bold flex items-center gap-2 transition-all">
                            <Package className="w-4 h-4" /> Inventory
                        </button>
                        <button onClick={() => setIsBillModalOpen(true)} className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold flex items-center gap-2"><FileText className="w-4 h-4" /> Bill</button>
                        <button onClick={() => setIsBulkModalOpen(true)} className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-white/10 transition-all"><Table className="w-4 h-4 text-indigo-400" /> Bulk</button>
                        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-indigo-500 text-white rounded-lg font-bold flex items-center gap-2"><Plus className="w-4 h-4" /> Medicine</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, i) => {
                        const handleClick = () => {
                            if (stat.title === "Total Sales") setIsBillsModalOpen(true);
                            else if (stat.title === "Orders Today") setIsOrdersModalOpen(true);
                            else if (stat.title === "Low Stock") setIsLowStockModalOpen(true);
                            else if (stat.title === "Profile Visits") setIsVisitsModalOpen(true);
                        };

                        return (
                            <div
                                key={i}
                                onClick={handleClick}
                                className="bg-[#121212] border border-white/5 p-5 rounded-2xl cursor-pointer hover:bg-white/5 hover:border-indigo-500/30 transition-all"
                            >
                                <div className="flex justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}><stat.icon className="w-6 h-6" /></div>
                                    <span className={`text-xs font-bold ${stat.isPositive ? "text-green-400" : "text-red-400"}`}>{stat.change}</span>
                                </div>
                                <h3 className="text-gray-400 text-sm">{stat.title}</h3>
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                            </div>
                        );
                    })}
                </div>


                {/* Operating Hours Editor */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#121212] border border-white/10 rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-indigo-400" />
                            <h3 className="text-lg font-bold text-white">Operating Hours</h3>
                        </div>
                        <span className="text-sm text-gray-400">Visible to all users</span>
                    </div>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            defaultValue={storeData?.operatingHours || "9:00 AM - 9:00 PM"}
                            key={storeData?.operatingHours}
                            onBlur={(e) => {
                                if (e.target.value !== storeData?.operatingHours) {
                                    handleUpdateOperatingHours(e.target.value);
                                }
                            }}
                            placeholder="e.g., 9:00 AM - 9:00 PM"
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Users will see these hours when viewing your store</p>
                </motion.div>

                {/* Today's Sales Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-indigo-400" />
                            <h3 className="text-lg font-bold text-white">Today's Performance</h3>
                        </div>
                        <span className="text-xs text-gray-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {/* Total Sales */}
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="w-4 h-4 text-emerald-400" />
                                <span className="text-xs text-gray-400">Total Sales</span>
                            </div>
                            <p className="text-2xl font-bold text-white">₹{todaysSales.totalSales.toLocaleString()}</p>
                        </div>

                        {/* Transactions */}
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <div className="flex items-center gap-2 mb-2">
                                <ShoppingCart className="w-4 h-4 text-blue-400" />
                                <span className="text-xs text-gray-400">Transactions</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{todaysSales.transactionCount}</p>
                        </div>

                        {/* Average Order */}
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-purple-400" />
                                <span className="text-xs text-gray-400">Avg Order</span>
                            </div>
                            <p className="text-2xl font-bold text-white">₹{Math.round(todaysSales.averageOrderValue)}</p>
                        </div>

                        {/* Medicines Sold */}
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <div className="flex items-center gap-2 mb-2">
                                <Package className="w-4 h-4 text-orange-400" />
                                <span className="text-xs text-gray-400">Items Sold</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{todaysSales.medicinesSold}</p>
                        </div>

                        {/* Cash Payments */}
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <div className="flex items-center gap-2 mb-2">
                                <Wallet className="w-4 h-4 text-green-400" />
                                <span className="text-xs text-gray-400">Cash</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{todaysSales.cashPayments}</p>
                        </div>

                        {/* Digital Payments */}
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <div className="flex items-center gap-2 mb-2">
                                <CreditCard className="w-4 h-4 text-cyan-400" />
                                <span className="text-xs text-gray-400">Digital</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{todaysSales.digitalPayments}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Pending Requests */}
                <div className="bg-[#121212] border border-white/5 rounded-2xl p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-white">Pending Requests</h2>
                            {newOrdersCount > 0 && (
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                                    {newOrdersCount} New
                                </span>
                            )}
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search by customer name..."
                                value={orderSearchQuery}
                                onChange={(e) => setOrderSearchQuery(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-lg py-1.5 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 w-full sm:w-64"
                            />
                        </div>
                    </div>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {ordersLoading ? <Loader className="w-8 h-8 animate-spin mx-auto text-indigo-500" /> :
                            orders.filter(o => o.userId?.name?.toLowerCase().includes(orderSearchQuery.toLowerCase())).length === 0 ? <p className="text-gray-500 text-center py-4">No matching requests.</p> :
                                orders.filter(o => o.userId?.name?.toLowerCase().includes(orderSearchQuery.toLowerCase())).map(order => (
                                    <div key={order._id} className="bg-white/5 border border-white/10 p-4 rounded-xl">
                                        <div className="flex justify-between items-start mb-3">
                                            <div><h4 className="font-bold text-white">{order.userId?.name}</h4><p className="text-xs text-gray-400">{order.userId?.phone}</p></div>
                                            <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${order.status === 'pending' ? 'text-yellow-500 bg-yellow-500/10' :
                                                order.status === 'confirmed' ? 'text-emerald-500 bg-emerald-500/10' :
                                                    order.status === 'approved' ? 'text-blue-500 bg-blue-500/10' :
                                                        'text-red-500 bg-red-500/10'
                                                }`}>
                                                {order.status === 'confirmed' ? 'Approved' : order.status}
                                            </span>
                                        </div>
                                        <div className="space-y-1 mb-4">
                                            {order.items.map((it, idx) => <div key={idx} className="flex justify-between text-sm text-gray-300"><span>{it.medicineName} x {it.quantity}</span><span>₹{it.price * it.quantity}</span></div>)}
                                        </div>
                                        <div className="flex gap-2">
                                            {order.status === 'pending' && <button onClick={() => handleUpdateOrderStatus(order._id, 'approved')} className="flex-1 bg-emerald-500 text-black py-2 rounded-lg font-bold text-sm">Approve</button>}
                                            {order.status === 'approved' && <button onClick={() => handleUpdateOrderStatus(order._id, 'confirmed')} className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-bold text-sm">Confirm</button>}
                                            {(order.status === 'pending' || order.status === 'approved') && <button onClick={() => handleUpdateOrderStatus(order._id, 'cancelled')} className="px-4 bg-white/5 border border-white/10 text-red-500 py-2 rounded-lg font-bold text-sm">Cancel</button>}
                                            {(order.status === 'confirmed' || order.status === 'cancelled') && <button onClick={() => handleDeleteOrder(order._id)} className="flex-1 bg-white/5 border border-white/10 text-gray-500 hover:text-red-500 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2"><Trash2 className="w-4 h-4" /> Delete</button>}
                                        </div>
                                    </div>
                                ))}
                    </div>
                </div>

                {/* Alerts Grid - 3 Columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stock Alerts */}
                    <div className="bg-[#121212] border border-white/5 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                            Stock Alerts
                        </h2>
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

                    {/* Expiry Alerts */}
                    <div className="bg-[#121212] border border-white/5 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4 text-orange-400 flex items-center gap-2">
                            <Clock className="w-5 h-5" /> Expiry Alerts
                        </h2>
                        <div className="space-y-3">
                            {expiryAlerts.length === 0 ? <p className="text-sm text-gray-500">No upcoming expirations.</p> :
                                expiryAlerts.map(alert => (
                                    <div key={alert.id} className="p-3 bg-white/5 rounded-lg flex items-center gap-3 border border-orange-500/10">
                                        <div className="p-2 bg-orange-500/10 rounded-lg"><Clock className="w-4 h-4 text-orange-400" /></div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-white">{alert.name}</h4>
                                            <p className="text-[10px] text-gray-500">{alert.status}</p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Smart Reordering */}
                    <div className="bg-[#121212] border border-white/5 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4 text-indigo-400 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" /> Smart Reordering
                        </h2>
                        <div className="space-y-3">
                            {reorderSuggestions.filter(s => s.priority !== "Low").length === 0 ? <p className="text-sm text-gray-500">Inventory levels are optimal.</p> :
                                reorderSuggestions.filter(s => s.priority !== "Low").slice(0, 5).map(suggestion => (
                                    <div key={suggestion.id} className="p-3 bg-white/5 rounded-lg border border-white/5 hover:border-indigo-500/30 transition-all">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="text-sm font-semibold text-white">{suggestion.name}</h4>
                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${suggestion.priority === 'High' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                                {suggestion.priority}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-gray-500">
                                            <span>Stock: {suggestion.quantity} units</span>
                                            <span>~{suggestion.daysOfStockLeft} days left</span>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>

                {/* Store Location - Full Width */}
                <div className="bg-[#121212] border border-white/5 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-emerald-400" />
                        Store Location
                    </h2>
                    <div className="bg-white/5 rounded-xl p-4 mb-4 text-sm">
                        <div className="flex justify-between items-start mb-1">
                            <p className="text-gray-400">Current Address</p>
                            {locationAccuracy && (
                                <span className="text-[10px] px-2 py-0.5 rounded font-bold flex items-center gap-1 bg-indigo-500/10 text-indigo-400">
                                    <Activity className="w-3 h-3" />
                                    IP-Based (City level)
                                </span>
                            )}
                        </div>
                        <p className="text-white line-clamp-2">{currentAddress || storeData?.address || "Address not set"}</p>
                    </div>
                    <button onClick={handleUpdateLocation} disabled={locationLoading} className="w-full py-3 bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                        {locationLoading ? <Loader className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />} {locationLoading ? "Updating..." : "Update Location"}
                    </button>
                </div>
            </div>

            <AddMedicineModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => { fetchAllMedicines(); fetchLowStockMedicines(); fetchDailyStats(); }} />
            <BulkUploadModal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} onSuccess={() => { fetchAllMedicines(); fetchLowStockMedicines(); fetchDailyStats(); }} />
            <CreateBillModal isOpen={isBillModalOpen} onClose={() => setIsBillModalOpen(false)} onSuccess={() => { fetchAllMedicines(); fetchLowStockMedicines(); fetchDailyStats(); }} />
            <MedicineDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                medicine={selectedMedicine}
                onSuccess={() => {
                    setIsDetailModalOpen(false);
                    fetchAllMedicines();
                    fetchLowStockMedicines();
                    fetchDailyStats();
                }}
            />
            <BillsModal isOpen={isBillsModalOpen} onClose={() => setIsBillsModalOpen(false)} />
            <OrdersModal isOpen={isOrdersModalOpen} onClose={() => setIsOrdersModalOpen(false)} />
            <LowStockModal isOpen={isLowStockModalOpen} onClose={() => setIsLowStockModalOpen(false)} lowStockMedicines={lowStockMedicines} />
            <VisitsModal isOpen={isVisitsModalOpen} onClose={() => setIsVisitsModalOpen(false)} />

            {/* Quick Search Modal */}
            <AnimatePresence>
                {quickSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-start justify-center pt-20"
                        onClick={() => setQuickSearchOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: -20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: -20 }}
                            className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-2xl mx-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-white">Quick Medicine Search</h3>
                                <button onClick={() => setQuickSearchOpen(false)} className="text-gray-400 hover:text-white">
                                    ✕
                                </button>
                            </div>

                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search medicines by name..."
                                    value={quickSearchQuery}
                                    onChange={(e) => setQuickSearchQuery(e.target.value)}
                                    autoFocus
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div className="max-h-96 overflow-y-auto space-y-2">
                                {allMedicines
                                    .filter(med => med.name.toLowerCase().includes(quickSearchQuery.toLowerCase()))
                                    .slice(0, 10)
                                    .map(medicine => (
                                        <div
                                            key={medicine._id}
                                            onClick={() => {
                                                setSelectedMedicine(medicine);
                                                setIsDetailModalOpen(true);
                                                setQuickSearchOpen(false);
                                                setQuickSearchQuery("");
                                            }}
                                            className="p-4 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer transition-all border border-white/5 hover:border-indigo-500/30"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-semibold text-white">{medicine.name}</h4>
                                                    <p className="text-sm text-gray-400">{medicine.category}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-emerald-400">₹{medicine.price}</p>
                                                    <p className="text-xs text-gray-500">Stock: {medicine.quantity}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                {quickSearchQuery && allMedicines.filter(med => med.name.toLowerCase().includes(quickSearchQuery.toLowerCase())).length === 0 && (
                                    <p className="text-center text-gray-500 py-8">No medicines found</p>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OwnerDashboard;
