"use client";

import { useEffect, useState } from "react";
import FinancialCard from "@/components/FinancialCard";
import FinancialChart from "@/components/FinancialChart";
import IncomeTable from "@/components/IncomeTable";
import ExpenseTable from "@/components/ExpenseTable";
import { getAllIncomes, getAllExpenses, getYearEndBalance } from "@/lib/api";
import { Income, Expense } from "@/types/finance";

const FinancePage = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [showIncomeTable, setShowIncomeTable] = useState(false);
  const [showExpenseTable, setShowExpenseTable] = useState(false);

  const fetchData = async () => {
    try {
      const inc = await getAllIncomes();
      const exp = await getAllExpenses();
      setIncomes(inc);
      setExpenses(exp);
      const totalBalance = await getYearEndBalance(new Date().getFullYear());
      setBalance(totalBalance);
    } catch (err) {
      console.error("Error fetching finance data:", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="space-y-6 p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <FinancialCard title="รายรับเดือนนี้" amount={incomes.reduce((sum,i)=>sum+Number(i.income_amount),0)} color="green" />
        <FinancialCard title="รายจ่ายเดือนนี้" amount={expenses.reduce((sum,e)=>sum+Number(e.expense_price),0)} color="pink" />
        <FinancialCard title="ยอดปีนี้" amount={balance} color="orange" />
      </div>

      <div className="h-96">
        <FinancialChart incomes={incomes} expenses={expenses} />
      </div>

      <div className="flex gap-4">
        <button onClick={()=>setShowIncomeTable(!showIncomeTable)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          {showIncomeTable ? "ซ่อนตารางรายรับ" : "ดูตารางรายรับ"}
        </button>
        <button onClick={()=>setShowExpenseTable(!showExpenseTable)} className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600">
          {showExpenseTable ? "ซ่อนตารางรายจ่าย" : "ดูตารางรายจ่าย"}
        </button>
      </div>

      {showIncomeTable && <IncomeTable incomes={incomes} onIncomesUpdate={(updated)=>{ setIncomes(updated); fetchData(); }} />}
      {showExpenseTable && <ExpenseTable expenses={expenses} onExpensesUpdate={(updated)=>{ setExpenses(updated); fetchData(); }} />}
    </div>
  );
};

export default FinancePage;
