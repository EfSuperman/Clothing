"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { 
  User, 
  Package, 
  MapPin, 
  ChevronRight, 
  ShoppingBag,
  Clock,
  CheckCircle,
  CreditCard,
  Crown
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FormattedPrice } from "@/components/FormattedPrice";

export default function UserDashboard() {
  const { user, token, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const { data } = await api.get("/orders/my-orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(data);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [isAuthenticated, token, router]);

  const totalSpent = orders
    .filter(o => o.paymentStatus === 'APPROVED' || o.paymentStatus === 'VERIFIED')
    .reduce((acc, curr) => acc + Number(curr.totalAmount), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <div className="w-12 h-12 border-4 border-brand-indigo rounded-full border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-surface-950">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-brand-indigo/10 text-brand-indigo text-[10px] font-black uppercase tracking-widest rounded-full border border-brand-indigo/20">
                Lux Client
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white uppercase italic">
              CONCIERGE <span className="text-brand-indigo">HUB.</span>
            </h1>
            <p className="text-slate-500 font-medium tracking-wide uppercase text-sm">
              Welcome back, <span className="text-white">{user?.name}</span>. Your luxury portfolio awaits.
            </p>
          </div>
          
          <div className="flex items-center gap-4 glass-dark p-2 rounded-2xl border border-white/5">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-tr from-brand-indigo to-brand-cyan flex items-center justify-center text-white shadow-lg">
              <Crown size={28} />
            </div>
            <div className="pr-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Client Status</p>
              <p className="text-lg font-black text-white italic tracking-tight uppercase">Vision Elite</p>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-8 rounded-[32px] border border-white/5 space-y-4 group hover:border-brand-indigo/30 transition-all shadow-2xl"
          >
            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-brand-indigo transition-colors">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Total Amount</p>
              <p className="text-3xl font-black text-white italic tracking-tighter mt-1">
                <FormattedPrice amount={totalSpent} />
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-8 rounded-[32px] border border-white/5 space-y-4 group hover:border-brand-indigo/30 transition-all shadow-2xl"
          >
            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-brand-indigo transition-colors">
              <Package size={24} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Total Acquisitions</p>
              <p className="text-3xl font-black text-white italic tracking-tighter mt-1">{orders.length}</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-8 rounded-[32px] border border-white/5 space-y-4 group hover:border-brand-indigo/30 transition-all shadow-2xl"
          >
            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-brand-indigo transition-colors">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Active Requests</p>
              <p className="text-3xl font-black text-white italic tracking-tighter mt-1">
                {orders.filter(o => o.paymentStatus === 'PENDING' || o.paymentStatus === 'VERIFICATION_PENDING').length}
              </p>
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Recent Orders Section */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                <ShoppingBag className="text-brand-indigo" /> Recent Orders
              </h2>
              <Link href="/orders" className="text-xs font-bold text-slate-500 hover:text-brand-indigo uppercase tracking-widest border-b border-white/5 pb-1">
                View All History
              </Link>
            </div>

            <div className="space-y-6">
              {orders.slice(0, 3).map((order) => (
                <Link 
                  key={order.id} 
                  href="/orders"
                  className="block glass-dark rounded-[32px] p-8 border border-white/5 hover:border-brand-indigo/30 transition-all group overflow-hidden relative"
                >
                  <div className="absolute top-0 right-10 h-full w-40 bg-gradient-to-l from-brand-indigo/5 to-transparent blur-3xl pointer-events-none" />
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">#{order.id.slice(-8).toUpperCase()}</span>
                        <span className={`px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border
                          ${order.paymentStatus === 'APPROVED' || order.paymentStatus === 'VERIFIED' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                            order.paymentStatus === 'FAILED' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                            'bg-brand-indigo/10 text-brand-indigo border-brand-indigo/20'}`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                      <div className="flex -space-x-4">
                        {order.orderItems?.slice(0, 3).map((item: any, idx: number) => (
                          <div key={idx} className="h-12 w-12 rounded-xl border-2 border-surface-950 bg-white/5 overflow-hidden shadow-2xl">
                            <img src={item.product?.imageURLs?.[0]} className="w-full h-full object-cover" alt="" />
                          </div>
                        ))}
                        {order.orderItems?.length > 3 && (
                          <div className="h-12 w-12 rounded-xl border-2 border-surface-950 bg-surface-900 flex items-center justify-center text-[10px] font-bold text-slate-400">
                            +{order.orderItems.length - 3}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-left md:text-right space-y-1">
                      <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Final Value</p>
                      <p className="text-2xl font-black text-white italic tracking-tighter">
                        <FormattedPrice amount={order.totalAmount} customSymbol={order.currencySymbol} />
                      </p>
                      <div className="flex items-center md:justify-end gap-1 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                        Check Details <ChevronRight size={12} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              
              {orders.length === 0 && (
                <div className="text-center py-20 glass rounded-[40px] border border-white/5">
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No orders placed yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Quick Actions</h2>
            <div className="space-y-4">
              <Link href="/profile" className="flex items-center justify-between p-6 rounded-[24px] bg-white/5 border border-white/5 hover:border-brand-indigo/30 text-white transition-all group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 glass rounded-xl flex items-center justify-center text-brand-indigo">
                    <MapPin size={18} />
                  </div>
                  <span className="font-bold uppercase tracking-widest text-xs">Address Book</span>
                </div>
                <ChevronRight size={16} className="text-slate-600 group-hover:text-brand-indigo transition-all" />
              </Link>

              <Link href="/profile" className="flex items-center justify-between p-6 rounded-[24px] bg-white/5 border border-white/5 hover:border-brand-indigo/30 text-white transition-all group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 glass rounded-xl flex items-center justify-center text-brand-indigo">
                    <User size={18} />
                  </div>
                  <span className="font-bold uppercase tracking-widest text-xs">Profile Settings</span>
                </div>
                <ChevronRight size={16} className="text-slate-600 group-hover:text-brand-indigo transition-all" />
              </Link>

              <Link href="/products" className="flex items-center justify-between p-6 rounded-[24px] bg-brand-indigo text-white shadow-xl shadow-brand-indigo/20 hover:scale-[1.02] active:scale-[0.98] transition-all group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <ShoppingBag size={18} />
                  </div>
                  <span className="font-bold uppercase tracking-widest text-xs">Acquire More</span>
                </div>
                <ChevronRight size={16} />
              </Link>
            </div>

            {/* Loyalty Card */}
            <div className="relative group mt-12">
              <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-tr from-brand-indigo/20 via-brand-cyan/20 to-brand-indigo/20 blur opacity-75 group-hover:opacity-100 transition duration-500" />
              <div className="relative glass-dark p-8 rounded-[32px] border border-white/10 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-indigo opacity-10 rounded-full blur-3xl -mr-10 -mt-10" />
                <div className="flex items-start justify-between mb-8">
                  <Crown className="text-brand-indigo h-10 w-10" />
                  <span className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-500">Privilège Élité</span>
                </div>
                <div className="space-y-4">
                  <p className="text-2xl font-black text-white italic leading-none uppercase tracking-tighter">VISION PASS</p>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest leading-relaxed">Exclusive access to limited edition drops and private studio customizers.</p>
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="px-3 py-1 bg-green-500/10 text-green-400 text-[8px] font-bold uppercase tracking-widest rounded-full">Active Tier</span>
                    <span className="text-[10px] font-mono text-slate-600 uppercase">EXP 2027</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
