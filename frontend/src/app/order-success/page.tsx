"use client";

import Link from "next/link";
import { CheckCircle2, ShoppingBag, ArrowRight, Package, Ticket } from "lucide-react";
import { useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { motion } from "framer-motion";

export default function OrderSuccessPage() {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    // Clear the cart when the user reaches the success page
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <div className="relative max-w-2xl w-full">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-brand-indigo/10 blur-[120px] rounded-full -z-10" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-dark rounded-[48px] border border-white/5 p-10 md:p-16 text-center"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, delay: 0.2 }}
            className="flex justify-center mb-10"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-brand-cyan/20 blur-2xl rounded-full" />
              <div className="relative bg-brand-cyan/10 p-6 rounded-[32px] text-brand-cyan border border-brand-cyan/20">
                <CheckCircle2 size={64} strokeWidth={1} />
              </div>
            </div>
          </motion.div>

          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-4">
              ORDER <span className="text-gradient">CONFIRMED.</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-md mx-auto">
              Your elite selection is being prepared for shipment. You will receive a notification once your package leaves our facility.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="glass p-6 rounded-3xl border border-white/5 text-left flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-brand-indigo/10 flex items-center justify-center text-brand-indigo">
                <Package size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Track Order</p>
                <p className="text-xs font-bold text-white">Via your Dashboard</p>
              </div>
            </div>
            <div className="glass p-6 rounded-3xl border border-white/5 text-left flex items-start gap-4 text-brand-cyan/80">
              <div className="h-10 w-10 rounded-xl bg-brand-cyan/10 flex items-center justify-center text-brand-cyan">
                <Ticket size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Confirmation</p>
                <p className="text-xs font-bold text-white">Sent to your email</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/products"
              className="w-full sm:w-auto px-10 py-5 bg-white text-black rounded-2xl font-black text-sm tracking-widest uppercase transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group"
            >
              <ShoppingBag size={18} /> Continue Shopping
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-10 py-5 glass-dark text-slate-300 rounded-2xl font-black text-sm tracking-widest uppercase border border-white/10 transition-all hover:bg-white/5 active:scale-95 flex items-center justify-center gap-2"
            >
              Dashboard <ArrowRight size={18} />
            </Link>
          </div>

          <div className="mt-12 pt-10 border-t border-white/5 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] leading-relaxed">
            If you selected Bank Transfer, please ensure your proof of <br /> payment was uploaded during checkout.
          </div>
        </motion.div>
      </div>
    </div>
  );
}
