import api from './axios';
import type { Transaction, Budget } from '../types';

export interface MonthlySummary {
  month: number;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  net: number;
}

export interface CategorySpending {
  categoryName: string;
  color: string;
  amount: number;
}

export async function fetchDashboardData(month: number, year: number) {
  const [transactionsRes, budgetsRes] = await Promise.all([
    api.get<Transaction[]>('/transactions'),
    api.get<Budget[]>(`/budgets?month=${month}&year=${year}`),
  ]);

  const transactions: Transaction[] = transactionsRes.data;
  const budgets: Budget[] = budgetsRes.data;

  // Filter transactions for selected month/year
  const monthlyTransactions = transactions.filter(tx => {
    const d = new Date(tx.date);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });

  // Current month summary
  const totalIncome = monthlyTransactions
    .filter(tx => tx.type === 'INCOME')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const totalExpenses = monthlyTransactions
    .filter(tx => tx.type === 'EXPENSE')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  // Last 6 months bar chart data
  const barData: MonthlySummary[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(year, month - 1 - i, 1);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    const filtered = transactions.filter(tx => {
      const td = new Date(tx.date);
      return td.getFullYear() === y && td.getMonth() + 1 === m;
    });
    const income = filtered.filter(tx => tx.type === 'INCOME').reduce((s, tx) => s + Number(tx.amount), 0);
    const expenses = filtered.filter(tx => tx.type === 'EXPENSE').reduce((s, tx) => s + Number(tx.amount), 0);
    barData.push({ month: m, year: y, totalIncome: income, totalExpenses: expenses, net: income - expenses });
  }

  // Category spending pie data
  const categoryMap = new Map<string, CategorySpending>();
  monthlyTransactions
    .filter(tx => tx.type === 'EXPENSE' && tx.category)
    .forEach(tx => {
      const key = tx.category!.name;
      if (categoryMap.has(key)) {
        categoryMap.get(key)!.amount += Number(tx.amount);
      } else {
        categoryMap.set(key, {
          categoryName: key,
          color: tx.category!.color,
          amount: Number(tx.amount),
        });
      }
    });
  const pieData = Array.from(categoryMap.values());

  return { totalIncome, totalExpenses, net: totalIncome - totalExpenses, barData, pieData, budgets, monthlyTransactions };
}