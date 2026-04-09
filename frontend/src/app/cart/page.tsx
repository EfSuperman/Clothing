"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import api from "@/lib/api";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FormattedPrice } from "@/components/FormattedPrice";

export default function CartPage() {
  const { items: rawItems, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const items = rawItems.filter(item => item.productId && item.productId !== "undefined");
  const router = useRouter();
  const [globalSettings, setGlobalSettings] = useState({ taxRate: 0, deliveryFee: 0 });

  useEffect(() => {
    const fetchGlobalSettings = async () => {
      try {
        const { data } = await api.get("/settings");
        setGlobalSettings({
          taxRate: Number(data.taxRate),
          deliveryFee: Number(data.deliveryFee)
        });
      } catch (err) {
        console.error("Failed to fetch global settings", err);
      }
    };
    fetchGlobalSettings();
  }, []);

  const subtotal = Number(getTotal() || 0);
  const tax = Number((subtotal * (Number(globalSettings.taxRate || 0) / 100)).toFixed(2));
  const shipping = Number(globalSettings.deliveryFee || 0);
  const total = Number((subtotal + shipping + tax).toFixed(2));

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-10 px-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-brand-indigo/20 blur-3xl rounded-full" />
          <div className="relative h-40 w-40 glass rounded-[40px] flex items-center justify-center text-slate-700">
            <ShoppingBag size={80} strokeWidth={1} />
          </div>
        </motion.div>
        <div className="text-center space-y-4 max-w-sm">
          <h2 className="text-4xl font-black text-white tracking-tight">YOUR BAG IS EMPTY.</h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            Discover our latest collection and elevate your style with our premium pieces.
          </p>
        </div>
        <Link 
          href="/products" 
          className="bg-white text-black px-10 py-5 rounded-2xl font-black text-sm tracking-widest uppercase transition-all hover:scale-105 active:scale-95"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-16">
          <nav className="flex mb-4 text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">
            <Link href="/" className="hover:text-brand-indigo">Home</Link>
            <span className="mx-2 text-white/10">/</span>
            <span className="text-brand-indigo">Your Bag</span>
          </nav>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white uppercase">
            SHOPPING <span className="text-gradient">BAG.</span>
          </h1>
        </header>

        <div className="grid lg:grid-cols-12 gap-16 items-start">
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-8">
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => (
                <motion.div
                  key={`${item.productId}-${item.customDesignUrl || 'std'}-${index}`}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="glass-dark rounded-[32px] p-6 md:p-8 border border-white/5 group"
                >
                  <div className="flex flex-col md:flex-row gap-8">
                    <Link href={`/products/${item.productId}`} className="shrink-0">
                      <div className="h-40 w-40 rounded-2xl overflow-hidden bg-surface-900 border border-white/5">
                        <img
                          src={item.imageURL || "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800"}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                    </Link>

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1 hover:text-brand-indigo transition-colors">
                            <Link href={`/products/${item.productId}`}>{item.name}</Link>
                          </h3>
                          <p className="text-sm font-bold text-brand-indigo uppercase tracking-widest">
                            Premium Selection
                          </p>
                        </div>
                        <p className="text-2xl font-black text-white">
                          <FormattedPrice amount={item.price} />
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-6 pt-6">
                        <div className="flex items-center gap-6 bg-surface-950/50 p-2 rounded-xl border border-white/5">
                          <button
                            onClick={() => updateQuantity(item.productId, item.customDesignUrl, Math.max(1, item.quantity - 1))}
                            className="p-1 hover:text-brand-indigo transition-colors"
                          >
                            <Minus size={18} />
                          </button>
                          <span className="w-8 text-center text-lg font-black">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.customDesignUrl, item.quantity + 1)}
                            className="p-2 hover:text-brand-indigo transition-colors"
                          >
                            <Plus size={18} />
                          </button>
                        </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.productId, item.customDesignUrl)}
                          className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-brand-rose transition-colors uppercase tracking-widest"
                        >
                          <Trash2 size={16} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="glass-dark rounded-[40px] p-10 border border-white/5 space-y-10">
              <h2 className="text-2xl font-bold text-white tracking-tight">ORDER SUMMARY</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-slate-500 uppercase tracking-widest">Subtotal</span>
                  <span className="text-white">
                    <FormattedPrice amount={subtotal} />
                  </span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-slate-500 uppercase tracking-widest">Shipping</span>
                  <span className="text-white">
                    {shipping === 0 ? <span className="text-brand-cyan">FREE</span> : <FormattedPrice amount={shipping} />}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-slate-500 uppercase tracking-widest">Tax</span>
                  <span className="text-white">
                    <FormattedPrice amount={tax} />
                  </span>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between">
                  <span className="text-lg font-bold text-white uppercase tracking-tighter">Total Amount</span>
                  <span className="text-3xl font-black text-brand-indigo">
                    <FormattedPrice amount={total} />
                  </span>
                </div>
                <button
                  onClick={() => router.push("/checkout")}
                  className="w-full py-6 bg-white text-black rounded-2xl font-black text-sm tracking-[0.2em] uppercase transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group"
                >
                  PROCEED TO CHECKOUT <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <Link
                  href="/products"
                  className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest"
                >
                  Continue Shopping <ChevronRight size={14} />
                </Link>

                <button
                  onClick={() => clearCart()}
                  className="w-full py-4 text-[10px] font-bold text-brand-rose/60 hover:text-brand-rose transition-colors uppercase tracking-[0.2em] mt-2"
                >
                  Clear Shopping Bag
                </button>
              </div>

              <div className="pt-6 text-center">
                <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-widest">
                  Secure Checkout Guaranteed <br /> with 256-bit SSL Encryption
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
