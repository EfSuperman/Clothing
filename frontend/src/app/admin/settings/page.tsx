'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Settings, Percent, Truck, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { FormattedPrice } from '@/components/FormattedPrice';

export default function AdminSettingsPage() {
  const { isAuthenticated, user, token } = useAuthStore();
  const [settings, setSettings] = useState({ taxRate: 0, deliveryFee: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/login');
      return;
    }

    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        setSettings({
          taxRate: Number(data.taxRate),
          deliveryFee: Number(data.deliveryFee)
        });
      } catch (err) {
        console.error('Failed to fetch settings', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [isAuthenticated, user, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await api.patch('/settings', settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Global commerce configurations updated successfully.' });
    } catch (err) {
      console.error('Failed to update settings', err);
      setMessage({ type: 'error', text: 'Failed to synchronize settings with the server.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-surface-950">
        <div className="w-12 h-12 border-4 border-brand-indigo rounded-full border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-12 relative overflow-hidden">
      {/* Background Polish */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-indigo/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-cyan/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-brand-indigo/10 rounded-2xl border border-brand-indigo/20">
              <Settings className="w-8 h-8 text-brand-indigo" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white italic uppercase tracking-widest leading-none">
              GLOBAL <span className="text-brand-indigo">CONFIGURATION</span>
            </h1>
          </div>
          <p className="text-slate-400 text-lg">
            Manage tax rates and logistics fees across the entire vision ecosystem.
          </p>
        </div>

        {message.text && (
          <div className={`mb-8 p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500
            ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Tax Rate Setting */}
            <div className="glass-dark p-8 rounded-[2.5rem] border border-white/10 group hover:border-brand-indigo/30 transition-all duration-500">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-800 rounded-xl">
                    <Percent className="w-5 h-5 text-slate-400" />
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight uppercase tracking-widest">Order Tax</h2>
                </div>
                <span className="text-2xl font-black text-brand-indigo italic">{settings.taxRate}%</span>
              </div>
              
              <div className="space-y-4">
                <label className="block text-[0.65rem] font-mono text-slate-500 uppercase tracking-widest">Configure Rate (%)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  max="100"
                  value={settings.taxRate}
                  onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-indigo/50 transition-all"
                  placeholder="e.g. 16.00"
                />
                <p className="text-[10px] text-slate-500 italic">This percentage will be applied to the order subtotal at checkout.</p>
              </div>
            </div>

            {/* Delivery Fee Setting */}
            <div className="glass-dark p-8 rounded-[2.5rem] border border-white/10 group hover:border-brand-cyan/30 transition-all duration-500">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-800 rounded-xl">
                    <Truck className="w-5 h-5 text-slate-400" />
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight uppercase tracking-widest">Logistics Fee</h2>
                </div>
                <span className="text-2xl font-black text-brand-cyan italic">
                   <FormattedPrice amount={settings.deliveryFee} />
                </span>
              </div>
              
              <div className="space-y-4">
                <label className="block text-[0.65rem] font-mono text-slate-500 uppercase tracking-widest">Base Delivery Price</label>
                <input 
                  type="number" 
                  step="1"
                  min="0"
                  value={settings.deliveryFee}
                  onChange={(e) => setSettings({ ...settings, deliveryFee: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-cyan/50 transition-all"
                  placeholder="e.g. 250"
                />
                <p className="text-[10px] text-slate-500 italic">Fixed price applied to every order regardless of volume.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className={`flex items-center gap-3 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all
                ${saving ? 'bg-slate-800 text-slate-500 cursor-wait' : 'bg-brand-indigo hover:bg-brand-indigo/90 text-white shadow-lg shadow-brand-indigo/20 ring-1 ring-white/10 hover:scale-[1.02]'}`}
            >
              <Save className="w-4 h-4" />
              {saving ? 'Synchronizing...' : 'Save Global Parameters'}
            </button>
          </div>
        </form>

        {/* Live Preview / Hints */}
        <div className="mt-16 p-8 glass rounded-[2.5rem] border border-white/5">
          <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4">Sample Calculation Preview</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-medium">Sample Acquisition</span>
              <span className="text-white font-mono tracking-tighter italic">Rs. 10,000.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-medium">Applied Tax ({settings.taxRate}%)</span>
              <span className="text-brand-indigo font-mono tracking-tighter italic">+ Rs. {(10000 * settings.taxRate / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-medium">Logistic Provisions</span>
              <span className="text-brand-cyan font-mono tracking-tighter italic">+ Rs. {settings.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="pt-4 border-t border-white/5 flex justify-between">
              <span className="text-slate-300 font-bold uppercase tracking-widest text-[0.65rem]">Projected Total</span>
              <span className="text-white text-xl font-black italic tracking-tighter leading-none">Rs. {(10000 + (10000 * settings.taxRate / 100) + settings.deliveryFee).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
