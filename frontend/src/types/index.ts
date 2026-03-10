export interface User {
  email: string;
  fullName: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  icon?: string;
}

export interface Transaction {
  id: number;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  description?: string;
  date: string;
  category?: Category;
}

export interface Budget {
  id: number;
  amount: number;
  spent: number;
  month: number;
  year: number;
  category: Category;
}