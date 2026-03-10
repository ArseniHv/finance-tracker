import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { fetchDashboardData } from '../api/dashboard';
import type { MonthlySummary, CategorySpending } from '../api/dashboard';
import type { Budget, Transaction } from '../types';
import SummaryCard from '../components/SummaryCard';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Dashboard() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [loading, setLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [net, setNet] = useState(0);
  const [barData, setBarData] = useState<MonthlySummary[]>([]);
  const [pieData, setPieData] = useState<CategorySpending[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);

  useEffect(() => {
    setLoading(true);
    fetchDashboardData(month, year).then(data => {
      setTotalIncome(data.totalIncome);
      setTotalExpenses(data.totalExpenses);
      setNet(data.net);
      setBarData(data.barData);
      setPieData(data.pieData);
      setBudgets(data.budgets);
      setRecentTx(data.monthlyTransactions.slice(0, 5));
    }).finally(() => setLoading(false));
  }, [month, year]);

  const barChartData = barData.map(d => ({
    name: `${MONTHS[d.month - 1]}${d.year !== year ? ` ${d.year}` : ''}`,
    Income: d.totalIncome,
    Expenses: d.totalExpenses,
  }));

  if (loading) return <div className="p-8 text-gray-500 dark:text-gray-400">Loading dashboard...</div>;

  return (
    <div className="p-8 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="flex gap-3">
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
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard title="Total Income"   amount={totalIncome}   icon="💰" variant="income"  />
        <SummaryCard title="Total Expenses" amount={totalExpenses} icon="💸" variant="expense" />
        <SummaryCard title="Net Savings"    amount={net}           icon="📈" variant="net"     />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Income vs Expenses — Last 6 Months</h2>
          {barChartData.every(d => d.Income === 0 && d.Expenses === 0) ? (
            <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-500 text-sm">No data for this period</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barChartData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#f9fafb' }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                />
                <Bar dataKey="Income"   fill="#10b981" radius={[4,4,0,0]} />
                <Bar dataKey="Expenses" fill="#ef4444" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Spending by Category</h2>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-500 text-sm">No expense data this month</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="amount"
                  nameKey="categoryName"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ categoryName, percent }) => `${categoryName} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Legend formatter={value => <span style={{ color: '#6b7280', fontSize: 12 }}>{value}</span>} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#f9fafb' }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Budget overview */}
      {budgets.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Budget Overview</h2>
          <div className="space-y-4">
            {budgets.map(budget => {
              const pct = Math.min((Number(budget.spent) / Number(budget.amount)) * 100, 100);
              const over = Number(budget.spent) > Number(budget.amount);
              return (
                <div key={budget.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: budget.category.color }}>
                        {budget.category.icon || budget.category.name[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{budget.category.name}</span>
                      {over && <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-full">Over</span>}
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      <span className={`font-semibold ${over ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                        ${Number(budget.spent).toFixed(2)}
                      </span>
                      {' / '}${Number(budget.amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all ${over ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Recent Transactions This Month</h2>
        {recentTx.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">No transactions this month</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {recentTx.map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: tx.category?.color || '#6366f1' }}
                  >
                    {tx.category?.icon || (tx.type === 'INCOME' ? '💰' : '💸')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{tx.description || tx.category?.name || tx.type}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{tx.date}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${tx.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                  {tx.type === 'INCOME' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}