'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Trash2, Edit2, Plus, X, Layers, ChevronRight, Folder } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminCategoriesPage() {
  const { isAuthenticated, user, token } = useAuthStore();
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    parentId: '',
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/login');
      return;
    }
    fetchCategories();
  }, [isAuthenticated, user, router]);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', parentId: '' });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (cat: any) => {
    setFormData({
      name: cat.name,
      parentId: cat.parentId || '',
    });
    setEditingId(cat.id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you certain you wish to dissolve this classification? This may affect associated products.')) return;
    try {
      await api.delete(`/categories/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setCategories(categories.filter(c => c.id !== id));
      alert('Classification dissolved.');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Deletion failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, formData, { headers: { Authorization: `Bearer ${token}` } });
        alert('Classification refined.');
      } else {
        await api.post('/categories', formData, { headers: { Authorization: `Bearer ${token}` } });
        alert('New classification defined.');
      }
      fetchCategories();
      resetForm();
    } catch (error) {
      alert('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-surface-950">
        <div className="w-12 h-12 border-4 border-brand-indigo rounded-full border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 italic uppercase tracking-widest leading-none">
              TAXONOMY <span className="text-brand-indigo">VAULT</span>
            </h1>
            <p className="text-slate-400 text-lg">Define the architectural hierarchy of the collection.</p>
          </div>
          <button 
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5"
          >
            {isFormOpen ? <><X size={16} /> CLOSE VAULT</> : <><Plus size={16} /> NEW CATEGORY</>}
          </button>
        </div>

        {/* Add/Edit Form Overlay */}
        <AnimatePresence>
          {isFormOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-16"
            >
              <div className="glass-dark p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-4 mb-2 block">Category Title</label>
                    <input 
                      required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-brand-indigo transition-all outline-none" 
                      placeholder="e.g. OUTERWEAR, FOOTWEAR..."
                    />
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-4 mb-2 block">Parent Classification (Optional)</label>
                    <select 
                      value={formData.parentId} onChange={(e) => setFormData({...formData, parentId: e.target.value})}
                      className="w-full bg-surface-900 border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-brand-indigo transition-all outline-none appearance-none font-bold"
                    >
                      <option value="">ROOT CATEGORY</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button 
                      type="submit" disabled={loading}
                      className="flex-1 py-5 bg-brand-indigo text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-brand-indigo/90 transition-all shadow-xl shadow-brand-indigo/20"
                    >
                      {loading ? 'SYNCHRONIZING...' : editingId ? 'REFINE ARCHITECTURE' : 'ESTABLISH CATEGORY'}
                    </button>
                    <button 
                      type="button" onClick={resetForm}
                      className="px-8 py-5 border border-white/5 text-slate-400 rounded-2xl font-bold text-xs uppercase tracking-widest hover:text-white"
                    >
                      Discard
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories List */}
        <div className="space-y-4">
          {categories.map((cat) => (
            <div key={cat.id} className="glass-dark rounded-[2.5rem] p-6 border border-white/5 hover:border-white/10 transition-all group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-brand-indigo">
                    <Folder size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white italic tracking-tighter uppercase">{cat.name}</h3>
                    <p className="text-[10px] text-slate-500 font-mono tracking-widest">UID: {cat.id.slice(0, 8)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(cat)} className="p-3 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(cat.id)} className="p-3 text-slate-500 hover:text-brand-rose hover:bg-brand-rose/5 rounded-xl transition-all"><Trash2 size={16} /></button>
                </div>
              </div>
              
              {/* Nested Children (if any) */}
              {cat.children && cat.children.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/5 pl-12 space-y-3">
                  {cat.children.map((child: any) => (
                    <div key={child.id} className="flex items-center justify-between text-slate-400 group/child">
                      <div className="flex items-center gap-2">
                        <ChevronRight size={14} className="text-slate-600" />
                        <span className="text-sm font-bold uppercase tracking-widest group-hover/child:text-white transition-colors">{child.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(child)} className="p-1 hover:text-white"><Edit2 size={12} /></button>
                        <button onClick={() => handleDelete(child.id)} className="p-1 hover:text-brand-rose"><Trash2 size={12} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {categories.length === 0 && (
            <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10 text-slate-500 italic">
              No categories established yet. Define your first classification above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
