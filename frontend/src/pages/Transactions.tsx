import { useEffect, useState } from 'react';
import type { Transaction, Category } from '../types';
import api from '../api/axios';

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);
  const [form, setForm] = useState({
    amount: '',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    description: '',
    date: new Date().toISOString().split('T')[0],
    categoryId: '',
  });
  const [error, setError] = useState('');

  const fetchAll = async () => {
    try {
      const [txRes, catRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/categories'),
      ]);
      setTransactions(txRes.data);
      setCategories(catRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm({ amount: '', type: 'EXPENSE', description: '', date: new Date().toISOString().split('T')[0], categoryId: '' });
    setError('');
    setShowForm(true);
  };

  const openEdit = (tx: Transaction) => {
    setEditTarget(tx);
    setForm({
      amount: tx.amount.toString(),
      type: tx.type,
      description: tx.description || '',
      date: tx.date,
      categoryId: tx.category?.id.toString() || '',
    });
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const payload = {
      amount: parseFloat(form.amount),
      type: form.type,
      description: form.description || null,
      date: form.date,
      categoryId: form.categoryId ? parseInt(form.categoryId) : null,
    };
    try {
      if (editTarget) {
        await api.put(`/transactions/${editTarget.id}`, payload);
      } else {
        await api.post('/transactions', payload);
      }
      setShowForm(false);
      fetchAll();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to save transaction');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this transaction?')) return;
    await api.delete(`/transactions/${id}`);
    fetchAll();
  };

  const handleExportCsv = () => {
    const token = localStorage.getItem('token');
    const link = document.createElement('a');
    link.href = 'http://localhost:8080/api/transactions/export/csv';
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:8080/api/transactions/export/csv');
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.responseType = 'blob';
    xhr.onload = () => {
      const url = URL.createObjectURL(xhr.response);
      link.href = url;
      link.download = 'transactions.csv';
      link.click();
      URL.revokeObjectURL(url);
    };
    xhr.send();
  };

  if (loading) return <div className="p-8 text-gray-500 dark:text-gray-400">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
        <div className="flex gap-3">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            ⬇ Export CSV
          </button>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            + New Transaction
          </button>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <div className="text-4xl mb-3">💸</div>
          <p>No transactions yet. Add your first one.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{tx.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{tx.description || '—'}</td>
                  <td className="px-6 py-4">
                    {tx.category ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: tx.category.color }}>
                        {tx.category.icon && <span>{tx.category.icon}</span>}
                        {tx.category.name}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                    )}
                  </td>
                  <td className={`px-6 py-4 text-sm font-semibold text-right ${tx.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openEdit(tx)} className="text-sm text-indigo-500 hover:text-indigo-700 font-medium mr-3">Edit</button>
                    <button onClick={() => handleDelete(tx.id)} className="text-sm text-red-500 hover:text-red-700 font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {editTarget ? 'Edit Transaction' : 'New Transaction'}
            </h2>
            {error && <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-3">
                {(['EXPENSE', 'INCOME'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, type: t })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      form.type === t
                        ? t === 'INCOME'
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'bg-red-500 border-red-500 text-white'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {t === 'INCOME' ? '+ Income' : '- Expense'}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input
                  required
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select
                  value={form.categoryId}
                  onChange={e => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">No category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon ? `${cat.icon} ` : ''}{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <input
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Optional note"
                />
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