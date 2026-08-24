import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  Check,
  X,
  Sparkles,
  TrendingUp,
  Image as ImageIcon
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { showToast } from '../../components/common/Toast';
import api from '../../services/api';

export const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formState, setFormState] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    category_id: '',
    stock: '',
    image_url: '',
    galleryUrls: '',
    is_featured: false,
    is_trending: false
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products?limit=100'),
        api.get('/categories')
      ]);
      if (prodRes.data.success) setProducts(prodRes.data.products || []);
      if (catRes.data.success) setCategories(catRes.data.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormState({
      name: '',
      description: '',
      price: '',
      discount_price: '',
      category_id: categories[0]?.id || 1,
      stock: 20,
      image_url: '',
      galleryUrls: '',
      is_featured: false,
      is_trending: false
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormState({
      name: product.name,
      description: product.description,
      price: product.price,
      discount_price: product.discount_price || '',
      category_id: product.category_id,
      stock: product.stock,
      image_url: product.image_url,
      galleryUrls: '',
      is_featured: !!product.is_featured,
      is_trending: !!product.is_trending
    });
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this product?')) {
      return;
    }
    try {
      const res = await api.delete(`/products/${id}`);
      if (res.data.success) {
        showToast('Product deleted successfully', 'success');
        fetchData();
      } else {
        showToast(res.data.message, 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formState.name || !formState.description || !formState.price || !formState.image_url) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const extraImages = formState.galleryUrls
        ? formState.galleryUrls.split('\n').map((u) => u.trim()).filter((u) => u.length > 0)
        : [];

      const payload = {
        name: formState.name,
        description: formState.description,
        price: Number(formState.price),
        discount_price: formState.discount_price ? Number(formState.discount_price) : null,
        category_id: Number(formState.category_id),
        stock: Number(formState.stock),
        image_url: formState.image_url,
        images: extraImages,
        is_featured: formState.is_featured ? 1 : 0,
        is_trending: formState.is_trending ? 1 : 0
      };

      if (editingProduct) {
        const res = await api.put(`/products/${editingProduct.id}`, payload);
        if (res.data.success) {
          showToast('Product updated successfully!', 'success');
          setIsModalOpen(false);
          fetchData();
        }
      } else {
        const res = await api.post('/products', payload);
        if (res.data.success) {
          showToast('Product created successfully!', 'success');
          setIsModalOpen(false);
          fetchData();
        }
      }
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category_name && p.category_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Products Management</h1>
          <p className="text-xs text-gray-400 mt-1">Add new items, update inventory, edit pricing, or configure featured deals.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-lg shadow-brand-600/30 flex items-center gap-2 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-gray-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products by title or category..."
          className="w-full bg-transparent text-xs text-gray-200 placeholder-gray-500 focus:outline-none"
        />
      </div>

      {/* Products Table */}
      <div className="glass-panel rounded-3xl p-6 border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-gray-400 border-b border-gray-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Item</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Highlights</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-dark-800/40 transition-colors">
                  {/* Item Image + Title */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-12 h-12 object-cover rounded-xl bg-dark-900 border border-gray-800 shrink-0"
                      />
                      <div className="min-w-0 max-w-xs">
                        <p className="font-bold text-white truncate">{p.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">ID: #{p.id}</p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4">
                    <span className="bg-dark-800 text-brand-300 font-semibold px-2.5 py-1 rounded-lg border border-gray-700">
                      {p.category_name || 'General'}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="py-3 px-4">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-bold text-white">${(p.discount_price || p.price).toFixed(2)}</span>
                      {p.discount_price && (
                        <span className="text-[10px] text-gray-500 line-through">${p.price.toFixed(2)}</span>
                      )}
                    </div>
                  </td>

                  {/* Stock */}
                  <td className="py-3 px-4">
                    <span className={`font-bold px-2 py-0.5 rounded-md ${p.stock > 5 ? 'text-emerald-400 bg-emerald-500/10' : p.stock > 0 ? 'text-amber-400 bg-amber-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                      {p.stock} units
                    </span>
                  </td>

                  {/* Highlights */}
                  <td className="py-3 px-4">
                    <div className="flex gap-1.5">
                      {p.is_featured === 1 && (
                        <span className="badge-primary text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-amber-400" /> Featured
                        </span>
                      )}
                      {p.is_trending === 1 && (
                        <span className="bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <TrendingUp className="w-2.5 h-2.5" /> Trending
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-gray-300 hover:text-white border border-gray-700 transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingProduct ? 'Edit Product' : 'Add New Product'}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Product Name */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-semibold text-gray-300">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  placeholder="e.g. Master Wireless Studio Headphones"
                  className="w-full bg-dark-900 border border-gray-700 text-gray-100 rounded-xl p-2.5 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-300">Category *</label>
                <select
                  value={formState.category_id}
                  onChange={(e) => setFormState({ ...formState, category_id: e.target.value })}
                  className="w-full bg-dark-900 border border-gray-700 text-gray-100 rounded-xl p-2.5 focus:outline-none focus:border-brand-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Stock */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-300">Inventory Stock Quantity *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={formState.stock}
                  onChange={(e) => setFormState({ ...formState, stock: e.target.value })}
                  placeholder="e.g. 50"
                  className="w-full bg-dark-900 border border-gray-700 text-gray-100 rounded-xl p-2.5 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Regular Price */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-300">Regular Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formState.price}
                  onChange={(e) => setFormState({ ...formState, price: e.target.value })}
                  placeholder="299.99"
                  className="w-full bg-dark-900 border border-gray-700 text-gray-100 rounded-xl p-2.5 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Discount Price */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-300">Discount Sale Price ($) (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formState.discount_price}
                  onChange={(e) => setFormState({ ...formState, discount_price: e.target.value })}
                  placeholder="249.99"
                  className="w-full bg-dark-900 border border-gray-700 text-gray-100 rounded-xl p-2.5 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Main Image URL */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-semibold text-gray-300">Main Cover Image URL *</label>
                <input
                  type="url"
                  required
                  value={formState.image_url}
                  onChange={(e) => setFormState({ ...formState, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-dark-900 border border-gray-700 text-gray-100 rounded-xl p-2.5 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Extra Gallery URLs */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-semibold text-gray-300">Additional Gallery Images (One URL per line)</label>
                <textarea
                  rows={2}
                  value={formState.galleryUrls}
                  onChange={(e) => setFormState({ ...formState, galleryUrls: e.target.value })}
                  placeholder="https://images.unsplash.com/...&#10;https://images.unsplash.com/..."
                  className="w-full bg-dark-900 border border-gray-700 text-gray-100 rounded-xl p-2.5 focus:outline-none focus:border-brand-500 font-mono text-[11px]"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-semibold text-gray-300">Product Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  placeholder="Detailed product information..."
                  className="w-full bg-dark-900 border border-gray-700 text-gray-100 rounded-xl p-2.5 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Toggles */}
              <div className="flex gap-6 sm:col-span-2 pt-2 border-t border-gray-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.is_featured}
                    onChange={(e) => setFormState({ ...formState, is_featured: e.target.checked })}
                    className="rounded border-gray-700 bg-dark-800 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="font-semibold text-gray-200">Featured Pick</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.is_trending}
                    onChange={(e) => setFormState({ ...formState, is_trending: e.target.checked })}
                    className="rounded border-gray-700 bg-dark-800 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="font-semibold text-gray-200">Trending Now</span>
                </label>
              </div>

            </div>

            <div className="pt-4 border-t border-gray-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-gray-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-lg shadow-brand-600/30"
              >
                {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
