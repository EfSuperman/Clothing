'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDecalsPage() {
  const { isAuthenticated, user, token } = useAuthStore();
  const router = useRouter();

  const [decals, setDecals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{ name: string; image: File | null }>({
    name: '',
    image: null,
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const res = await api.get('/decals');
        setDecals(res.data);
      } catch (error) {
        console.error('Failed to load decals', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', image: null });
    setIsFormOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this decal from the collection?')) return;
    try {
      await api.delete(`/decals/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setDecals(decals.filter(d => d.id !== id));
    } catch (error) {
      alert('Failed to delete decal');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      if (formData.image) payload.append('image', formData.image);

      const { data } = await api.post('/decals', payload, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });
      setDecals([data, ...decals]);
      alert('Decal uploaded successfully');
      resetForm();
    } catch (error) {
      console.error(error);
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading && decals.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-surface-950">
        <div className="w-12 h-12 border-4 border-brand-indigo rounded-full border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 italic uppercase tracking-widest leading-none">
              DECAL <span className="text-brand-indigo">STUDIO</span>
            </h1>
            <p className="text-slate-400 text-lg">Manage dynamic 3D customizer artwork.</p>
          </div>
          <button 
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5"
          >
            {isFormOpen ? <><X size={16} /> CLOSE STUDIO</> : <><Plus size={16} /> NEW ARTWORK</>}
          </button>
        </div>

        {/* Add Form Overlay */}
        <AnimatePresence>
          {isFormOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-16"
            >
              <div className="glass-dark p-8 md:p-12 rounded-[2.5rem] border border-white/10 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-10 italic tracking-tight flex items-center gap-3">
                  DEFINING NEW ARTWORK
                  <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                </h2>
                
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="relative">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-4 mb-2 block">Artwork Title</label>
                      <input 
                        required name="name" value={formData.name} onChange={handleInputChange}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-brand-indigo transition-all outline-none" 
                        placeholder="e.g. Chrome Skull"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-4 mb-2 block">Upload Visual Asset</label>
                      <div className="relative">
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input 
                          required name="image" type="file" accept="image/*" onChange={handleFileChange}
                          className="w-full bg-white/5 border border-white/5 rounded-2xl pl-10 pr-6 py-4 text-white focus:border-brand-indigo transition-all outline-none text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-brand-indigo file:text-white" 
                        />
                      </div>
                    </div>
                    <div className="pt-2">
                       <button 
                        type="submit" disabled={loading}
                        className="w-full py-5 bg-brand-indigo text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-brand-indigo/90 transition-all shadow-xl shadow-brand-indigo/20 flex items-center justify-center gap-3"
                      >
                        {loading ? 'SYNCHRONIZING...' : 'ADD TO CUSTOMIZER'}
                      </button>
                      <button 
                        type="button" onClick={resetForm}
                        className="w-full mt-4 py-4 text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
                      >
                        Discard Changes
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decals Table */}
        <div className="relative group">
          <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-tr from-brand-indigo/5 to-brand-cyan/5 blur-3xl opacity-50" />
          <div className="relative glass-dark rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
            <div className="overflow-x-auto w-full">
              <table className="min-w-[800px] w-full divide-y divide-white/5">
                <thead>
                  <tr className="bg-white/[0.03]">
                    <th className="px-8 py-6 text-left font-mono text-[0.65rem] text-slate-500 uppercase tracking-widest">Artwork</th>
                    <th className="px-8 py-6 text-left font-mono text-[0.65rem] text-slate-500 uppercase tracking-widest">Added Date</th>
                    <th className="px-8 py-6 text-right font-mono text-[0.65rem] text-slate-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {decals.map((decal) => (
                    <tr key={decal.id} className="group/row hover:bg-white/[0.01] transition-all">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-white/5 rounded-xl overflow-hidden border border-white/10 p-2 flex items-center justify-center">
                            {decal.imageUrl && <img src={decal.imageUrl} className="max-w-full max-h-full object-contain" alt={decal.name} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white italic tracking-tight">{decal.name}</p>
                            <p className="text-[0.6rem] text-slate-500 font-mono uppercase tracking-widest">ID: {decal.id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-slate-300 font-mono text-xs">
                        {new Date(decal.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-right space-x-3">
                        <button 
                          onClick={() => handleDelete(decal.id)}
                          className="p-3 text-slate-500 hover:text-brand-rose hover:bg-brand-rose/5 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {decals.length === 0 && (
                     <tr>
                        <td colSpan={3} className="px-8 py-10 text-center text-slate-500 italic text-sm">
                           No custom decals uploaded yet.
                        </td>
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
