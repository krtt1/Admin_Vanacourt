// src/types/finance.ts

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  category: string;
  description?: string;
}

export interface Income {
  income_id: string;
  income_type: string;
  income_amount: number;
  income_date: string;
  income_description?: string;
}

export interface Expense {
  expense_id: string;
  expense_type: string;
  expense_price: number;
  expense_date: string;
  admin_id?: string; // เพิ่มตรงนี้เพื่อใช้เวลา create
  expense_description?: string;
}

export interface FinancialSummary {
  monthlyIncome: number;
  monthlyExpense: number;
  yearEndBalance: number;
}

export interface FinancialChartData {
  month: string;
  income: number;
  expense: number;
}
