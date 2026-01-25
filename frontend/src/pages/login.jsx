import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { User, Store, ArrowRight, Pill, Stethoscope, Building2 } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("user"); // 'user' or 'store'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("isLoggedIn", "true");
        navigate("/home");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  const toggleRole = () => {
    setRole((prev) => (prev === "user" ? "store" : "user"));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4 font-['Outfit'] overflow-hidden relative">

      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[120px]" />

      {/* Main Square Box */}
      <div className="relative w-full max-w-[900px] h-[600px] bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex">

        {/* LEFT Background Layer (Visible when Store Login (Form on Right)) */}
        {/* Wait, if Form is on Right, Left is visible. Store Visual should be on Left. */}
        <div className="absolute inset-y-0 left-0 w-1/2 flex flex-col items-center justify-center p-12 text-center z-0 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 opacity-80 z-0"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center mb-6 mx-auto backdrop-blur-md border border-teal-500/30">
              <Building2 className="w-10 h-10 text-teal-400" />
            </div>
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-200 to-teal-500">
              Partner with MediStock
            </h2>
            <p className="text-gray-400 mb-8">
              Manage inventory, track sales, and reach more patients in your area.
            </p>
          </div>
        </div>

        {/* RIGHT Background Layer (Visible when User Login (Form on Left)) */}
        <div className="absolute inset-y-0 right-0 w-1/2 flex flex-col items-center justify-center p-12 text-center z-0">
          <div className="absolute inset-0 bg-gradient-to-bl from-emerald-900 to-[#0a0a0a] opacity-80 z-0"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 mx-auto backdrop-blur-md border border-emerald-500/30">
              <User className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-l from-emerald-200 to-emerald-500">
              Welcome Back
            </h2>
            <p className="text-gray-400 mb-8">
              Find medicines nearby, check availability, and save time during emergencies.
            </p>
          </div>
        </div>

        {/* SLIDING FORM PANEL */}
        <motion.div
          className="absolute top-0 bottom-0 w-1/2 bg-[#121212] z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] flex flex-col justify-center px-12 border-r border-white/5 border-l"
          initial={false}
          animate={{
            x: role === "user" ? "0%" : "100%",
            borderRightWidth: role === "user" ? "1px" : "0px",
            borderLeftWidth: role === "user" ? "0px" : "1px",
          }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
        >
          <div className="mb-10 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">
              {role === "user" ? "User Login" : "Store Login"}
            </h3>
            <p className="text-sm text-gray-500">
              Enter your details to access your account
            </p>
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className={`w-full py-4 rounded-xl font-bold text-black transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 ${role === "user"
                ? "bg-gradient-to-r from-emerald-400 to-green-500 shadow-[0_0_20px_rgba(52,211,153,0.3)]"
                : "bg-gradient-to-r from-teal-400 to-cyan-500 shadow-[0_0_20px_rgba(45,212,191,0.3)]"
                }`}
            >
              Log In <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer / Toggle */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm mb-4">
              {role === "user" ? "Are you a store owner?" : "Looking for medicines?"}
            </p>
            <button
              onClick={toggleRole}
              className="text-sm font-semibold text-white/80 hover:text-white underline decoration-emerald-500/50 hover:decoration-emerald-500 underline-offset-4 transition-all"
            >
              {role === "user" ? "Login as Store Owner" : "Login as User"}
            </button>

            <div className="mt-6 border-t border-white/5 pt-4">
              <p className="text-sm text-gray-400">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  state={{ role: role }}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                >
                  Sign up as {role === "user" ? "User" : "Partner"}
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Link to="/home" className="text-xs text-gray-600 hover:text-emerald-400 transition-colors">
              Back to Home
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Login;
