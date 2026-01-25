import { Link } from "react-router-dom";
import { Search, MapPin, Clock, ArrowRight, ShieldCheck, HeartPulse, Building2 } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-['Outfit'] selection:bg-emerald-500/30">

      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/home" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform">
              <HeartPulse className="text-white w-5 h-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
              Medi<span className="text-emerald-500">Stock</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {["Home", "About", "Contact"].map((item) => (
              <Link
                key={item}
                to={item === "Home" ? "/home" : `/${item.toLowerCase()}`}
                className="text-gray-400 hover:text-white transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all group-hover:w-full"></span>
              </Link>
            ))}
            <div className="h-6 w-px bg-white/10 mx-2"></div>
            <Link to="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link>
            <Link
              to="/signup"
              className="px-5 py-2.5 bg-white text-black rounded-lg font-bold hover:bg-emerald-400 transition-all transform hover:-translate-y-0.5 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(52,211,153,0.4)]"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-48 pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-40 right-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-sm font-medium mb-8 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live Inventory Tracking
          </div>

          <h1 className="text-6xl md:text-7xl font-bold leading-tight mb-8 tracking-tight">
            Find Medicines <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
              Instantly & Locally
            </span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
            Stop calling every pharmacy in town. MediStock connects you with local stores showing real-time medicine availability.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all transform hover:scale-[1.02] shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" /> Search Medicine
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white font-semibold rounded-xl border border-white/10 hover:bg-white/10 transition-all backdrop-blur-md flex items-center justify-center gap-2"
            >
              <MapPin className="w-5 h-5 text-gray-400" /> Nearby Stores
            </Link>
          </div>
        </div>
      </section>

      {/* Stats / Features Grid */}
      <section className="py-24 border-t border-white/5 bg-black/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Search className="w-8 h-8 text-emerald-400" />,
                title: "Smart Search",
                desc: "Instantly find even the rarest medicines using our advanced inventory database."
              },
              {
                icon: <MapPin className="w-8 h-8 text-teal-400" />,
                title: "Location Based",
                desc: "We automatically detect your location to show the nearest available pharmacies."
              },
              {
                icon: <Clock className="w-8 h-8 text-cyan-400" />,
                title: "Real-Time Data",
                desc: "Stock levels are updated instantly by pharmacists so you never make a wasted trip."
              }
            ].map((feature, idx) => (
              <div key={idx} className="group p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all hover:bg-white/[0.07]">
                <div className="bg-white/5 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Pharmacy Owners CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] to-[#0f172a] -z-10"></div>
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-8 shadow-2xl rotate-3 hover:rotate-6 transition-transform">
            <Building2 className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Pharmacy Owner? <br />
            <span className="text-indigo-400">Digitize Your Inventory.</span>
          </h2>

          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of pharmacies using MediStock to streamline operations and attract local customers effortlessly.
          </p>

          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-10 py-5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)]"
          >
            Register Your Store <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-500 rounded-md flex items-center justify-center">
              <HeartPulse className="text-white w-3 h-3" />
            </div>
            <span className="text-lg font-bold text-white">
              Medi<span className="text-emerald-500">Stock</span>
            </span>
          </div>

          <p className="text-gray-600 text-sm">
            © 2026 MediStock. Built for a healthier tomorrow.
          </p>

          <div className="flex gap-6">
            <a href="#" className="text-gray-500 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors">Twitter</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;
