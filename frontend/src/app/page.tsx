"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { ArrowRight, Star, Shield, Truck, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { FormattedPrice } from "@/components/FormattedPrice";

interface Product {
  id: string;
  name: string;
  price: number;
  imageURLs: string[];
  category: {
    name: string;
  };
}

const CATEGORIES = [
  { name: "Premium Essentials", desc: "Timeless pieces for every wardrobe", image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800", href: "/products?category=Essentials" },
  { name: "Urban Luxe", desc: "Contemporary styles for the city", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800", href: "/products?category=Urban" },
  { name: "Elevated Sport", desc: "Where performance meets style", image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&q=80&w=800", href: "/products?category=Sport" },
];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        const { data } = await api.get("/products");
        setFeaturedProducts(data.slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestProducts();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image/Gradient */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-surface-950/20 via-surface-950/60 to-surface-950 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000" 
            alt="Hero Background"
            className="w-full h-full object-cover scale-105"
          />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-[10px] font-bold tracking-[0.2em] uppercase bg-brand-indigo/20 text-brand-indigo border border-brand-indigo/30 rounded-full backdrop-blur-md">
              New Collection 2026
            </span>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter text-white mb-8 leading-[0.9]">
              THE FUTURE OF <br />
              <span className="text-gradient">ELEVATED STYLE.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 mb-10 font-medium">
              Experience the intersection of high-end craftsmanship and modern visionary design. Redefining what it means to be well-dressed.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link
                href="/products"
                className="group relative px-10 py-5 bg-white text-black font-bold rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95"
              >
                <span className="relative z-10 flex items-center gap-2">
                  EXPLORE SHOP <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link
                href="/products?filter=new-arrivals"
                className="px-10 py-5 glass-dark text-white font-bold rounded-2xl border border-white/10 hover:bg-white/10 transition-all active:scale-95"
              >
                NEW ARRIVALS
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Categories Grid */}
      <section className="py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group relative h-[500px] rounded-3xl overflow-hidden cursor-pointer"
            >
              <img src={cat.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={cat.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/20 to-transparent opacity-80" />
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <h3 className="text-2xl font-bold text-white mb-2">{cat.name}</h3>
                <p className="text-slate-400 text-sm mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{cat.desc}</p>
                <Link href={cat.href} className="text-xs font-bold text-white flex items-center gap-2 tracking-widest uppercase">
                  Discover Now <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Discoveries */}
      <section className="py-32 bg-surface-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="max-w-xl text-left">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-white mb-4">
                THE CURATED LIST.
              </h2>
              <p className="text-slate-400 font-medium">
                Our design team identifies the absolute must-have pieces of the season. Limited drops, exceptional quality.
              </p>
            </div>
            <Link href="/products" className="group flex items-center gap-3 text-xs font-bold text-brand-indigo tracking-[0.2em] uppercase">
              View Collection <span className="h-0.5 w-12 bg-brand-indigo/30 group-hover:w-20 transition-all duration-300" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse bg-surface-800 rounded-3xl h-[400px]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  whileHover={{ y: -10 }}
                  className="product-card group relative"
                >
                  <Link href={`/products/${product.id}`} className="block">
                    <div className="relative aspect-[3/4] mb-6 rounded-3xl overflow-hidden bg-surface-800">
                      <img
                        src={product.imageURLs[0] || "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800"}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="glass-dark px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                          {product.category?.name || "Premium"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-white group-hover:text-brand-indigo transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-black text-white">
                          <FormattedPrice amount={product.price} />
                        </p>
                        <div className="flex items-center text-brand-indigo">
                          <Star size={12} fill="currentColor" />
                          <span className="ml-1 text-[10px] font-bold text-slate-400">4.9 (120)</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-24 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-center items-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 bg-brand-indigo/10 rounded-2xl flex items-center justify-center text-brand-indigo">
                <Shield size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Secure Payments</h4>
                <p className="text-xs text-slate-500">100% Secure Checkout</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 bg-brand-cyan/10 rounded-2xl flex items-center justify-center text-brand-cyan">
                <Truck size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Fast Shipping</h4>
                <p className="text-xs text-slate-500">Free over <FormattedPrice amount={150} /></p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 bg-brand-rose/10 rounded-2xl flex items-center justify-center text-brand-rose">
                <Zap size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Instant Support</h4>
                <p className="text-xs text-slate-500">24/7 Expert Help</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 bg-brand-indigo/10 rounded-2xl flex items-center justify-center text-brand-indigo">
                <Star size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Quality Guarantee</h4>
                <p className="text-xs text-slate-500">30 Day Returns</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
