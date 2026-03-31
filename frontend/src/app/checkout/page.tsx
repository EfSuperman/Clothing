"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { ShieldCheck, Truck, CreditCard, Banknote, UploadCloud, ChevronLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const { isAuthenticated, token, user } = useAuthStore();
  const router = useRouter();

  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "Bank_Transfer">("COD");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const subtotal = getTotal();
  const shipping = subtotal > 150 ? 0 : 25;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-8 px-4 text-center">
        <div className="h-24 w-24 glass rounded-[32px] flex items-center justify-center text-brand-indigo">
          <ShieldCheck size={48} strokeWidth={1} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">SECURE ACCESS REQUIRED.</h2>
          <p className="text-slate-500 font-medium">Please sign in to your account to proceed with secure checkout.</p>
        </div>
        <Link 
          href="/login?redirect=/checkout" 
          className="bg-white text-black px-10 py-5 rounded-2xl font-black text-sm tracking-widest uppercase transition-all hover:scale-105 active:scale-95"
        >
          LOG IN TO CONTINUE
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-8 px-4 text-center">
        <h2 className="text-4xl font-black text-white uppercase tracking-tight">YOUR BAG IS EMPTY.</h2>
        <Link 
          href="/products" 
          className="text-brand-indigo font-bold uppercase tracking-widest hover:underline"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      const orderItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      }));

      formData.append("items", JSON.stringify(orderItems));
      formData.append("paymentMethod", paymentMethod);
      formData.append("shippingAddress", shippingAddress);

      if (paymentMethod === "Bank_Transfer") {
        if (!screenshot) {
          setError("Please upload your payment screenshot to verify the transfer.");
          setLoading(false);
          return;
        }
        formData.append("paymentScreenshot", screenshot);
      }

      await axios.post("http://localhost:5000/api/orders", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      clearCart();
      router.push("/order-success");
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred while processing your order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-16">
          <Link href="/cart" className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest mb-6">
            <ChevronLeft size={14} /> Back to Bag
          </Link>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white uppercase">
            SECURE <span className="text-gradient">CHECKOUT.</span>
          </h1>
        </header>

        <div className="grid lg:grid-cols-12 gap-16 items-start">
          {/* Checkout Form */}
          <div className="lg:col-span-8 space-y-12">
            <form onSubmit={handlePlaceOrder} id="checkout-form" className="space-y-12">
              {/* Shipping Section */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 glass rounded-xl flex items-center justify-center text-brand-indigo">
                    <Truck size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Shipping Information</h2>
                </div>
                
                <div className="glass-dark rounded-[32px] p-8 border border-white/5 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Delivery Address</label>
                    <textarea
                      required
                      placeholder="Street address, apartment, city, and postal code..."
                      className="w-full bg-surface-950/50 border border-white/5 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-brand-indigo/50 transition-all min-h-[120px]"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                    />
                  </div>
                </div>
              </section>

              {/* Payment Section */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 glass rounded-xl flex items-center justify-center text-brand-indigo">
                    <CreditCard size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Payment Method</h2>
                </div>

                <div className="glass-dark rounded-[32px] p-8 border border-white/5 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("COD")}
                      className={`relative flex flex-col items-start p-6 rounded-2xl border transition-all text-left group ${
                        paymentMethod === "COD" 
                          ? "bg-brand-indigo/10 border-brand-indigo/50 text-white" 
                          : "bg-surface-950/50 border-white/5 text-slate-500 hover:border-white/10"
                      }`}
                    >
                      <Banknote className="mb-4" size={24} />
                      <span className="font-bold text-sm uppercase tracking-widest mb-1">Cash on Delivery</span>
                      <span className="text-[10px] opacity-60">Pay when your order arrives.</span>
                      {paymentMethod === "COD" && <CheckCircle2 className="absolute top-4 right-4 text-brand-indigo" size={20} />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("Bank_Transfer")}
                      className={`relative flex flex-col items-start p-6 rounded-2xl border transition-all text-left group ${
                        paymentMethod === "Bank_Transfer" 
                          ? "bg-brand-indigo/10 border-brand-indigo/50 text-white" 
                          : "bg-surface-950/50 border-white/5 text-slate-500 hover:border-white/10"
                      }`}
                    >
                      <CreditCard className="mb-4" size={24} />
                      <span className="font-bold text-sm uppercase tracking-widest mb-1">Direct Bank Transfer</span>
                      <span className="text-[10px] opacity-60">Instant verification via screenshot.</span>
                      {paymentMethod === "Bank_Transfer" && <CheckCircle2 className="absolute top-4 right-4 text-brand-indigo" size={20} />}
                    </button>
                  </div>

                  <AnimatePresence>
                    {paymentMethod === "Bank_Transfer" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-8 bg-surface-950/50 rounded-[24px] border border-white/5 space-y-8 mt-2">
                          <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bank Name</p>
                              <p className="text-sm font-bold text-white">ELITE LUXE BANK</p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Account Number</p>
                              <p className="text-sm font-bold text-white tracking-widest">8829-1992-0012</p>
                            </div>
                          </div>
                          
                          <div className="space-y-4 pt-4 border-t border-white/5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Upload Payment Proof</label>
                            <div className="relative border-2 border-dashed border-white/10 rounded-2xl p-8 hover:border-brand-indigo/30 transition-colors text-center cursor-pointer group">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                              <UploadCloud className="mx-auto mb-4 text-slate-600 group-hover:text-brand-indigo transition-colors" size={32} />
                              <p className="text-sm font-bold text-slate-400">
                                {screenshot ? screenshot.name : "Click or drag your screenshot here"}
                              </p>
                              <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-widest">PNG, JPG up to 5MB</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </section>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 bg-brand-rose/10 border border-brand-rose/20 p-6 rounded-2xl text-brand-rose"
                >
                  <AlertCircle size={24} />
                  <p className="text-sm font-bold uppercase tracking-widest">{error}</p>
                </motion.div>
              )}
            </form>
          </div>

          {/* Sidebar: Summary */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="glass-dark rounded-[40px] p-10 border border-white/5 space-y-10">
              <h2 className="text-2xl font-bold text-white tracking-tight">REVIEW ORDER</h2>
              
              <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center gap-4 py-4 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-surface-900 overflow-hidden border border-white/5">
                        <img src={item.imageURL} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white truncate max-w-[120px]">{item.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-white">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 uppercase font-bold tracking-widest">Subtotal</span>
                  <span className="text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 uppercase font-bold tracking-widest">Shipping</span>
                  <span className="text-white">{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-white/10">
                  <span className="text-lg font-bold text-white uppercase tracking-tighter">Amount Due</span>
                  <span className="text-3xl font-black text-brand-indigo">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={loading}
                className={`w-full py-6 rounded-[20px] font-black text-sm tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3 overflow-hidden ${
                  loading 
                    ? "bg-surface-800 text-slate-500" 
                    : "bg-white text-black hover:scale-[1.02] active:scale-[0.98]"
                } disabled:cursor-not-allowed shadow-[0_20px_40px_-15px_rgba(255,255,255,0.1)]`}
              >
                {loading ? "PROCESSING..." : "COMPLETE PURCHASE"}
              </button>

              <div className="flex items-center justify-center gap-4 text-slate-600 opacity-50">
                <ShieldCheck size={20} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Secure Encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
