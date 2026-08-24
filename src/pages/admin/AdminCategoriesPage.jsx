import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { showToast } from '../../components/common/Toast';
import api from '../../services/api';

export const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formState, setFormState] = useState({ name: '', description: '', image_url: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      if (res.data.success) {
        setCategories(res.data.categories || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormState({ name: '', description: '', image_url: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormState({ name: cat.name, description: cat.description || '', image_url: cat.image_url || '' });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete category? Products in this category may be affected.')) {
      return;
    }
    try {
      const res = await api.delete(`/categories/${id}`);
      if (res.data.success) {
        showToast('Category deleted', 'success');
        fetchCategories();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formState.name) {
      showToast('Category name is required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        const res = await api.put(`/categories/${editingCategory.id}`, formState);
        if (res.data.success) {
          showToast('Category updated successfully!', 'success');
          setIsModalOpen(false);
          fetchCategories();
        }
      } else {
        const res = await api.post('/categories', formState);
        if (res.data.success) {
          showToast('Category created successfully!', 'success');
          setIsModalOpen(false);
          fetchCategories();
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Categories Management</h1>
          <p className="text-xs text-gray-400 mt-1">Organize products into departments, collections, and seasonal drops.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-lg shadow-brand-600/30 flex items-center gap-2 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="glass-panel rounded-3xl p-6 border border-gray-800 space-y-4 flex flex-col justify-between">
            <div className="flex items-start gap-4">
              <img
                src={cat.image_url || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800'}
                alt={cat.name}
                className="w-16 h-16 rounded-2xl object-cover bg-dark-900 border border-gray-800 shrink-0"
              />
              <div className="min-w-0">
                <h3 className="text-base font-bold text-white truncate">{cat.name}</h3>
                <span className="text-xs text-brand-400 font-mono">slug: {cat.slug}</span>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{cat.description || 'No description provided.'}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-300">
                {cat.product_count || 0} Products
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(cat)}
                  className="p-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-gray-300 hover:text-white border border-gray-700 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingCategory ? 'Edit Category' : 'Add Category'}
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-300">Category Name *</label>
              <input
                type="text"
                required
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                placeholder="e.g. Smart Wearables"
                className="w-full bg-dark-900 border border-gray-700 text-gray-100 rounded-xl p-2.5 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-gray-300">Cover Image URL</label>
              <input
                type="url"
                value={formState.image_url}
                onChange={(e) => setFormState({ ...formState, image_url: e.target.value })}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-dark-900 border border-gray-700 text-gray-100 rounded-xl p-2.5 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-gray-300">Description</label>
              <textarea
                rows={3}
                value={formState.description}
                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                placeholder="Category summary..."
                className="w-full bg-dark-900 border border-gray-700 text-gray-100 rounded-xl p-2.5 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="pt-4 border-t border-gray-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-dark-800 text-gray-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-lg shadow-brand-600/30"
              >
                {submitting ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
