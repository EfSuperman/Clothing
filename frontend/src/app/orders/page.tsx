'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { FormattedPrice } from '@/components/FormattedPrice';

export default function OrderHistoryPage() {
  const { isAuthenticated, token } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/my-orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(data);
      } catch (error) {
        console.error('Failed to load orders', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, token, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-surface-950">
        <div className="w-12 h-12 border-4 border-brand-indigo rounded-full border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 italic uppercase tracking-widest">
              ORDER <span className="text-brand-indigo">HISTORY</span>
            </h1>
            <p className="text-slate-400 text-lg">
              Manage and track your luxury acquisitions.
            </p>
          </div>
          <div className="glass px-6 py-3 rounded-2xl border border-white/10">
            <span className="text-slate-500 text-sm mr-2 uppercase tracking-tighter">Account Status</span>
            <span className="text-brand-indigo font-bold">CLIENT ÉLITE</span>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="glass-dark rounded-[2.5rem] py-32 text-center border border-white/5">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-8 text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2 italic">You haven't placed any orders yet.</h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">Your journey into luxury begins with your first selection. Explore our curated collections.</p>
            <a href="/products" className="text-brand-indigo hover:text-brand-indigo/80 font-bold tracking-widest uppercase text-sm border-b-2 border-brand-indigo/30 pb-1">Start Browsing</a>
          </div>
        ) : (
          <div className="space-y-12">
            {orders.map((order) => (
              <div key={order.id} className="relative group">
                {/* Order Glow Effect */}
                <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-tr from-brand-indigo/20 to-brand-cyan/20 opacity-0 group-hover:opacity-100 blur transition-all duration-500" />
                
                <div className="relative glass-dark rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl transition-all duration-500">
                  {/* Order Header */}
                  <div className="bg-white/5 px-8 py-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-1">
                      <p className="text-[0.65rem] text-slate-500 font-mono tracking-widest uppercase">Acquisition ID: {order.id}</p>
                      <h3 className="text-xl font-bold text-white italic tracking-tighter">
                        Purchased on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </h3>
                    </div>
                    <div className="flex flex-row md:items-center gap-6 md:gap-10 mt-4 md:mt-0">
                      <div className="text-left md:text-right">
                        <p className="text-[0.65rem] text-slate-500 font-mono tracking-widest uppercase mb-1">Status</p>
                        <span className={`inline-flex items-center px-4 py-1 rounded-full text-[0.6rem] font-black uppercase tracking-widest leading-none
                          ${order.paymentStatus === 'Verified' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                            order.paymentStatus === 'Rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                            'bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/20'}`}>
                          {order.paymentStatus.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-[0.65rem] text-slate-500 font-mono tracking-widest uppercase mb-1">Total Value</p>
                        <p className="text-2xl font-black text-white italic tracking-tight">
                          <FormattedPrice amount={order.totalAmount || 0} />
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <ul className="px-8 py-4 divide-y divide-white/5">
                    {order.orderItems.map((item: any) => (
                      <li key={item.id} className="py-8 flex items-center justify-between group/item">
                        <div className="flex items-center gap-8">
                          <div className="flex-shrink-0 w-24 h-24 bg-white/5 rounded-3xl overflow-hidden border border-white/10 group-hover/item:scale-105 transition-transform duration-500 shadow-xl">
                            {item.product?.imageURLs?.[0] ? (
                              <img src={item.product.imageURLs[0]} alt={item.product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex justify-center items-center text-[0.6rem] text-slate-600 font-mono uppercase tracking-widest">NO ASSET</div>
                            )}
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-lg font-bold text-white tracking-tight uppercase italic">{item.product?.name || 'Unknown Product'}</h4>
                            <p className="text-[0.7rem] text-slate-500 font-mono tracking-widest uppercase">Qty: {item.quantity} × <FormattedPrice amount={item.priceAtOrder} /></p>
                          </div>
                        </div>
                        <div className="text-xl font-bold text-slate-300 italic tracking-tighter">
                          <FormattedPrice amount={item.priceAtOrder * item.quantity} />
                        </div>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Order Footer Actions */}
                  <div className="px-8 py-6 bg-white/[0.02] border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[0.6rem] text-slate-600 font-mono tracking-widest uppercase">Method: {order.paymentMethod.replace('_', ' ')}</p>
                    <button className="text-[0.7rem] font-black text-brand-indigo uppercase tracking-[0.2em] border border-brand-indigo/30 px-6 py-2 rounded-xl hover:bg-brand-indigo hover:text-white transition-all duration-300 shadow-lg shadow-brand-indigo/10">
                      Request Concierge Support
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
