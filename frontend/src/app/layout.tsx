import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VISION — Beyond the Visible | Premium Fashion",
  description: "VISION — Beyond the Visible. Explore curated luxury fashion collections designed for those who see beyond the ordinary.",
};

import Navbar from "@/components/Navbar";
import { Inter } from "next/font/google";
// Triggering production rebuild to index new Dark Luxury routes.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface-950 text-slate-200 antialiased selection:bg-brand-indigo/30">
        <div className="glow-bg" />
        <Navbar />
        <main className="flex-grow relative">{children}</main>
        <footer className="bg-surface-950/50 backdrop-blur-md border-t border-white/5 py-16 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              <div className="col-span-1 md:col-span-2">
                <Link href="/" className="flex items-center gap-3 mb-4 group">
                  <svg width="36" height="36" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M60 8 L108 60 L60 112 L12 60 Z" stroke="#c7d2fe" strokeWidth="2.5" fill="none" opacity="0.5" />
                    <path d="M36 38 L60 88 L84 38" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M60 8 L36 38" stroke="#e0e7ff" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7" />
                    <path d="M60 8 L84 38" stroke="#e0e7ff" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7" />
                    <circle cx="60" cy="8" r="4" fill="white" opacity="0.8" />
                  </svg>
                  <div>
                    <span className="text-2xl font-black tracking-tighter text-white uppercase block italic">VISION</span>
                    <span className="text-[9px] text-brand-indigo uppercase tracking-[0.3em] font-bold">Beyond the Visible</span>
                  </div>
                </Link>
                <p className="text-slate-500 max-w-sm text-sm leading-relaxed font-medium">
                  Beyond the visible. Our curated collections represent the pinnacle of modern luxury fashion for those who dare to see more.
                </p>
              </div>
              <div>
                <h4 className="text-white font-bold text-xs uppercase tracking-[0.2em] mb-6">Collections</h4>
                <ul className="space-y-3 text-slate-500 text-sm font-medium">
                  <li><Link href="/products" className="hover:text-brand-indigo transition-all duration-300">All Masterpieces</Link></li>
                  <li><Link href="/products?category=Men" className="hover:text-brand-indigo transition-all duration-300">Men's Edit</Link></li>
                  <li><Link href="/products?category=Women" className="hover:text-brand-indigo transition-all duration-300">Women's Edit</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold text-xs uppercase tracking-[0.2em] mb-6">Support</h4>
                <ul className="space-y-3 text-slate-500 text-sm font-medium">
                  <li><Link href="/contact" className="hover:text-brand-indigo transition-all duration-300">Contact Concierge</Link></li>
                  <li><Link href="/faq" className="hover:text-brand-indigo transition-all duration-300">Acquisition FAQ</Link></li>
                  <li><Link href="/shipping" className="hover:text-brand-indigo transition-all duration-300">Shipping Standard</Link></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-white/5 text-center text-slate-500 text-sm">
              <p>&copy; {new Date().getFullYear()} VISION — Beyond the Visible. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
