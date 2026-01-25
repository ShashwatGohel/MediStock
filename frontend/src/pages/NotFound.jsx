import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";

const NotFound = () => {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mb-4" />
            <h1 className="text-4xl font-bold mb-2">404 - Page Not Found</h1>
            <p className="text-gray-400 mb-8">The page you are looking for does not exist or has been moved.</p>
            <Link
                to="/home"
                className="px-6 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors"
            >
                Go Back Home
            </Link>
        </div>
    );
};

export default NotFound;
