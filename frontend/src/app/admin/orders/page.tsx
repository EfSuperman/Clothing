'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Trash2, ExternalLink, ShieldCheck } from 'lucide-react';

export default function AdminOrdersPage() {
  const { isAuthenticated, user, token } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
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
    if (processingOrderId) return;
    setProcessingOrderId(orderId);
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
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Are you certain you wish to purge this acquisition record? This action is irreversible.')) return;
    
    setProcessingOrderId(orderId);
    try {
      await api.delete(`/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(orders.filter(o => o.id !== orderId));
    } catch (err) {
      console.error('Failed to delete order:', err);
      alert('Failed to delete order. Please try again.');
    } finally {
      setProcessingOrderId(null);
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
  const totalRevenue = orders.reduce((acc, curr) => acc + Number(curr.totalAmount || 0), 0);
  const totalProfit = orders.reduce((acc, curr) => acc + Number(curr.profitAmount || 0), 0);
  const totalDeliveryFees = orders.reduce((acc, curr) => acc + Number(curr.shippingAmount || 0), 0);
  const pendingOrders = orders.filter(o => o.paymentStatus === 'PENDING' || o.paymentStatus === 'Verification_Pending').length;

  return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-12 relative overflow-hidden">
      <div className="max-w-full mx-auto">
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 italic uppercase tracking-widest leading-none">
            ADMIN <span className="text-brand-indigo">CONCIERGE</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Oversee and authenticate every luxury transaction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="glass p-6 rounded-3xl border border-white/5 space-y-1">
            <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">Cumulative Revenue</p>
            <p className="text-2xl font-black text-white italic tracking-tighter">Rs. {totalRevenue.toLocaleString()}</p>
          </div>
          <div className="glass p-6 rounded-3xl border border-brand-indigo/20 bg-brand-indigo/5 space-y-1 group hover:border-brand-indigo/40 transition-all">
            <p className="text-xs text-brand-indigo font-mono tracking-widest uppercase">Net Profit (Curation)</p>
            <p className="text-2xl font-black text-white italic tracking-tighter">Rs. {totalProfit.toLocaleString()}</p>
          </div>
          <div className="glass p-6 rounded-3xl border border-white/5 space-y-1">
            <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">Logistics Pool</p>
            <p className="text-2xl font-black text-white italic tracking-tighter">Rs. {totalDeliveryFees.toLocaleString()}</p>
          </div>
          <div className="glass p-6 rounded-3xl border border-white/5 space-y-1">
            <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">Pending Attentions</p>
            <p className="text-2xl font-black text-brand-indigo italic tracking-tighter">{pendingOrders}</p>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-tr from-brand-indigo/10 to-brand-cyan/10 opacity-50 blur-3xl" />
          
          <div className="relative glass-dark rounded-[2.5rem] border border-white/10 shadow-2xl overflow-x-auto">
            <table className="w-full divide-y divide-white/5">
              <thead>
                <tr className="bg-white/[0.03]">
                  <th className="px-5 py-5 text-left font-mono text-xs text-slate-400 uppercase tracking-wider">Order ID</th>
                  <th className="px-5 py-5 text-left font-mono text-xs text-slate-400 uppercase tracking-wider">Client</th>
                  <th className="px-5 py-5 text-left font-mono text-xs text-slate-400 uppercase tracking-wider">Phone</th>
                  <th className="px-5 py-5 text-left font-mono text-xs text-slate-400 uppercase tracking-wider">Method</th>
                  <th className="px-5 py-5 text-left font-mono text-xs text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-5 text-left font-mono text-xs text-slate-400 uppercase tracking-wider">Proof</th>
                  <th className="px-5 py-5 text-right font-mono text-xs text-slate-400 uppercase tracking-wider">Value</th>
                  <th className="px-5 py-5 text-center font-mono text-xs text-slate-400 uppercase tracking-wider min-w-[200px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Order ID */}
                    <td className="px-5 py-5 whitespace-nowrap text-white font-mono text-sm font-semibold">#{order.id.slice(-6)}</td>
                    
                    {/* Client */}
                    <td className="px-5 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-200 font-bold text-sm">{order.user?.name || 'Guest'}</span>
                        <span className="text-xs text-slate-500">{order.user?.email || 'N/A'}</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {order.orderItems?.map((item: any) => (
                            <span key={item.id} className="text-[11px] bg-white/5 px-2 py-0.5 rounded text-slate-400">
                              {item.product?.name || 'Item'} ×{item.quantity}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    
                    {/* Phone */}
                    <td className="px-5 py-5 whitespace-nowrap text-brand-indigo font-bold text-sm">
                      {order.shippingAddress?.phone || order.user?.phone || 'N/A'}
                    </td>
                    
                    {/* Method */}
                    <td className="px-5 py-5 whitespace-nowrap text-slate-300 font-medium text-sm">
                      {order.paymentMethod.replace('_', ' ')}
                    </td>
                    
                    {/* Status */}
                    <td className="px-5 py-5 whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                        ${order.paymentStatus === 'VERIFIED' || order.paymentStatus === 'APPROVED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                          order.paymentStatus === 'FAILED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                          'bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/20'}`}>
                        {order.paymentStatus.replace('_', ' ')}
                      </span>
                    </td>
                    
                    {/* Proof */}
                    <td className="px-5 py-5 whitespace-nowrap">
                      {order.paymentScreenshot ? (
                        <a href={order.paymentScreenshot.startsWith('http') ? order.paymentScreenshot : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || ''}${order.paymentScreenshot}`} target="_blank" rel="noopener noreferrer" 
                           className="inline-flex items-center gap-1 text-brand-indigo hover:text-brand-indigo/80 text-xs font-bold uppercase tracking-wider border-b border-brand-indigo/30 pb-0.5">
                          <ExternalLink size={12} /> View
                        </a>
                      ) : (
                        <span className="text-slate-600 text-xs italic">No Data</span>
                      )}
                    </td>
                    
                    {/* Value */}
                    <td className="px-5 py-5 whitespace-nowrap text-right">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-white font-black text-base">
                          Rs. {Number(order.totalAmount || 0).toLocaleString()}
                        </span>
                        <span className="text-[11px] text-brand-indigo font-bold">
                          Profit: Rs. {Number(order.profitAmount || 0).toLocaleString()}
                        </span>
                        {(Number(order.taxAmount) > 0 || Number(order.shippingAmount) > 0) && (
                          <span className="text-[11px] text-slate-500">
                            Tax: Rs. {Number(order.taxAmount).toFixed(0)} | Ship: Rs. {Number(order.shippingAmount).toFixed(0)}
                          </span>
                        )}
                      </div>
                    </td>
                    
                    {/* Actions */}
                    <td className="px-5 py-5 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          disabled={processingOrderId === order.id || order.paymentStatus === 'VERIFIED' || order.paymentStatus === 'APPROVED' || order.paymentStatus === 'FAILED'}
                          onClick={() => handleStatusUpdate(order.id, order.paymentMethod === 'COD' ? 'APPROVED' : 'VERIFIED')} 
                          className={`text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg transition-all border
                            ${(order.paymentStatus === 'VERIFIED' || order.paymentStatus === 'APPROVED' || order.paymentStatus === 'FAILED') ? 'opacity-20 cursor-not-allowed bg-slate-500/10 text-slate-500 border-slate-500/10' : 
                              processingOrderId === order.id ? 'opacity-50 cursor-wait bg-slate-500/10 text-slate-400 border-slate-500/20' : 
                              'bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/20'}`}
                        >
                          {order.paymentMethod === 'COD' ? 'Approve' : 'Verify'}
                        </button>
                        <button 
                          disabled={processingOrderId === order.id || order.paymentStatus === 'VERIFIED' || order.paymentStatus === 'APPROVED' || order.paymentStatus === 'FAILED'}
                          onClick={() => handleStatusUpdate(order.id, 'FAILED')} 
                          className={`text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg transition-all border
                            ${(order.paymentStatus === 'VERIFIED' || order.paymentStatus === 'APPROVED' || order.paymentStatus === 'FAILED') ? 'opacity-20 cursor-not-allowed bg-slate-500/10 text-slate-500 border-slate-500/10' : 
                              processingOrderId === order.id ? 'opacity-50 bg-slate-500/10 text-slate-400 border-slate-500/20' : 
                              'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'}`}
                        >
                          Reject
                        </button>
                        <button 
                          disabled={processingOrderId === order.id}
                          onClick={() => handleDeleteOrder(order.id)} 
                          className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Delete Order"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-8 py-20 text-center text-slate-500 text-sm italic">No orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
