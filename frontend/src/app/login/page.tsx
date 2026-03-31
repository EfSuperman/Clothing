"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const login = useAuthStore((state) => state.login);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      login(data.user, data.token);
      router.push(redirect);
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="relative w-full max-w-[480px]">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-brand-indigo/10 blur-[100px] rounded-full -z-10" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-dark rounded-[40px] border border-white/5 p-10 md:p-14 shadow-2xl"
        >
          <div className="text-center mb-10">
            <Link href="/" className="inline-block text-3xl font-black tracking-tighter text-white uppercase mb-6">
              CLS<span className="text-brand-indigo">.</span>
            </Link>
            <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Welcome Back</h1>
            <p className="text-slate-500 text-sm mt-2 font-medium">Access your personalized shopping experience.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 flex items-center gap-3 bg-brand-rose/10 border border-brand-rose/20 p-4 rounded-2xl text-brand-rose text-xs font-bold uppercase tracking-widest"
            >
              <AlertCircle size={18} /> {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Email Address</label>
              <div className="relative group">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full bg-surface-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-brand-indigo/50 transition-all group-hover:border-white/10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-indigo transition-colors" size={18} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
                <Link href="/forgot-password" size="sm" className="text-[10px] font-bold text-brand-indigo uppercase tracking-widest hover:underline">Forgot?</Link>
              </div>
              <div className="relative group">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-surface-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-brand-indigo/50 transition-all group-hover:border-white/10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-indigo transition-colors" size={18} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-white text-black rounded-2xl font-black text-sm tracking-[0.2em] uppercase transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-10"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>SIGN IN <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-white/5 text-center">
            <p className="text-sm text-slate-500 font-medium">
              New to our collection?{" "}
              <Link href="/register" className="text-white font-bold hover:text-brand-indigo transition-colors">
                Join the vision
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
