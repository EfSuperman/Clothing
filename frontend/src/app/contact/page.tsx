'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          {/* Left Side: Contact Information */}
          <div className="space-y-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
                CONNECT <span className="text-brand-indigo">WITH US</span>
              </h1>
              <p className="text-slate-400 text-lg max-w-lg mb-12">
                Our concierge is available 24/7 to assist you with inquiries regarding our collections, orders, or a custom experience.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 rounded-2xl bg-brand-indigo/10 flex items-center justify-center text-brand-indigo group-hover:bg-brand-indigo/20 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">Email Concierge</h4>
                  <p className="text-slate-400">concierge@clothing-store.com</p>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 rounded-2xl bg-brand-indigo/10 flex items-center justify-center text-brand-indigo group-hover:bg-brand-indigo/20 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">Global HQ</h4>
                  <p className="text-slate-400">123 Luxury Lane, Beverly Hills, CA 90210</p>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 rounded-2xl bg-brand-indigo/10 flex items-center justify-center text-brand-indigo group-hover:bg-brand-indigo/20 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">Live Concierge</h4>
                  <p className="text-slate-400">+1 (800) LUX-COUTURE</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Contact Form */}
          <div className="relative">
            <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-tr from-brand-indigo to-brand-cyan opacity-20 blur-xl" />
            
            <div className="relative glass-dark rounded-[2.5rem] p-10 md:p-12 border border-white/10">
              {isSuccess ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mx-auto mb-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4 italic uppercase tracking-widest">Inquiry Received</h2>
                  <p className="text-slate-400">Our team will reach out to you within 24 hours.</p>
                  <button 
                    onClick={() => setIsSuccess(false)}
                    className="mt-8 text-brand-indigo hover:text-brand-indigo/80 font-medium"
                  >
                    Send another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-300 ml-2">Name</label>
                      <input 
                        required
                        type="text" 
                        placeholder="Your full name"
                        className="w-full bg-surface-900 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-1 focus:ring-brand-indigo transition-all placeholder:text-slate-600" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-300 ml-2">Email</label>
                      <input 
                        required
                        type="email" 
                        placeholder="you@luxury.com"
                        className="w-full bg-surface-900 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-1 focus:ring-brand-indigo transition-all placeholder:text-slate-600" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300 ml-2">Subject</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Order Inquiry"
                      className="w-full bg-surface-900 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-1 focus:ring-brand-indigo transition-all placeholder:text-slate-600" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300 ml-2">Inquiry</label>
                    <textarea 
                      required
                      rows={5}
                      placeholder="How can our concierge assist you?"
                      className="w-full bg-surface-900 border border-white/5 rounded-2xl px-8 py-5 text-white focus:outline-none focus:ring-1 focus:ring-brand-indigo transition-all placeholder:text-slate-600 resize-none" 
                    />
                  </div>

                  <button 
                    disabled={isSubmitting}
                    className="w-full bg-brand-indigo hover:bg-brand-indigo/80 disabled:opacity-50 text-white font-bold py-5 rounded-2xl transition-all duration-300 shadow-xl shadow-brand-indigo/20 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        SENDING...
                      </>
                    ) : 'SEND INQUIRY'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
