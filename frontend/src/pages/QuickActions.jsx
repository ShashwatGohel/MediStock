import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Upload, Activity, PlusCircle, Heart, Navigation,
    ArrowLeft, Bell, HeartPulse, Sparkles, Zap, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import PrescriptionModal from "../components/PrescriptionModal";

const QuickActions = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        }

        // Try to get location from storage
        const savedLocation = localStorage.getItem("userLocation");
        if (savedLocation) {
            setUserLocation(JSON.parse(savedLocation));
        }
    }, []);

    // Handle auto-triggering actions from dashboard
    useEffect(() => {
        if (location.state?.trigger) {
            const trigger = location.state.trigger;
            const action = actions.find(a => a.id === trigger);
            if (action && action.onClick) {
                // Short delay to allow animations to start
                setTimeout(() => {
                    action.onClick();
                    // Clear state to prevent re-triggering on refresh
                    navigate(location.pathname, { replace: true, state: {} });
                }, 500);
            }
        }
    }, [location.state]);

    const actions = [
        {
            id: 'upload-rx',
            icon: Upload,
            label: "Upload Rx",
            description: "Upload prescription to find medicines",
            color: "text-amber-400",
            bg: "bg-amber-400/10",
            border: "border-amber-400/20",
            onClick: () => setShowPrescriptionModal(true)
        },
        {
            id: 'order-track',
            icon: Activity,
            label: "Order Track",
            description: "Check status of your medicine requests",
            color: "text-emerald-400",
            bg: "bg-emerald-400/10",
            border: "border-emerald-400/20",
            onClick: () => navigate('/my-orders')
        },
        {
            id: 'shop-now',
            icon: PlusCircle,
            label: "Shop Now",
            description: "Browse various categories of products",
            color: "text-indigo-400",
            bg: "bg-indigo-400/10",
            border: "border-indigo-400/20",
            onClick: () => navigate('/user-dashboard', { state: { scrollTo: 'categories-section' } })
        },
        {
            id: 'favorites',
            icon: Heart,
            label: "Favorites",
            description: "View your saved and preferred stores",
            color: "text-rose-400",
            bg: "bg-rose-400/10",
            border: "border-rose-400/20",
            onClick: () => navigate('/saved-stores')
        },
        {
            id: 'map-view',
            icon: Navigation,
            label: "Map View",
            description: "Locate pharmacies on the interactive map",
            color: "text-blue-400",
            bg: "bg-blue-400/10",
            border: "border-blue-400/20",
            onClick: () => navigate('/user-dashboard', { state: { openMap: true } })
        }
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-['Outfit'] selection:bg-emerald-500/30 overflow-x-hidden relative pb-20">

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
                                <HeartPulse className="text-white w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white">
                                Quick Actions
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
                            <Bell className="w-5 h-5" />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-xs font-bold text-black border border-white/10">
                            {user ? user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                    </div>
                </div>
            </nav>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                <header className="mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-500/20">
                            <Zap className="w-3 h-3 fill-emerald-500" /> Instant Access
                        </span>
                        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                            What do you need help with?
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl">
                            Our quick actions help you complete tasks faster. From uploading prescriptions to tracking orders, everything is just a click away.
                        </p>
                    </motion.div>
                </header>

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {actions.map((action) => (
                        <motion.button
                            key={action.id}
                            variants={item}
                            onClick={action.onClick}
                            className={`group relative flex flex-col items-start p-8 rounded-3xl border ${action.border} ${action.bg} hover:bg-opacity-20 transition-all duration-300 hover:-translate-y-2 text-left overflow-hidden`}
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <action.icon className="w-32 h-32" />
                            </div>

                            <div className="relative z-10">
                                <div className={`w-14 h-14 rounded-2xl ${action.bg} ${action.border} border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                                    <action.icon className={`w-7 h-7 ${action.color}`} />
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                                    {action.label}
                                </h3>
                                <p className="text-gray-400 font-medium leading-relaxed">
                                    {action.description}
                                </p>

                                <div className="mt-8 flex items-center gap-2 text-sm font-bold text-white/50 group-hover:text-white transition-colors">
                                    Open Action <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        </motion.button>
                    ))}

                    <motion.div
                        variants={item}
                        className="p-8 rounded-3xl border border-white/5 bg-white/5 flex flex-col items-center justify-center text-center space-y-4"
                    >
                        <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-purple-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white">More coming soon</h3>
                        <p className="text-gray-500 text-sm">We're constantly adding new ways to make healthcare easier for you.</p>
                    </motion.div>
                </motion.div>
            </div>

            <PrescriptionModal
                isOpen={showPrescriptionModal}
                onClose={() => setShowPrescriptionModal(false)}
                userLocation={userLocation}
            />
        </div>
    );
};

export default QuickActions;
