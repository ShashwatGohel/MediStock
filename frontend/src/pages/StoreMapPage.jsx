import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Navigation, MapPin, X, ArrowLeft, Loader,
    MapPinOff, Store, Phone, Activity, ChevronRight,
    Search, Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { userIcon, storeIcon } from "../utils/MapMarkerIcons";
import RangeSlider from "../components/RangeSlider";
import { API_URLS } from "../api";

const RecenterMap = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.setView([position.lat, position.lng], map.getZoom());
        }
    }, [position, map]);
    return null;
};

const StoreMapPage = () => {
    const navigate = useNavigate();
    const [userLocation, setUserLocation] = useState(null);
    const [userAddress, setUserAddress] = useState("");
    const [nearbyStores, setNearbyStores] = useState([]);
    const [searchRadius, setSearchRadius] = useState(5);
    const [loading, setLoading] = useState(true);
    const [selectedStore, setSelectedStore] = useState(null);

    useEffect(() => {
        const savedLocation = localStorage.getItem("userLocation");
        const savedAddress = localStorage.getItem("userAddress");

        if (savedLocation) {
            const loc = JSON.parse(savedLocation);
            setUserLocation(loc);
            fetchNearbyStores(loc, searchRadius);
        }
        if (savedAddress) setUserAddress(savedAddress);
    }, [searchRadius]);

    const fetchNearbyStores = async (loc, radius) => {
        setLoading(true);
        try {
            const response = await fetch(
                `${API_URLS.STORES}/nearby?lat=${loc.latitude}&lng=${loc.longitude}&radius=${radius}`
            );
            const data = await response.json();
            if (data.success) {
                setNearbyStores(data.stores);
            }
        } catch (error) {
            console.error("Error fetching stores:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen bg-[#0a0a0a] flex flex-col font-['Outfit'] overflow-hidden">
            {/* 🧭 Navbar */}
            <nav className="z-50 w-full bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-full mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/user-dashboard')}
                            className="p-2 hover:bg-white/5 rounded-full transition-colors group"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white" />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                <Navigation className="text-white w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white">
                                Interactive Store Map
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5 max-w-md">
                        <MapPin className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm text-gray-400 truncate">{userAddress || "Location loading..."}</span>
                    </div>
                </div>
            </nav>

            <div className="flex-1 flex overflow-hidden">
                {/* 📝 Sidebar */}
                <aside className="w-80 lg:w-96 bg-[#121212] border-r border-white/10 flex flex-col">
                    <div className="p-6 border-b border-white/10 space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Map Controls</h3>
                            <RangeSlider
                                value={searchRadius}
                                onChange={setSearchRadius}
                                min={1}
                                max={50}
                                unit="km"
                            />
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Filter stores by name..."
                                className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-2 mb-4">Nearby Pharmacies ({nearbyStores.length})</h3>
                        {loading ? (
                            <div className="py-20 text-center">
                                <Loader className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
                                <p className="text-sm text-gray-500">Scanning territory...</p>
                            </div>
                        ) : nearbyStores.map(store => (
                            <button
                                key={store.id}
                                onClick={() => setSelectedStore(store)}
                                className={`w-full p-4 rounded-2xl border transition-all text-left group ${selectedStore?.id === store.id
                                    ? 'bg-blue-500/10 border-blue-500/30'
                                    : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">{store.name}</h4>
                                    <span className="text-[10px] font-bold text-emerald-400">{store.distance}km</span>
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{store.address}</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <div className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold">Open</div>
                                        <div className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">Medicines</div>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 text-gray-600 transition-transform ${selectedStore?.id === store.id ? 'translate-x-1 text-blue-500' : ''}`} />
                                </div>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* 🗺️ Main Map Area */}
                <main className="flex-1 relative">
                    {userLocation ? (
                        <MapContainer
                            center={[userLocation.latitude, userLocation.longitude]}
                            zoom={14}
                            style={{ width: "100%", height: "100%", background: "#1a1a1a" }}
                            zoomControl={false}
                        >
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                            />
                            <RecenterMap position={{ lat: userLocation.latitude, lng: userLocation.longitude }} />

                            {/* User Marker */}
                            <Marker
                                position={[userLocation.latitude, userLocation.longitude]}
                                icon={userIcon}
                            >
                                <Popup>
                                    <div className="p-1 font-bold text-xs">Your Location</div>
                                </Popup>
                            </Marker>

                            {/* Store Markers */}
                            {nearbyStores.map(store => (
                                <Marker
                                    key={store.id}
                                    position={[store.latitude, store.longitude]}
                                    icon={storeIcon}
                                    eventHandlers={{
                                        click: () => setSelectedStore(store),
                                    }}
                                >
                                    <Popup>
                                        <div className="p-2 text-black max-w-[200px] min-w-[150px]">
                                            <h3 className="font-bold text-sm mb-1">{store.name}</h3>
                                            <p className="text-xs text-gray-600 mb-2">{store.address}</p>
                                            <button
                                                onClick={() => navigate(`/store/${store.id}`)}
                                                className="w-full py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg"
                                            >
                                                View Store Details
                                            </button>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <Loader className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                            <p className="text-gray-400">Synchronizing satellite data...</p>
                        </div>
                    )}

                    {/* 🎴 Floating Info Card (appears when store selected) */}
                    <AnimatePresence>
                        {selectedStore && (
                            <motion.div
                                initial={{ opacity: 0, y: 100 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 100 }}
                                className="absolute bottom-10 left-10 right-10 lg:left-auto lg:right-10 lg:w-[400px] z-[1000] bg-[#121212]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                            >
                                <button
                                    onClick={() => setSelectedStore(null)}
                                    className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-full"
                                >
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>
                                <div className="flex gap-4 mb-6">
                                    <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500 flex-shrink-0 border border-blue-500/20">
                                        <Store className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-1">{selectedStore.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-500 text-[10px] font-bold rounded">Active Now</span>
                                            <span className="text-xs text-gray-500 font-medium tracking-tight">Open until 10:00 PM</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 text-sm text-gray-400">
                                        <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                        <span>{selectedStore.address}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-400">
                                        <Activity className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                        <span>{selectedStore.distance}km estimated distance</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => navigate(`/store/${selectedStore.id}`)}
                                        className="py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
                                    >
                                        Visit Store
                                    </button>
                                    <button className="py-3 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold border border-white/5 transition-all">
                                        Directions
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default StoreMapPage;
