import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
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

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: "VISION — Beyond the Visible | Premium Fashion",
  description: "VISION — Beyond the Visible. Explore curated luxury fashion collections designed for those who see beyond the ordinary.",
};

import Navbar from "@/components/Navbar";
import { Inter } from "next/font/google";
import GlobalProviders from "@/components/GlobalProviders";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface-950 text-slate-200 antialiased selection:bg-brand-indigo/30">
        <div className="glow-bg" />
        <GlobalProviders>
          <Navbar />
          <main className="flex-grow relative">{children}</main>
        </GlobalProviders>
        <footer className="bg-surface-950/50 backdrop-blur-md border-t border-white/5 py-16 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              <div className="col-span-1 md:col-span-2">
                <Link href="/" className="flex items-center gap-3 mb-4 group">
                  <svg width="40" height="40" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{filter: 'drop-shadow(0 0 6px rgba(129,140,248,0.5))'}}
                  >
                    <path d="M60 6 L112 60 L60 114 L8 60 Z" stroke="#c7d2fe" strokeWidth="3.5" fill="none" opacity="0.8" />
                    <path d="M34 36 L60 92 L86 36" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M60 6 L34 36" stroke="#e0e7ff" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.8" />
                    <path d="M60 6 L86 36" stroke="#e0e7ff" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.8" />
                    <circle cx="60" cy="6" r="5" fill="white" opacity="0.9" />
                  </svg>
                  <div>
                    <span className="text-2xl font-black tracking-wider text-white uppercase block" style={{fontFamily: 'var(--font-playfair), serif', letterSpacing: '0.15em'}}>VISION</span>
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
