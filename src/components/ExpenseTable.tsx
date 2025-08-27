"use client";

import { useState } from "react";
import { Expense } from "@/types/finance";
import { createExpense, updateExpense, deleteExpense } from "@/lib/api";

interface Props {
  expenses: Expense[];
  onExpensesUpdate: (expenses: Expense[]) => void;
}

const ExpenseTable = ({ expenses, onExpensesUpdate }: Props) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingAmount, setEditingAmount] = useState<number>(0);
  const [editingCategory, setEditingCategory] = useState<string>("");
  const [editingDate, setEditingDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  const [newAmount, setNewAmount] = useState<number>(0);
  const [newCategory, setNewCategory] = useState<string>("");
  const [newDate, setNewDate] = useState<string>(new Date().toISOString().split("T")[0]);

  // ตัวกรอง
  const [selectedYear, setSelectedYear] = useState<string>("ทั้งหมด");
  const [selectedMonth, setSelectedMonth] = useState<string>("ทั้งหมด");

  // ดึงปีจากข้อมูล
  const years = Array.from(new Set(expenses.map((e) => new Date(e.expense_date).getFullYear()))).sort((a, b) => b - a);

  // ฟิลเตอร์ตามปี/เดือน
  const filteredExpenses = expenses.filter((e) => {
    const d = new Date(e.expense_date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    if (selectedYear !== "ทั้งหมด" && year !== Number(selectedYear)) return false;
    if (selectedMonth !== "ทั้งหมด" && month !== Number(selectedMonth)) return false;
    return true;
  });

  const handleEdit = (exp: Expense) => {
    setEditingId(exp.expense_id);
    setEditingAmount(Number(exp.expense_price) || 0);
    setEditingCategory(exp.expense_type || "");
    setEditingDate(exp.expense_date || new Date().toISOString().split("T")[0]);
  };

  const handleSave = async (id: string) => {
    if (!editingCategory || !editingDate || editingAmount <= 0) {
      alert("กรุณากรอกข้อมูลครบถ้วนและจำนวนเงินมากกว่า 0");
      return;
    }

    setLoading(true);
    try {
      const updated = await updateExpense(id, {
        expense_price: editingAmount.toFixed(2),
        expense_type: editingCategory,
        expense_date: editingDate,
        admin_id: "5779bb7e-5b77-4f0f-905b-4bde758059bf",
      });
      onExpensesUpdate(expenses.map((e) => (e.expense_id === id ? updated : e)));
      setEditingId(null);
    } catch (err: any) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณต้องการลบรายการนี้ใช่หรือไม่?")) return;
    setLoading(true);
    try {
      await deleteExpense(id);
      onExpensesUpdate(expenses.filter((e) => e.expense_id !== id));
    } catch (err: any) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newCategory || !newDate || newAmount <= 0) {
      alert("กรุณากรอกข้อมูลครบถ้วนและจำนวนเงินมากกว่า 0");
      return;
    }

    setLoading(true);
    try {
      const added = await createExpense({
        expense_type: newCategory,
        expense_price: newAmount.toFixed(2),
        expense_date: newDate,
        admin_id: "5779bb7e-5b77-4f0f-905b-4bde758059bf",
      });
      onExpensesUpdate([...expenses, added]);
      setNewAmount(0);
      setNewCategory("");
      setNewDate(new Date().toISOString().split("T")[0]);
    } catch (err: any) {
      alert("ไม่สามารถเพิ่มรายจ่ายได้: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow">
      <h3 className="font-semibold mb-2">รายจ่าย</h3>

      {/* กรองเดือน/ปี */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="ทั้งหมด">ทั้งหมด (ปี)</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="ทั้งหมด">ทั้งหมด (เดือน)</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Form เพิ่มรายการ */}
      <div className="flex gap-2 mb-4">
        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <input
          type="number"
          placeholder="จำนวนเงิน"
          value={newAmount}
          onChange={(e) => setNewAmount(Number(e.target.value))}
          className="border px-2 py-1 rounded"
        />
        <input
          type="text"
          placeholder="ประเภท"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button
          onClick={handleAdd}
          disabled={loading}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
        >
          เพิ่ม
        </button>
      </div>

      {/* ตาราง */}
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">วันที่</th>
            <th className="border px-2 py-1">จำนวนเงิน</th>
            <th className="border px-2 py-1">ประเภท</th>
            <th className="border px-2 py-1">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredExpenses.map((exp) => (
            <tr key={exp.expense_id}>
              <td className="border px-2 py-1">
                {editingId === exp.expense_id ? (
                  <input
                    type="date"
                    value={editingDate}
                    onChange={(e) => setEditingDate(e.target.value)}
                    className="w-full border px-1 py-0.5 rounded"
                  />
                ) : exp.expense_date}
              </td>
              <td className="border px-2 py-1">
                {editingId === exp.expense_id ? (
                  <input
                    type="number"
                    value={editingAmount}
                    onChange={(e) => setEditingAmount(Number(e.target.value))}
                    className="w-full border px-1 py-0.5 rounded"
                  />
                ) : Number(exp.expense_price).toLocaleString()}
              </td>
              <td className="border px-2 py-1">
                {editingId === exp.expense_id ? (
                  <input
                    type="text"
                    value={editingCategory}
                    onChange={(e) => setEditingCategory(e.target.value)}
                    className="w-full border px-1 py-0.5 rounded"
                  />
                ) : exp.expense_type}
              </td>
              <td className="border px-2 py-1 space-x-2">
                {editingId === exp.expense_id ? (
                  <button
                    disabled={loading}
                    onClick={() => handleSave(exp.expense_id)}
                    className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    บันทึก
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleEdit(exp)}
                      className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDelete(exp.expense_id)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      ลบ
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {filteredExpenses.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center text-gray-500 py-4">
                ไม่พบข้อมูลรายจ่าย
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseTable;
