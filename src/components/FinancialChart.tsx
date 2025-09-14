"use client";

import { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Income, Expense } from "@/types/finance";

interface ChartData {
  name: string;
  รายรับ: number;
  รายจ่าย: number;
}

const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

interface Props {
  incomes: Income[];
  expenses: Expense[];
}

const FinancialChart = ({ incomes, expenses }: Props) => {
  const [filterYear, setFilterYear] = useState<number | "ทั้งหมด">("ทั้งหมด");

  // หาปีทั้งหมดจาก incomes + expenses
  const years = useMemo(() => {
    const incomeYears = incomes.map((inc) => new Date(inc.income_date).getFullYear());
    const expenseYears = expenses.map((exp) => new Date(exp.expense_date).getFullYear());
    return Array.from(new Set([...incomeYears, ...expenseYears])).sort((a, b) => b - a);
  }, [incomes, expenses]);

  const data: ChartData[] = useMemo(() => {
    return monthNames.map((month, idx) => {
      const monthNumber = idx + 1;

      const monthlyIncome = incomes
        .filter((inc) => {
          const date = new Date(inc.income_date);
          return (
            date.getMonth() + 1 === monthNumber &&
            (filterYear === "ทั้งหมด" || date.getFullYear() === filterYear)
          );
        })
        .reduce((sum, inc) => sum + Number(inc.income_amount), 0);

      const monthlyExpense = expenses
        .filter((exp) => {
          const date = new Date(exp.expense_date);
          return (
            date.getMonth() + 1 === monthNumber &&
            (filterYear === "ทั้งหมด" || date.getFullYear() === filterYear)
          );
        })
        .reduce((sum, exp) => sum + Number(exp.expense_price), 0);

      return { name: month, รายรับ: monthlyIncome, รายจ่าย: monthlyExpense };
    });
  }, [incomes, expenses, filterYear]);

  return (
    <div className="bg-white rounded-lg p-4 h-full">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-lg font-semibold">สรุปรายรับ-รายจ่าย</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">ปี:</label>
          <select
            value={filterYear}
            onChange={(e) =>
              setFilterYear(e.target.value === "ทั้งหมด" ? "ทั้งหมด" : Number(e.target.value))
            }
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="ทั้งหมด">ทั้งหมด</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barSize={20}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd" />
          <XAxis dataKey="name" axisLine={false} tick={{ fill: "#374151" }} tickLine={false} />
          <YAxis axisLine={false} tick={{ fill: "#374151" }} tickLine={false} />
          <Tooltip
            formatter={(value) => [`${Number(value).toLocaleString()} บาท`]}
            labelFormatter={(label) => `เดือน: ${label}`}
          />
          <Legend align="left" verticalAlign="top" />
          <Bar dataKey="รายรับ" fill="#a7f3d0" radius={[6,6,0,0]} />
          <Bar dataKey="รายจ่าย" fill="#fecaca" radius={[6,6,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinancialChart;
