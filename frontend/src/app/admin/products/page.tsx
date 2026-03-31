'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function AdminProductsPage() {
  const { isAuthenticated, user, token } = useAuthStore();
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stockQty, setStockQty] = useState('');
  const [imageURLs, setImageURLs] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/login');
      return;
    }

    const fetchCategories = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/products/categories');
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories', error);
      }
    };
    fetchCategories();
  }, [isAuthenticated, user, router]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const urlsArray = imageURLs.split(',').map((url) => url.trim()).filter((url) => url);
      await axios.post(
        'http://localhost:5000/api/products',
        {
          name,
          description,
          price: parseFloat(price),
          stockQty: parseInt(stockQty),
          imageURLs: urlsArray,
          categoryId: categoryId || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Product created successfully!');
      setName('');
      setDescription('');
      setPrice('');
      setStockQty('');
      setImageURLs('');
      setCategoryId('');
    } catch (error) {
       console.error(error);
       alert('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-white min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Admin Dashboard - Add Product</h1>

      <form onSubmit={handleAddProduct} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Name</label>
          <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 mt-1 border rounded-md" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-4 py-2 mt-1 border rounded-md" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Price ($)</label>
            <input required type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-4 py-2 mt-1 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
            <input required type="number" value={stockQty} onChange={(e) => setStockQty(e.target.value)} className="w-full px-4 py-2 mt-1 border rounded-md" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-4 py-2 mt-1 border rounded-md bg-white">
            <option value="">No Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Image URLs (comma separated)</label>
          <input required type="text" value={imageURLs} onChange={(e) => setImageURLs(e.target.value)} className="w-full px-4 py-2 mt-1 border rounded-md" placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg" />
        </div>

        <button type="submit" disabled={loading} className="w-full px-4 py-3 text-white bg-black hover:bg-gray-800 rounded-md">
          {loading ? 'Creating...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
}
