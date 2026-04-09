"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Search, SlidersHorizontal, Filter, X, ChevronDown, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategory, setActiveCategory] = useState<{id: string, name: string} | null>(null);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append("search", searchTerm);
        if (activeCategory) params.append("categoryId", activeCategory.id);
        
        const queryString = params.toString();
        const url = queryString ? `/products?${queryString}` : "/products";

        const { data } = await api.get(url);
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchProducts, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, activeCategory]);

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Controls */}
        <div className="space-y-8 mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <nav className="flex mb-4 text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">
                <Link href="/" className="hover:text-brand-indigo">Home</Link>
                <span className="mx-2 text-white/20">/</span>
                <span className="text-brand-indigo">Collections</span>
              </nav>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white">
                ALL <span className="text-gradient">PRODUCTS.</span>
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 w-full md:w-auto">
              <div className="relative group flex-1 md:w-80">
                <input
                  type="text"
                  placeholder="Search collections..."
                  className="w-full bg-surface-900 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-brand-indigo/50 transition-all group-hover:border-white/10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-indigo transition-colors" size={18} />
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-4 rounded-2xl border transition-all ${
                  showFilters || activeCategory
                    ? "bg-brand-indigo/10 border-brand-indigo text-brand-indigo" 
                    : "bg-surface-900 border-white/5 text-slate-400 hover:border-white/10"
                }`}
              >
                <SlidersHorizontal size={20} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all ${
                !activeCategory
                  ? "bg-brand-indigo text-white shadow-lg shadow-brand-indigo/20"
                  : "bg-surface-900 text-slate-400 border border-white/5 hover:border-white/10 hover:text-white"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all ${
                  activeCategory?.id === cat.id
                    ? "bg-brand-indigo text-white shadow-lg shadow-brand-indigo/20"
                    : "bg-surface-900 text-slate-400 border border-white/5 hover:border-white/10 hover:text-white"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results Grid */}
        <div className="relative">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="animate-pulse space-y-4">
                  <div className="aspect-[3/4] bg-surface-900 rounded-3xl" />
                  <div className="h-4 w-2/3 bg-surface-900 rounded-lg" />
                  <div className="h-4 w-1/3 bg-surface-900 rounded-lg" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-40 text-center space-y-6">
              <div className="mx-auto w-20 h-20 rounded-full bg-surface-900 flex items-center justify-center text-slate-600 border border-white/5">
                <Search size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">No items match your search</h3>
                <p className="text-slate-500">Try adjusting your filters or search terms.</p>
              </div>
              <button 
                onClick={() => { setSearchTerm(""); setActiveCategory(null); }}
                className="text-sm font-bold text-brand-indigo uppercase tracking-widest hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {products.map((product, i) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="product-card group relative"
                  >
                    <Link href={`/products/${product.id}`} className="block">
                      <div className="relative aspect-[3/4] mb-6 rounded-3xl overflow-hidden bg-surface-900 border border-white/5">
                        <img
                          src={product.imageURLs[1] || product.imageURLs[0] || "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800"}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="glass-dark px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                            {product.category?.name || "Premium"}
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-surface-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                          <span className="w-full py-3 bg-white text-black text-center text-xs font-black uppercase rounded-xl tracking-widest">
                            Quick View
                          </span>
                        </div>
                      </div>
                      <div className="px-1 space-y-1">
                        <h3 className="text-base font-bold text-white group-hover:text-brand-indigo transition-colors truncate">
                          {product.name}
                        </h3>
                        <p className="text-lg font-black text-white">
                          <FormattedPrice amount={product.price} />
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
