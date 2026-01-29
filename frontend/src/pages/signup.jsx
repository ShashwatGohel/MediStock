import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { User, Building2, ArrowRight, FileText, MapPin, Phone, Mail, Lock, Store as StoreIcon, CheckCircle2, Loader, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getCurrentLocation } from "../utils/locationUtils";

const Signup = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.role || "user"); // 'user' or 'store'

    // User Form State
    const [userFormData, setUserFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    // Store Form State
    const [storeFormData, setStoreFormData] = useState({
        ownerName: "",
        storeName: "",
        email: "",
        phone: "",
        licenseNumber: "",
        gstNumber: "",
        address: "",
        city: "",
        pincode: "",
        password: "",
        confirmPassword: "",
        latitude: "",
        longitude: ""
    });

    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState("");

    const handleUserChange = (e) => {
        setUserFormData({ ...userFormData, [e.target.name]: e.target.value });
    };

    const handleStoreChange = (e) => {
        setStoreFormData({ ...storeFormData, [e.target.name]: e.target.value });
    };

    const [error, setError] = useState("");

    const handleGetLocation = async () => {
        try {
            setLocationLoading(true);
            setLocationError("");
            const location = await getCurrentLocation();
            setStoreFormData({
                ...storeFormData,
                latitude: location.latitude.toString(),
                longitude: location.longitude.toString()
            });
        } catch (error) {
            setLocationError(error.message);
        } finally {
            setLocationLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");

        let payload = {};

        if (activeTab === "user") {
            if (userFormData.password !== userFormData.confirmPassword) {
                setError("Passwords do not match");
                return;
            }
            payload = {
                name: userFormData.name,
                email: userFormData.email,
                password: userFormData.password,
                role: "user",
            };
        } else {
            if (storeFormData.password !== storeFormData.confirmPassword) {
                setError("Passwords do not match");
                return;
            }
            payload = {
                name: storeFormData.ownerName,
                email: storeFormData.email,
                password: storeFormData.password,
                role: "store",
                storeName: storeFormData.storeName,
                phone: storeFormData.phone,
                licenseNumber: storeFormData.licenseNumber,
                storeAddress: storeFormData.address,
                city: storeFormData.city,
                latitude: storeFormData.latitude,
                longitude: storeFormData.longitude,
            };
        }

        try {
            const response = await fetch("https://medistock-3a3y.onrender.com/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                // Auto-login
                localStorage.setItem("token", data.token);
                localStorage.setItem("role", data.role);
                localStorage.setItem("user", JSON.stringify(data.user));
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("isLoggedIn", "true");

                if (data.role === "store") {
                    navigate("/owner-dashboard");
                } else {
                    navigate("/user-dashboard");
                }
            } else {
                setError(data.message || "Signup failed");
            }
        } catch (err) {
            console.error("Signup error:", err);
            setError("Something went wrong. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4 font-['Outfit'] relative overflow-hidden">

            {/* Background Gradients */}
            <div className={`absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[120px] opacity-20 transition-colors duration-1000 ${activeTab === 'user' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />

            <div className="w-full max-w-lg z-10">

                {/* Header */}
                <div className="text-center mb-8">
                    <Link to="/home" className="inline-block mb-4">
                        <span className="text-2xl font-bold tracking-tight">
                            Medi<span className={activeTab === 'user' ? "text-emerald-500 transition-colors" : "text-indigo-500 transition-colors"}>Stock</span>
                        </span>
                    </Link>
                    <h1 className="text-3xl font-bold mb-2">Create Account</h1>
                    <p className="text-gray-400 text-sm">Join our network to manage or find medicines.</p>
                    {error && (
                        <p className="text-red-500 text-sm mt-2">{error}</p>
                    )}
                </div>

                {/* Tab Navigation */}
                <div className="bg-white/5 backdrop-blur-md p-1 rounded-xl flex mb-6 border border-white/10">
                    <button
                        onClick={() => setActiveTab("user")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === "user"
                            ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        <User className="w-4 h-4" /> User
                    </button>
                    <button
                        onClick={() => setActiveTab("store")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === "store"
                            ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        <Building2 className="w-4 h-4" /> Pharmacy
                    </button>
                </div>

                {/* Main Card */}
                <div className="bg-[#121212]/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative">
                    <div className="p-8">
                        <AnimatePresence mode="wait">

                            {/* USER FORM CONTENT */}
                            {activeTab === "user" ? (
                                <motion.form
                                    key="user-form"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                    onSubmit={handleSignup}
                                    className="space-y-4"
                                >
                                    <div className="space-y-4">
                                        <div className="group">
                                            <label className="block text-xs text-gray-400 mb-1 ml-1 uppercase font-semibold tracking-wider">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                                                <input
                                                    name="name"
                                                    type="text"
                                                    placeholder="John Doe"
                                                    value={userFormData.name}
                                                    onChange={handleUserChange}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-gray-600"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="group">
                                            <label className="block text-xs text-gray-400 mb-1 ml-1 uppercase font-semibold tracking-wider">Email</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                                                <input
                                                    name="email"
                                                    type="email"
                                                    placeholder="john@example.com"
                                                    value={userFormData.email}
                                                    onChange={handleUserChange}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-gray-600"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="group">
                                                <label className="block text-xs text-gray-400 mb-1 ml-1 uppercase font-semibold tracking-wider">Password</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                                                    <input
                                                        name="password"
                                                        type="password"
                                                        placeholder="••••••••"
                                                        value={userFormData.password}
                                                        onChange={handleUserChange}
                                                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-gray-600"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="group">
                                                <label className="block text-xs text-gray-400 mb-1 ml-1 uppercase font-semibold tracking-wider">Confirm</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                                                    <input
                                                        name="confirmPassword"
                                                        type="password"
                                                        placeholder="••••••••"
                                                        value={userFormData.confirmPassword}
                                                        onChange={handleUserChange}
                                                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-gray-600"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl font-bold text-black hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2">
                                            Create Account <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.form>
                            ) : (
                                /* STORE FORM CONTENT */
                                <motion.form
                                    key="store-form"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    onSubmit={handleSignup}
                                    className="space-y-4"
                                >
                                    <div className="h-[400px] overflow-y-auto pr-2 scrollbar-hide space-y-4 -mr-2">

                                        {/* Store Info Section */}
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                <Building2 className="w-3 h-3" /> Store Details
                                            </h3>
                                            <div className="space-y-3">
                                                <input
                                                    name="storeName"
                                                    type="text"
                                                    placeholder="Pharmacy Name"
                                                    value={storeFormData.storeName}
                                                    onChange={handleStoreChange}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-600"
                                                    required
                                                />
                                                <div className="grid grid-cols-2 gap-3">
                                                    <input
                                                        name="ownerName"
                                                        type="text"
                                                        placeholder="Owner Name"
                                                        value={storeFormData.ownerName}
                                                        onChange={handleStoreChange}
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-600"
                                                        required
                                                    />
                                                    <input
                                                        name="phone"
                                                        type="tel"
                                                        placeholder="Phone Number"
                                                        value={storeFormData.phone}
                                                        onChange={handleStoreChange}
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-600"
                                                        required
                                                    />
                                                </div>
                                                <input
                                                    name="email"
                                                    type="email"
                                                    placeholder="Business Email"
                                                    value={storeFormData.email}
                                                    onChange={handleStoreChange}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-600"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Legal Info Section */}
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                <FileText className="w-3 h-3" /> Legal Information
                                            </h3>
                                            <div className="space-y-3">
                                                <input
                                                    name="licenseNumber"
                                                    type="text"
                                                    placeholder="Drug License Number"
                                                    value={storeFormData.licenseNumber}
                                                    onChange={handleStoreChange}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-600"
                                                    required
                                                />
                                                <input
                                                    name="gstNumber"
                                                    type="text"
                                                    placeholder="GST Number (Optional)"
                                                    value={storeFormData.gstNumber}
                                                    onChange={handleStoreChange}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-600"
                                                />
                                            </div>
                                        </div>

                                        {/* Location Section */}
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                <MapPin className="w-3 h-3" /> Location
                                            </h3>
                                            <div className="space-y-3">
                                                <textarea
                                                    name="address"
                                                    rows="2"
                                                    placeholder="Full Address"
                                                    value={storeFormData.address}
                                                    onChange={handleStoreChange}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-600 resize-none"
                                                    required
                                                />
                                                <div className="grid grid-cols-2 gap-3">
                                                    <input
                                                        name="city"
                                                        type="text"
                                                        placeholder="City"
                                                        value={storeFormData.city}
                                                        onChange={handleStoreChange}
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-600"
                                                        required
                                                    />
                                                    <input
                                                        name="pincode"
                                                        type="text"
                                                        placeholder="Pincode"
                                                        value={storeFormData.pincode}
                                                        onChange={handleStoreChange}
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-600"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Geolocation Section */}
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                <Navigation className="w-3 h-3" /> Store Location
                                            </h3>
                                            <div className="space-y-3">
                                                <button
                                                    type="button"
                                                    onClick={handleGetLocation}
                                                    disabled={locationLoading}
                                                    className="w-full py-3 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-lg font-semibold text-indigo-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {locationLoading ? (
                                                        <>
                                                            <Loader className="w-4 h-4 animate-spin" />
                                                            Getting Location...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <MapPin className="w-4 h-4" />
                                                            Get Current Location
                                                        </>
                                                    )}
                                                </button>

                                                {locationError && (
                                                    <p className="text-red-400 text-xs">{locationError}</p>
                                                )}

                                                {storeFormData.latitude && storeFormData.longitude && (
                                                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                                                        <p className="text-green-400 text-xs font-semibold mb-1 flex items-center gap-1">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Location Captured
                                                        </p>
                                                        <p className="text-gray-400 text-xs font-mono">
                                                            {parseFloat(storeFormData.latitude).toFixed(6)}, {parseFloat(storeFormData.longitude).toFixed(6)}
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-2 gap-3">
                                                    <input
                                                        name="latitude"
                                                        type="number"
                                                        step="any"
                                                        placeholder="Latitude"
                                                        value={storeFormData.latitude}
                                                        onChange={handleStoreChange}
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-600"
                                                        required
                                                    />
                                                    <input
                                                        name="longitude"
                                                        type="number"
                                                        step="any"
                                                        placeholder="Longitude"
                                                        value={storeFormData.longitude}
                                                        onChange={handleStoreChange}
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-600"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Security Section */}
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                <Lock className="w-3 h-3" /> Security
                                            </h3>
                                            <div className="grid grid-cols-1 gap-3">
                                                <input
                                                    name="password"
                                                    type="password"
                                                    placeholder="Create Password"
                                                    value={storeFormData.password}
                                                    onChange={handleStoreChange}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-600"
                                                    required
                                                />
                                                <input
                                                    name="confirmPassword"
                                                    type="password"
                                                    placeholder="Confirm Password"
                                                    value={storeFormData.confirmPassword}
                                                    onChange={handleStoreChange}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-600"
                                                    required
                                                />
                                            </div>
                                        </div>

                                    </div>

                                    <div className="pt-2">
                                        <button className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl font-bold text-white hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2">
                                            Register Pharmacy <CheckCircle2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.form>
                            )}
                        </AnimatePresence>

                        <div className="mt-6 text-center">
                            <span className="text-gray-500 text-sm">Already Account Holder? </span>
                            <Link to="/login" className="text-white hover:underline decoration-emerald-500 underline-offset-4 text-sm font-semibold transition-all">
                                Login Here
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Signup;
