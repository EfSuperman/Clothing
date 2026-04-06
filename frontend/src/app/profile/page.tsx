"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { 
  User, 
  MapPin, 
  Plus, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  ChevronRight, 
  X,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Address {
  id: string;
  name: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export default function ProfilePage() {
  const { user, token, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "Home",
    line1: "",
    city: "",
    state: "",
    zip: "",
    country: "Pakistan",
  });

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }
      fetchAddresses();
    };
    checkAuth();
  }, [isAuthenticated, token]);

  const fetchAddresses = async () => {
    try {
      const { data } = await api.get("/addresses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses(data);
    } catch (err) {
      console.error("Failed to fetch addresses", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const currentToken = useAuthStore.getState().token || token;
      await api.post("/addresses", formData, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      setSuccess("Address added successfully!");
      setShowAddModal(false);
      setFormData({
        name: "Home",
        line1: "",
        city: "",
        state: "",
        zip: "",
        country: "Pakistan",
      });
      fetchAddresses();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add address");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to remove this address?")) return;
    try {
      const currentToken = useAuthStore.getState().token || token;
      await api.delete(`/addresses/${id}`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      setAddresses(addresses.filter(a => a.id !== id));
      setSuccess("Address removed.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to delete address");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <div className="w-12 h-12 border-4 border-brand-indigo rounded-full border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white uppercase">
              CLIENT <span className="text-gradient">PROFILE.</span>
            </h1>
            <p className="text-slate-500 font-medium tracking-wide uppercase text-sm">
              Manage your identity and delivery preferences.
            </p>
          </div>
          <div className="glass px-8 py-4 rounded-[24px] border border-white/10 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-brand-indigo/20 flex items-center justify-center text-brand-indigo">
              <User size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Account Holder</p>
              <p className="text-lg font-black text-white italic tracking-tight">{user?.name}</p>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-4 space-y-4">
            <nav className="space-y-2">
              <Link href="/profile" className="flex items-center justify-between p-6 rounded-[24px] bg-white/5 border border-brand-indigo/30 text-white group">
                <div className="flex items-center gap-4">
                  <MapPin size={20} className="text-brand-indigo" />
                  <span className="font-bold uppercase tracking-widest text-sm">Address Book</span>
                </div>
                <ChevronRight size={16} />
              </Link>
              <Link href="/orders" className="flex items-center justify-between p-6 rounded-[24px] hover:bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all group">
                <div className="flex items-center gap-4">
                  <ShieldCheck size={20} />
                  <span className="font-bold uppercase tracking-widest text-sm">Order History</span>
                </div>
                <ChevronRight size={16} />
              </Link>
            </nav>

            <div className="glass-dark rounded-[32px] p-8 mt-8 border border-white/5">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Security Status</h3>
              <div className="flex items-center gap-2 text-green-500 mb-2">
                <CheckCircle2 size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Verified Account</span>
              </div>
              <p className="text-[10px] text-slate-600 uppercase tracking-widest leading-relaxed">
                Your account is secured with end-to-end encryption.
              </p>
            </div>
          </div>

          {/* Main Content: Address Book */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Saved Addresses</h2>
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
              >
                <Plus size={16} /> Add New
              </button>
            </div>

            <AnimatePresence>
              {success && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-green-400 text-xs font-bold uppercase tracking-widest"
                >
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid sm:grid-cols-2 gap-6">
              {addresses.length === 0 ? (
                <div className="col-span-full py-20 text-center glass-dark rounded-[40px] border border-white/5">
                  <MapPin size={40} className="mx-auto mb-4 text-slate-700" />
                  <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">No saved addresses found</p>
                </div>
              ) : (
                addresses.map((address) => (
                  <motion.div 
                    layout
                    key={address.id} 
                    className="glass-dark rounded-[32px] p-8 border border-white/5 hover:border-brand-indigo/30 transition-all group relative"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="h-10 w-10 glass rounded-xl flex items-center justify-center text-brand-indigo">
                        <MapPin size={18} />
                      </div>
                      <div className="flex gap-2">
                        <button className="text-slate-600 hover:text-white transition-colors"><Edit3 size={16} /></button>
                        <button 
                          onClick={() => handleDeleteAddress(address.id)}
                          className="text-slate-600 hover:text-brand-rose transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">{address.name}</h3>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        {address.line1}<br />
                        {address.city}, {address.state} {address.zip}<br />
                        {address.country}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg glass-dark rounded-[40px] border border-white/10 p-10 overflow-hidden"
            >
              <button 
                onClick={() => setShowAddModal(false)}
                className="absolute top-8 right-8 text-slate-500 hover:text-white"
              >
                <X size={24} />
              </button>

              <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-8">
                NEW <span className="text-brand-indigo">ADDRESS.</span>
              </h2>

              <form onSubmit={handleAddAddress} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Label</label>
                    <input
                      required
                      placeholder="Home, Office..."
                      className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-xs text-white focus:outline-none focus:border-brand-indigo/50 transition-all font-bold uppercase tracking-widest"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Country</label>
                    <input
                      required
                      className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-xs text-white focus:outline-none focus:border-brand-indigo/50 transition-all font-bold uppercase tracking-widest"
                      value={formData.country}
                      onChange={(e) => setFormData({...formData, country: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Street Address</label>
                  <input
                    required
                    placeholder="House #, Street name..."
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-xs text-white focus:outline-none focus:border-brand-indigo/50 transition-all font-medium"
                    value={formData.line1}
                    onChange={(e) => setFormData({...formData, line1: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">City</label>
                    <input
                      required
                      className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-xs text-white focus:outline-none focus:border-brand-indigo/50 transition-all font-medium"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">State / Province</label>
                    <input
                      required
                      className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-xs text-white focus:outline-none focus:border-brand-indigo/50 transition-all font-medium"
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Postal Code</label>
                  <input
                    required
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-xs text-white focus:outline-none focus:border-brand-indigo/50 transition-all font-mono tracking-widest"
                    value={formData.zip}
                    onChange={(e) => setFormData({...formData, zip: e.target.value})}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-brand-rose text-[10px] font-bold uppercase tracking-widest px-1">
                    <AlertCircle size={14} /> {error}
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full py-5 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_40px_-15px_rgba(255,255,255,0.1)] mt-4"
                >
                  SAVE ADDRESS
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
