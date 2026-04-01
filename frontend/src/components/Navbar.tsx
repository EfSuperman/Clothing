"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, User, Menu, X, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const { items } = useCartStore();
  const { user, logout } = useAuthStore();

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Categories", href: "/products?filter=categories" },
    ...(user?.role === 'ADMIN' ? [{ name: "Admin", href: "/admin/orders" }] : []),
  ];

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`glass rounded-2xl px-6 py-3 flex items-center justify-between transition-all ${
          scrolled ? "shadow-2xl border-white/10" : "border-white/5"
        }`}>
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="text-2xl font-black tracking-tighter text-white uppercase group-hover:text-brand-indigo transition-colors">
              CLS<span className="text-brand-indigo">.</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-brand-indigo ${
                  pathname === link.href ? "text-brand-indigo" : "text-slate-300"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-5">
            <button className="text-slate-300 hover:text-white transition-colors hidden sm:block">
              <Search size={20} />
            </button>
            
            <Link href="/cart" className="relative group">
              <ShoppingCart size={22} className="text-slate-300 group-hover:text-white transition-colors" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 bg-brand-indigo text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-surface-950"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/orders" className="text-slate-300 hover:text-white transition-colors">
                  <User size={22} />
                </Link>
                <button 
                  onClick={logout}
                  className="text-xs font-semibold uppercase tracking-widest text-slate-400 hover:text-brand-rose transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="bg-brand-indigo hover:bg-brand-indigo/90 text-white text-xs font-bold px-5 py-2 rounded-lg transition-all active:scale-95"
              >
                LOGIN
              </Link>
            )}

            <button 
              className="md:hidden text-slate-300 hover:text-white"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 w-full p-4 z-40"
          >
            <div className="glass rounded-2xl p-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block text-lg font-medium text-slate-300 hover:text-brand-indigo"
                >
                  {link.name}
                </Link>
              ))}
              {!user && (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center bg-brand-indigo text-white py-3 rounded-xl font-bold"
                >
                  LOGIN
                </Link>
              )}
              {user && (
                <Link
                  href="/orders"
                  onClick={() => setIsOpen(false)}
                  className="block text-lg font-medium text-slate-300 hover:text-brand-indigo"
                >
                  My Orders
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
