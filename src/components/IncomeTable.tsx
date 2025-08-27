"use client";

import { useState } from "react";
import { Income } from "@/types/finance";

interface Props {
  incomes: Income[];
  onIncomesUpdate: (incomes: Income[]) => void;
}

const IncomeTable = ({ incomes }: Props) => {
  const [selectedYear, setSelectedYear] = useState<string>("ทั้งหมด");
  const [selectedMonth, setSelectedMonth] = useState<string>("ทั้งหมด");

  // ดึงปีที่มีอยู่ในข้อมูล (ไม่ซ้ำ)
  const years = Array.from(
    new Set(incomes.map((i) => new Date(i.income_date).getFullYear()))
  ).sort((a, b) => b - a); // เรียงจากใหม่ -> เก่า

  // ฟิลเตอร์ข้อมูลตามปี & เดือน
  const filteredIncomes = incomes.filter((i) => {
    const incomeDate = new Date(i.income_date);
    const year = incomeDate.getFullYear();
    const month = incomeDate.getMonth() + 1;

    if (selectedYear !== "ทั้งหมด" && year !== Number(selectedYear)) return false;
    if (selectedMonth !== "ทั้งหมด" && month !== Number(selectedMonth)) return false;

    return true;
  });

  return (
    <div className="mt-6 bg-white shadow-md rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4 text-center">ข้อมูลรายรับ</h2>

      {/* === ตัวเลือกกรองข้อมูล === */}
      <div className="flex flex-wrap gap-4 justify-center mb-4">
        {/* เลือกปี */}
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-3 py-2 border rounded-lg shadow-sm focus:ring focus:ring-blue-300"
        >
          <option value="ทั้งหมด">ทั้งหมด (ปี)</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        {/* เลือกเดือน */}
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-2 border rounded-lg shadow-sm focus:ring focus:ring-blue-300"
        >
          <option value="ทั้งหมด">ทั้งหมด (เดือน)</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              เดือน {m}
            </option>
          ))}
        </select>
      </div>

      {/* === ตารางข้อมูลรายรับ === */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg text-center">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="py-3 px-4 border">จำนวนเงิน</th>
              <th className="py-3 px-4 border">วันที่</th>
            </tr>
          </thead>
          <tbody>
            {filteredIncomes.length > 0 ? (
              filteredIncomes.map((i) => (
                <tr
                  key={i.income_id}
                  className="hover:bg-gray-50 transition duration-150"
                >
                  <td className="py-2 px-4 border">
                    {i.income_amount.toLocaleString()} บาท
                  </td>
                  <td className="py-2 px-4 border">{i.income_date}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="text-center text-gray-500 py-4">
                  ไม่พบข้อมูลรายรับ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncomeTable;
