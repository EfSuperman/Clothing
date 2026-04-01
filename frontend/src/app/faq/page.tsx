'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: "What makes your collection 'Luxury'?",
    answer: "Our luxury status is defined by our commitment to exceptional craftsmanship, premium materials (such as high-gram weight cotton and sustainably sourced silks), and exclusive, limited-run designs that prioritize individual style over mass production."
  },
  {
    question: "How long does shipping take?",
    answer: "For domestic orders, shipping typically takes 3-5 business days. International orders can take between 7-14 business days depending on the destination and customs processing."
  },
  {
    question: "What is your return policy?",
    answer: "We offer a 14-day return policy for items in their original, unworn condition with tags attached. Please note that return shipping costs are the responsibility of the customer unless the item is defective."
  },
  {
    question: "How do I care for my garments?",
    answer: "To preserve the longevity of your luxury pieces, we recommend professional dry cleaning. For items that can be laundered at home, use cold water on a delicate cycle and always air dry away from direct sunlight."
  },
  {
    question: "Are your clothes true to size?",
    answer: "Our pieces are designed with a modern, intentional fit. We provide detailed size charts on each product page. If you are between sizes, we recommend sizing up for a more relaxed, contemporary silhouette."
  }
];

export default function FAQPage() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            FREQUENTLY ASKED <span className="text-brand-indigo">QUESTIONS</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Everything you need to know about our luxury experience.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="glass-dark rounded-2xl overflow-hidden border border-white/5 transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <span className="text-lg font-medium text-slate-200">{faq.question}</span>
                <span className={`transform transition-transform duration-300 text-brand-indigo ${activeIndex === index ? 'rotate-180' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div className="px-6 pb-6 text-slate-400 leading-relaxed border-t border-white/5 pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center glass rounded-3xl p-10 border border-white/10">
          <h3 className="text-2xl font-semibold text-white mb-4">Still have questions?</h3>
          <p className="text-slate-400 mb-8">
            Our concierge team is available 24/7 to assist with your inquiries.
          </p>
          <a 
            href="/contact" 
            className="inline-flex items-center px-8 py-3 rounded-full bg-brand-indigo text-white font-medium hover:bg-brand-indigo/80 transition-all duration-300 shadow-lg shadow-brand-indigo/20"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
