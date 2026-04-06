"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { ArrowLeft, ShoppingCart, Check, Shield, Truck, RotateCcw, Minus, Plus, CreditCard } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { FormattedPrice } from "@/components/FormattedPrice";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQty: number;
  imageURLs: string[];
  category: {
    name: string;
  };
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [showCheckoutBtn, setShowCheckoutBtn] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
      } catch (err: any) {
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    setAdding(true);
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      imageURL: product.imageURLs[0] || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800",
    });
    
    setTimeout(() => {
      setAdding(false);
      setShowCheckoutBtn(true);
    }, 1200);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
            <div className="aspect-[3/4] bg-surface-900 rounded-3xl" />
            <div className="space-y-8">
              <div className="h-12 w-3/4 bg-surface-900 rounded-2xl" />
              <div className="h-4 w-1/4 bg-surface-900 rounded-lg" />
              <div className="h-24 w-full bg-surface-900 rounded-2xl" />
              <div className="h-16 w-full bg-surface-900 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-black text-white mb-2">PRODUCT NOT FOUND</h2>
          <p className="text-slate-500">The item you're looking for might have moved or is unavailable.</p>
        </div>
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-bold text-brand-indigo tracking-widest uppercase hover:underline"
        >
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex mb-12 text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">
          <Link href="/" className="hover:text-brand-indigo">Home</Link>
          <span className="mx-2 text-white/10">/</span>
          <Link href="/products" className="hover:text-brand-indigo">Collections</Link>
          <span className="mx-2 text-white/10">/</span>
          <span className="text-brand-indigo">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left: Gallery */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-[3/4] rounded-[40px] overflow-hidden bg-surface-900 border border-white/5 shadow-2xl"
            >
              <img
                src={product.imageURLs[selectedImage] || "https://via.placeholder.com/800"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-6 left-6">
                <span className="glass-dark px-4 py-1.5 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
                  {product.category?.name || "Original Wear"}
                </span>
              </div>
            </motion.div>
            
            {product.imageURLs.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.imageURLs.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                      selectedImage === i ? "border-brand-indigo shadow-lg shadow-brand-indigo/20" : "border-transparent opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img src={url} className="w-full h-full object-cover" alt={`${product.name} view ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-4 leading-none">
                  {product.name}
                </h1>
                <div className="flex items-center gap-6">
                  <p className="text-4xl font-black text-brand-indigo">
                    <FormattedPrice amount={product.price} />
                  </p>
                  <div className="h-6 w-[1px] bg-white/10" />
                  <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${
                    product.stockQty > 0 ? "text-brand-cyan" : "text-brand-rose"
                  }`}>
                    <span className={`w-2 h-2 rounded-full pulse ${
                      product.stockQty > 0 ? "bg-brand-cyan shadow-[0_0_8px_rgba(34,211,238,0.5)]" : "bg-brand-rose"
                    }`} />
                    {product.stockQty > 0 ? `In Stock (Only ${product.stockQty} left)` : "Waitlisted"}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] opacity-50">Description</h3>
                <p className="text-lg text-slate-400 leading-relaxed font-medium">
                  {product.description || "Crafted with precision and designed for impact. This exclusive piece embodies our commitment to quality materials and modern aesthetics."}
                </p>
              </div>

              {/* Interaction Block */}
              <div className="glass-dark p-8 rounded-[32px] border border-white/5 space-y-8">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-widest">Quantity</span>
                  <div className="flex items-center gap-6 bg-surface-950/50 p-2 rounded-2xl border border-white/5">
                    <button 
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="p-2 hover:text-brand-indigo transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus size={18} />
                    </button>
                    <span className="w-8 text-center text-xl font-black">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(prev => Math.min(product.stockQty, prev + 1))}
                      className="p-2 hover:text-brand-indigo transition-colors"
                      disabled={quantity >= product.stockQty}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stockQty <= 0 || adding}
                    className={`group relative w-full py-6 rounded-[20px] font-black text-sm tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3 overflow-hidden ${
                      adding 
                        ? "bg-brand-cyan text-surface-950" 
                        : "bg-white text-black hover:scale-[1.02] active:scale-[0.98]"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <AnimatePresence mode="wait">
                      {adding ? (
                        <motion.div
                          key="added"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2"
                        >
                          <Check size={20} /> ADDED TO CART
                        </motion.div>
                      ) : (
                        <motion.div
                          key="idle"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2"
                        >
                          <ShoppingCart size={20} /> ADD TO BAG
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>

                  <AnimatePresence>
                    {(showCheckoutBtn || items.length > 0) && (
                      <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        onClick={() => router.push("/checkout")}
                        className="w-full py-5 rounded-[20px] bg-brand-indigo text-white font-black text-sm tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3 hover:bg-brand-indigo/90 active:scale-95 shadow-xl shadow-brand-indigo/20 border border-white/10"
                      >
                        <CreditCard size={18} /> PROCEED TO CHECKOUT
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 glass rounded-xl flex items-center justify-center text-brand-indigo">
                    <Truck size={18} />
                  </div>
                  <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Fast Shipping</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 glass rounded-xl flex items-center justify-center text-brand-indigo">
                    <RotateCcw size={18} />
                  </div>
                  <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Easy Returns</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 glass rounded-xl flex items-center justify-center text-brand-indigo">
                    <Shield size={18} />
                  </div>
                  <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Secure Checkout</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
