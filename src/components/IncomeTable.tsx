"use client";

import { useState } from "react";
import { Income } from "@/types/finance";
import { createIncome, deleteIncome } from "@/lib/api";

interface Props {
  incomes: Income[];
  onIncomesUpdate: (incomes: Income[]) => void;
}

const IncomeTable = ({ incomes, onIncomesUpdate }: Props) => {
  const [newIncome, setNewIncome] = useState({ income_type: "", income_amount: "", income_date: "" });

  const handleAdd = async () => {
    if (!newIncome.income_type || !newIncome.income_amount || !newIncome.income_date) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    try {
      const created = await createIncome({
        income_type: newIncome.income_type,
        income_amount: Number(newIncome.income_amount),
        income_date: newIncome.income_date,
      });

      onIncomesUpdate([...incomes, created]);
      setNewIncome({ income_type: "", income_amount: "", income_date: "" });
    } catch (err: any) {
      console.error("ไม่สามารถเพิ่มรายรับได้:", err.message);
      alert("ไม่สามารถเพิ่มรายรับได้: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ลบรายการนี้?")) return;
    await deleteIncome(id);
    onIncomesUpdate(incomes.filter((i) => i.income_id !== id));
  };

  return (
    <div className="mt-4">
      <table className="w-full border">
        <thead>
          <tr>
            <th>ประเภท</th>
            <th>จำนวนเงิน</th>
            <th>วันที่</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {incomes.map((i) => (
            <tr key={i.income_id}>
              <td>{i.income_type}</td>
              <td>{i.income_amount}</td>
              <td>{i.income_date}</td>
              <td>
                <button onClick={() => handleDelete(i.income_id)} className="px-2 py-1 bg-red-500 text-white rounded">ลบ</button>
              </td>
            </tr>
          ))}
          <tr>
            <td>
              <input type="text" value={newIncome.income_type} onChange={(e) => setNewIncome({ ...newIncome, income_type: e.target.value })} placeholder="ประเภท" />
            </td>
            <td>
              <input type="number" value={newIncome.income_amount} onChange={(e) => setNewIncome({ ...newIncome, income_amount: e.target.value })} placeholder="จำนวนเงิน" />
            </td>
            <td>
              <input type="date" value={newIncome.income_date} onChange={(e) => setNewIncome({ ...newIncome, income_date: e.target.value })} />
            </td>
            <td>
              <button onClick={handleAdd} className="px-2 py-1 bg-green-500 text-white rounded">เพิ่ม</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default IncomeTable;
