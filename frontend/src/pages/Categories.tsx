import { useEffect, useState } from 'react';
import type { Category } from '../types';
import api from '../api/axios';

const COLORS = ['#6366f1','#f59e0b','#10b981','#ef4444','#3b82f6','#8b5cf6','#ec4899','#14b8a6'];

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', color: '#6366f1', icon: '' });
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm({ name: '', color: '#6366f1', icon: '' });
    setError('');
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setEditTarget(cat);
    setForm({ name: cat.name, color: cat.color, icon: cat.icon || '' });
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editTarget) {
        await api.put(`/categories/${editTarget.id}`, form);
      } else {
        await api.post('/categories', form);
      }
      setShowForm(false);
      fetchCategories();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this category?')) return;
    await api.delete(`/categories/${id}`);
    fetchCategories();
  };

  if (loading) return <div className="p-8 text-gray-500 dark:text-gray-400">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          + New Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <div className="text-4xl mb-3">🏷️</div>
          <p>No categories yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: cat.color }}>
                  {cat.icon || cat.name[0].toUpperCase()}
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{cat.name}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(cat)} className="text-sm text-indigo-500 hover:text-indigo-700 font-medium">Edit</button>
                <button onClick={() => handleDelete(cat.id)} className="text-sm text-red-500 hover:text-red-700 font-medium">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {editTarget ? 'Edit Category' : 'New Category'}
            </h2>
            {error && <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Groceries"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon (emoji)</label>
                <input
                  value={form.icon}
                  onChange={e => setForm({ ...form, icon: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. 🍔"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, color: c })}
                      className={`w-8 h-8 rounded-full transition-transform ${form.color === c ? 'scale-125 ring-2 ring-offset-2 ring-indigo-500' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}