'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Trash2, Edit2, Plus, X, Package, DollarSign, Layers, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminProductsPage() {
  const { isAuthenticated, user, token } = useAuthStore();
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQty: '',
    imageURLs: '',
    categoryId: '',
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products'),
          api.get('/products/categories')
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
      } catch (error) {
        console.error('Failed to load data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', stockQty: '', imageURLs: '', categoryId: '' });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (product: any) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stockQty: product.stockQty.toString(),
      imageURLs: product.imageURLs.join(', '),
      categoryId: product.categoryId || '',
    });
    setEditingId(product.id);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this piece from the collection?')) return;
    try {
      await api.delete(`/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      alert('Failed to delete product');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const urlsArray = formData.imageURLs.split(',').map((url) => url.trim()).filter((url) => url);
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stockQty: parseInt(formData.stockQty),
        imageURLs: urlsArray,
        categoryId: formData.categoryId || undefined,
      };

      if (editingId) {
        const { data } = await api.put(`/products/${editingId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        setProducts(products.map(p => p.id === editingId ? data : p));
        alert('Product updated successfully');
      } else {
        const { data } = await api.post('/products', payload, { headers: { Authorization: `Bearer ${token}` } });
        setProducts([data, ...products]);
        alert('Product created successfully');
      }
      resetForm();
    } catch (error) {
      console.error(error);
      alert('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading && products.length === 0) {
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
              CURATION <span className="text-brand-indigo">STUDIO</span>
            </h1>
            <p className="text-slate-400 text-lg">Manage the exclusive boutique inventory.</p>
          </div>
          <button 
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5"
          >
            {isFormOpen ? <><X size={16} /> CLOSE STUDIO</> : <><Plus size={16} /> NEW ACQUISITION</>}
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
              <div className="glass-dark p-8 md:p-12 rounded-[2.5rem] border border-white/10 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-10 italic tracking-tight flex items-center gap-3">
                  {editingId ? 'REFINING PIECE' : 'DEFINING NEW PIECE'}
                  <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                </h2>
                
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="relative">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-4 mb-2 block">Legacy Title</label>
                      <input 
                        required name="name" value={formData.name} onChange={handleInputChange}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-brand-indigo transition-all outline-none" 
                        placeholder="Masterpiece Name"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-4 mb-2 block">Artistic Description</label>
                      <textarea 
                        required name="description" value={formData.description} onChange={handleInputChange} rows={4}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-brand-indigo transition-all outline-none resize-none" 
                        placeholder="Craftsmanship details..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-4 mb-2 block">Value (USD)</label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                          <input 
                            required name="price" type="number" step="0.01" value={formData.price} onChange={handleInputChange}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl pl-10 pr-6 py-4 text-white focus:border-brand-indigo transition-all outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-4 mb-2 block">Inventory</label>
                        <div className="relative">
                          <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                          <input 
                            required name="stockQty" type="number" value={formData.stockQty} onChange={handleInputChange}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl pl-10 pr-6 py-4 text-white focus:border-brand-indigo transition-all outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-4 mb-2 block">Classification</label>
                      <div className="relative">
                        <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <select 
                          name="categoryId" value={formData.categoryId} onChange={handleInputChange}
                          className="w-full bg-surface-900 border border-white/5 rounded-2xl pl-10 pr-6 py-4 text-white focus:border-brand-indigo transition-all outline-none appearance-none font-bold"
                        >
                          <option value="">UNCATEGORIZED</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-4 mb-2 block">Visual Assets (CSV)</label>
                      <div className="relative">
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input 
                          required name="imageURLs" type="text" value={formData.imageURLs} onChange={handleInputChange}
                          className="w-full bg-white/5 border border-white/5 rounded-2xl pl-10 pr-6 py-4 text-white focus:border-brand-indigo transition-all outline-none text-xs" 
                          placeholder="URL 1, URL 2..."
                        />
                      </div>
                    </div>
                    <div className="pt-8">
                       <button 
                        type="submit" disabled={loading}
                        className="w-full py-5 bg-brand-indigo text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-brand-indigo/90 transition-all shadow-xl shadow-brand-indigo/20 flex items-center justify-center gap-3"
                      >
                        {loading ? 'SYNCHRONIZING...' : editingId ? 'REFINE COLLECTION' : 'ADD TO COLLECTION'}
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

        {/* Product Table */}
        <div className="relative group">
          <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-tr from-brand-indigo/5 to-brand-cyan/5 blur-3xl opacity-50" />
          <div className="relative glass-dark rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/5">
                <thead>
                  <tr className="bg-white/[0.03]">
                    <th className="px-8 py-6 text-left font-mono text-[0.65rem] text-slate-500 uppercase tracking-widest">Piece</th>
                    <th className="px-8 py-6 text-left font-mono text-[0.65rem] text-slate-500 uppercase tracking-widest">Classification</th>
                    <th className="px-8 py-6 text-left font-mono text-[0.65rem] text-slate-500 uppercase tracking-widest">Pricing</th>
                    <th className="px-8 py-6 text-left font-mono text-[0.65rem] text-slate-500 uppercase tracking-widest">Inventory</th>
                    <th className="px-8 py-6 text-right font-mono text-[0.65rem] text-slate-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map((product) => (
                    <tr key={product.id} className="group/row hover:bg-white/[0.01] transition-all">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-white/5 rounded-xl overflow-hidden border border-white/10">
                            {product.imageURLs?.[0] && <img src={product.imageURLs[0]} className="w-full h-full object-cover" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white italic tracking-tight">{product.name}</p>
                            <p className="text-[0.6rem] text-slate-500 font-mono uppercase tracking-widest">ID: {product.id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className="text-[0.65rem] font-black text-brand-indigo uppercase tracking-widest px-3 py-1 bg-brand-indigo/5 rounded-full border border-brand-indigo/10">
                          {product.category?.name || 'Unclassified'}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-white font-black italic tracking-tighter text-lg">
                        ${product.price ? Number(product.price).toFixed(2) : '0.00'}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${product.stockQty > 10 ? 'bg-green-500' : 'bg-brand-rose'}`} />
                          <span className="text-slate-300 font-mono text-xs">{product.stockQty} UNITS</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-right space-x-3">
                        <button 
                          onClick={() => handleEdit(product)}
                          className="p-3 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-3 text-slate-500 hover:text-brand-rose hover:bg-brand-rose/5 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
