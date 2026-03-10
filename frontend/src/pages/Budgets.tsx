import { useEffect, useState } from 'react';
import type { Budget, Category } from '../types';
import api from '../api/axios';

export default function Budgets() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Budget | null>(null);
  const [form, setForm] = useState({ amount: '', categoryId: '', month: now.getMonth() + 1, year: now.getFullYear() });
  const [error, setError] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [budgetRes, catRes] = await Promise.all([
        api.get(`/budgets?month=${month}&year=${year}`),
        api.get('/categories'),
      ]);
      setBudgets(budgetRes.data);
      setCategories(catRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [month, year]);

  const openCreate = () => {
    setEditTarget(null);
    setForm({ amount: '', categoryId: '', month, year });
    setError('');
    setShowForm(true);
  };

  const openEdit = (budget: Budget) => {
    setEditTarget(budget);
    setForm({ amount: budget.amount.toString(), categoryId: budget.category.id.toString(), month: budget.month, year: budget.year });
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const payload = {
      amount: parseFloat(form.amount),
      categoryId: parseInt(form.categoryId),
      month: form.month,
      year: form.year,
    };
    try {
      if (editTarget) {
        await api.put(`/budgets/${editTarget.id}`, payload);
      } else {
        await api.post('/budgets', payload);
      }
      setShowForm(false);
      fetchAll();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to save budget');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this budget?')) return;
    await api.delete(`/budgets/${id}`);
    fetchAll();
  };

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budgets</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          + New Budget
        </button>
      </div>

      {/* Month/Year selector */}
      <div className="flex gap-3 mb-6">
        <select
          value={month}
          onChange={e => setMonth(parseInt(e.target.value))}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        >
          {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
        </select>
        <select
          value={year}
          onChange={e => setYear(parseInt(e.target.value))}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        >
          {[2023, 2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      ) : budgets.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <div className="text-4xl mb-3">🎯</div>
          <p>No budgets for this month. Create one to start tracking.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {budgets.map(budget => {
            const pct = Math.min((Number(budget.spent) / Number(budget.amount)) * 100, 100);
            const over = Number(budget.spent) > Number(budget.amount);
            return (
              <div key={budget.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: budget.category.color }}>
                      {budget.category.icon || budget.category.name[0].toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{budget.category.name}</span>
                    {over && <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-full font-medium">Over budget</span>}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      <span className={`font-semibold ${over ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>${Number(budget.spent).toFixed(2)}</span>
                      {' / '}${Number(budget.amount).toFixed(2)}
                    </span>
                    <button onClick={() => openEdit(budget)} className="text-sm text-indigo-500 hover:text-indigo-700 font-medium">Edit</button>
                    <button onClick={() => handleDelete(budget.id)} className="text-sm text-red-500 hover:text-red-700 font-medium">Delete</button>
                  </div>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all ${over ? 'bg-red-500' : 'bg-indigo-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-1 text-right text-xs text-gray-400 dark:text-gray-500">{pct.toFixed(0)}% used</div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {editTarget ? 'Edit Budget' : 'New Budget'}
            </h2>
            {error && <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select
                  required
                  value={form.categoryId}
                  onChange={e => setForm({ ...form, categoryId: e.target.value })}
                  disabled={!!editTarget}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget Amount</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.00"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Month</label>
                  <select
                    value={form.month}
                    onChange={e => setForm({ ...form, month: parseInt(e.target.value) })}
                    disabled={!!editTarget}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
                  <select
                    value={form.year}
                    onChange={e => setForm({ ...form, year: parseInt(e.target.value) })}
                    disabled={!!editTarget}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {[2023, 2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
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