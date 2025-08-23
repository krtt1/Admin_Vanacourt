"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { getAllIncomes, getAllExpenses } from "@/lib/api";
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
  const [data, setData] = useState<ChartData[]>([]);

  useEffect(() => {
    const chartData: ChartData[] = monthNames.map((month, idx) => {
      const monthNumber = idx + 1;
      const monthlyIncome = incomes
        .filter((inc) => new Date(inc.income_date).getMonth() + 1 === monthNumber)
        .reduce((sum, inc) => sum + Number(inc.income_amount), 0);
      const monthlyExpense = expenses
        .filter((exp) => new Date(exp.expense_date).getMonth() + 1 === monthNumber)
        .reduce((sum, exp) => sum + Number(exp.expense_price), 0);
      return { name: month, รายรับ: monthlyIncome, รายจ่าย: monthlyExpense };
    });
    setData(chartData);
  }, [incomes, expenses]);

  return (
    <div className="bg-white rounded-lg p-4 h-full">
      <h1 className="text-lg font-semibold mb-2">สรุปรายรับ-รายจ่าย</h1>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barSize={20}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd" />
          <XAxis dataKey="name" axisLine={false} tick={{ fill: "#d1d5db" }} tickLine={false} />
          <YAxis axisLine={false} tick={{ fill: "#d1d5db" }} tickLine={false} />
          <Tooltip formatter={(value) => [`${Number(value).toLocaleString()} บาท`]} />
          <Legend align="left" verticalAlign="top" />
          <Bar dataKey="รายรับ" fill="#66ff99" radius={[10,10,0,0]} />
          <Bar dataKey="รายจ่าย" fill="#ff5252" radius={[10,10,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinancialChart;
