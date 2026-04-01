'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function AdminOrdersPage() {
  const { isAuthenticated, user, token } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders', {
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
  }, [isAuthenticated, user, token, router]);

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      await api.patch(
        `/orders/${orderId}/payment-status`,
        { paymentStatus: status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Optimistic update
      setOrders(orders.map(o => o.id === orderId ? { ...o, paymentStatus: status } : o));
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-surface-950">
        <div className="w-12 h-12 border-4 border-brand-indigo rounded-full border-t-transparent animate-spin" />
      </div>
    );
  }

  // Calculate quick stats
  const totalRevenue = orders.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const pendingOrders = orders.filter(o => o.paymentStatus === 'PENDING' || o.paymentStatus === 'Verification_Pending').length;

  return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 italic uppercase tracking-widest leading-none">
            ADMIN <span className="text-brand-indigo">CONCIERGE</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Oversee and authenticate every luxury transaction.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="glass p-8 rounded-3xl border border-white/5 space-y-2">
            <p className="text-[0.65rem] text-slate-500 font-mono tracking-widest uppercase">Cumulative Revenue</p>
            <p className="text-3xl font-black text-white italic tracking-tighter">${totalRevenue.toLocaleString()}</p>
          </div>
          <div className="glass p-8 rounded-3xl border border-white/5 space-y-2">
            <p className="text-[0.65rem] text-slate-500 font-mono tracking-widest uppercase">Pending Attentions</p>
            <p className="text-3xl font-black text-brand-indigo italic tracking-tighter">{pendingOrders}</p>
          </div>
          <div className="glass p-8 rounded-3xl border border-white/5 space-y-2">
            <p className="text-[0.65rem] text-slate-500 font-mono tracking-widest uppercase">Total Acquisitions</p>
            <p className="text-3xl font-black text-white italic tracking-tighter">{orders.length}</p>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-tr from-brand-indigo/10 to-brand-cyan/10 opacity-50 blur-3xl" />
          
          <div className="relative glass-dark rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/5 text-sm">
                <thead>
                  <tr className="bg-white/[0.03]">
                    <th className="px-8 py-6 text-left font-mono text-[0.65rem] text-slate-500 uppercase tracking-widest">Order ID</th>
                    <th className="px-8 py-6 text-left font-mono text-[0.65rem] text-slate-500 uppercase tracking-widest">Client</th>
                    <th className="px-8 py-6 text-left font-mono text-[0.65rem] text-slate-500 uppercase tracking-widest">Method</th>
                    <th className="px-8 py-6 text-left font-mono text-[0.65rem] text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-6 text-left font-mono text-[0.65rem] text-slate-500 uppercase tracking-widest">Proof</th>
                    <th className="px-8 py-6 text-left font-mono text-[0.65rem] text-slate-500 uppercase tracking-widest">Value</th>
                    <th className="px-8 py-6 text-left font-mono text-[0.65rem] text-slate-500 uppercase tracking-widest text-right">Authentication</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-8 py-6 whitespace-nowrap text-white font-mono text-xs">#{order.id.slice(-6)}</td>
                      <td className="px-8 py-6 whitespace-nowrap text-slate-300 italic font-bold">{order.user?.email || 'N/A'}</td>
                      <td className="px-8 py-6 whitespace-nowrap text-slate-400 font-medium">
                        {order.paymentMethod.replace('_', ' ')}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className={`px-4 py-1 rounded-full text-[0.6rem] font-black uppercase tracking-widest
                          ${order.paymentStatus === 'Verified' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                            order.paymentStatus === 'Rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                            'bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/20'}`}>
                          {order.paymentStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        {order.paymentScreenshot ? (
                          <a href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || ''}${order.paymentScreenshot}`} target="_blank" rel="noopener noreferrer" 
                             className="text-brand-indigo hover:text-brand-indigo/80 font-mono text-[0.6rem] uppercase tracking-widest border-b border-brand-indigo/30 pb-0.5">
                            Validate SS
                          </a>
                        ) : (
                          <span className="text-slate-600 font-mono text-[0.6rem] uppercase tracking-widest italic">No Data</span>
                        )}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-white font-black italic tracking-tighter">${order.totalAmount.toFixed(2)}</td>
                      <td className="px-8 py-6 whitespace-nowrap text-right space-x-3">
                        <button 
                          onClick={() => handleStatusUpdate(order.id, 'Verified')} 
                          className="bg-green-500/10 hover:bg-green-500/20 text-green-400 text-[0.6rem] font-black uppercase tracking-widest border border-green-500/20 px-4 py-2 rounded-xl transition-all"
                        >
                          Verify
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(order.id, 'Rejected')} 
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[0.6rem] font-black uppercase tracking-widest border border-red-500/20 px-4 py-2 rounded-xl transition-all"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-8 py-20 text-center text-slate-500 italic">No luxury acquisitions currently pending management.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
