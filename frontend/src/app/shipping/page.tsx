'use client';

import { motion } from 'framer-motion';

const shippingPolicy = [
  {
    title: "Global Reach, Localized Care",
    description: "We ship to over 50 countries worldwide, ensuring that our luxury essentials reach even the most remote corners of the globe with dedicated concierge support."
  },
  {
    title: "Standard Shipping",
    description: "Domestic shipping within 3-5 business days. Experience peace of mind with full end-to-end tracking for every order."
  },
  {
    title: "Expedited Service",
    description: "For those who require excellence immediately, we offer expedited 2-day shipping options at a premium rate."
  },
  {
    title: "Sustainable Packaging",
    description: "Every item is meticulously packed in eco-friendly, recycled, and biodegradable materials that reflect our commitment to the planet as much as our quality."
  }
];

export default function ShippingPage() {
  return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
            SHIPPING <span className="text-brand-indigo">& DELIVERY</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Experience the standard of excellence with our worldwide logistics and premium handling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          {shippingPolicy.map((policy, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass p-8 rounded-3xl border border-white/5 hover:border-brand-indigo/30 transition-all duration-300"
            >
              <h3 className="text-xl font-bold text-white mb-4">{policy.title}</h3>
              <p className="text-slate-400 leading-relaxed">
                {policy.description}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="glass-dark rounded-[2.5rem] p-10 md:p-16 border border-white/5 bg-gradient-to-br from-surface-950/50 to-brand-indigo/5">
          <h2 className="text-3xl font-bold text-white mb-8 text-center italic">Tracking Your Legacy</h2>
          <div className="space-y-8 max-w-3xl mx-auto">
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-2xl bg-brand-indigo/20 flex items-center justify-center flex-shrink-0 text-brand-indigo">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-slate-200">Processing Time</h4>
                <p className="text-slate-400">Order verification and processing typically takes 24-48 hours. You will receive a confirmation email once your journey begins.</p>
              </div>
            </div>
            
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-2xl bg-brand-indigo/20 flex items-center justify-center flex-shrink-0 text-brand-indigo">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-slate-200">International Customs</h4>
                <p className="text-slate-400">Please note that international orders may be subject to local taxes and duties upon entry to your country. These are not included in the checkout price.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24 text-center">
          <p className="text-slate-500 text-sm">
            Questions regarding an existing delivery? <a href="/contact" className="text-brand-indigo hover:underline decoration-brand-indigo/30 underline-offset-4">Track Here</a>
          </p>
        </div>
      </div>
    </div>
  );
}
