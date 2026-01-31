import { useState, useRef } from "react";
import { X, Upload, FileType, CheckCircle2, AlertCircle, Loader, Download, Table } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URLS } from "../api";

const BulkUploadModal = ({ isOpen, onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.name.endsWith(".xlsx") || selectedFile.name.endsWith(".xls") || selectedFile.name.endsWith(".csv")) {
                setFile(selectedFile);
                setError("");
            } else {
                setError("Please select a valid Excel or CSV file (.xlsx, .xls, .csv)");
                setFile(null);
            }
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file first");
            return;
        }

        setLoading(true);
        setError("");
        setSuccessMsg("");

        try {
            const token = localStorage.getItem("token");
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch(API_URLS.BULK_UPLOAD, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                setSuccessMsg(data.message || "Bulk upload successful!");
                if (onSuccess) onSuccess();
                setTimeout(() => {
                    handleClose();
                }, 2000);
            } else {
                setError(data.message || "Failed to upload file");
            }
        } catch (err) {
            console.error("Bulk upload error:", err);
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setFile(null);
            setError("");
            setSuccessMsg("");
            onClose();
        }
    };

    const downloadTemplate = () => {
        // Create a simple CSV template and download it
        const headers = "Name,Brand,Category,Quantity,Price,Expiry Date\n";
        const sampleRows = "Paracetamol,Crocin,Pain Relief,100,25.50,2026-12-31\nAmoxicillin,Generic,Antibiotics,50,120.00,2025-06-30";
        const blob = new Blob([headers + sampleRows], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "medistock_template.csv";
        a.click();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[101] flex items-center justify-center p-4"
                    >
                        <div className="bg-[#121212] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl">
                            {/* Header */}
                            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                                        <Table className="w-6 h-6 text-indigo-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Bulk Upload</h2>
                                        <p className="text-xs text-gray-400">Add multiple medicines via Excel</p>
                                    </div>
                                </div>
                                <button onClick={handleClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                {/* Template Download */}
                                <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                                            <Download className="w-4 h-4 text-indigo-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">Need a template?</p>
                                            <p className="text-[10px] text-gray-500 italic">Download our formatted CSV template</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={downloadTemplate}
                                        className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-lg text-xs font-bold transition-all border border-indigo-500/20"
                                    >
                                        Download
                                    </button>
                                </div>

                                {/* Drag & Drop Area */}
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`relative border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer group
                                        ${file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/5'}
                                    `}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept=".xlsx,.xls,.csv"
                                    />

                                    <div className="flex flex-col items-center">
                                        {file ? (
                                            <>
                                                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4">
                                                    <FileType className="w-8 h-8 text-emerald-500" />
                                                </div>
                                                <h3 className="text-white font-bold mb-1 truncate max-w-[200px]">{file.name}</h3>
                                                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Ready to upload</p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-indigo-400" />
                                                </div>
                                                <h3 className="text-white font-bold mb-1">Select Excel or CSV File</h3>
                                                <p className="text-gray-500 text-xs">Drag and drop or click to browse</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Feedback Messages */}
                                <AnimatePresence mode="wait">
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-sm"
                                        >
                                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                            {error}
                                        </motion.div>
                                    )}
                                    {successMsg && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400 text-sm"
                                        >
                                            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                            {successMsg}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Action Button */}
                                <button
                                    onClick={handleUpload}
                                    disabled={!file || loading}
                                    className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <>
                                            <Loader className="w-5 h-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5" />
                                            Start Batch Upload
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default BulkUploadModal;
