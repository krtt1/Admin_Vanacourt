"use client";

import { useState, useEffect } from "react";
import { Payment, Stay, PaymentStatus, BillType } from "@/types/payment";
import { getAllPayments, updatePaymentAction, deletePaymentAction, getAllBillTypes } from "@/app/(dashboard)/payment/paymentAction";

interface StayPaymentListProps {
  stay: Stay;
  adminId: string;
  adminUsername: string;
  onClose: () => void;
}

const StayPaymentList = ({ stay, adminId, adminUsername, onClose }: StayPaymentListProps) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [billTypes, setBillTypes] = useState<BillType[]>([]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const allPayments = await getAllPayments();
      const stayPayments = allPayments.filter(p => p.stay_id === stay.stay_id);
      setPayments(stayPayments);
    } catch (err: any) {
      setError(err.message || "Cannot fetch payments");
    } finally {
      setLoading(false);
    }
  };

  const fetchBillTypes = async () => {
    const types = await getAllBillTypes();
    setBillTypes(types);
  };

  useEffect(() => {
    fetchPayments();
    fetchBillTypes();
  }, [stay.stay_id]);

  const handleDelete = async (paymentId: string) => {
    if (!confirm("คุณต้องการลบบิลนี้หรือไม่?")) return;
    try {
      await deletePaymentAction(paymentId);
      setPayments(prev => prev.filter(p => p.payment_id !== paymentId));
    } catch (err: any) {
      alert(err.message || "Cannot delete payment");
    }
  };

  const handleSaveEdit = async (updatedPayment: Payment) => {
    try {
      await updatePaymentAction(updatedPayment);
      setPayments(prev => prev.map(p => p.payment_id === updatedPayment.payment_id ? updatedPayment : p));
      setEditingPayment(null);
    } catch (err: any) {
      alert(err.message || "ไม่สามารถแก้ไขบิลได้");
    }
  };

  if (loading) return <p>กำลังโหลดบิล...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white p-4 rounded shadow-lg mt-4">
      <h3 className="font-bold mb-2">บิลของ {stay.user_name} ห้อง {stay.room_num}</h3>

      {payments.length === 0 ? (
        <p>ยังไม่มีบิลสำหรับ stay นี้</p>
      ) : (
        <table className="min-w-full border border-gray-200 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-3 text-left">วันที่</th>
              <th className="py-2 px-3 text-left">รวม</th>
              <th className="py-2 px-3 text-left">สถานะ</th>
              <th className="py-2 px-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.payment_id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-2 px-3">{p.payment_date}</td>
                <td className="py-2 px-3">{p.payment_total}</td>
                <td className="py-2 px-3">
                  {p.payment_status === PaymentStatus.Paid
                    ? "จ่ายแล้ว"
                    : p.payment_status === PaymentStatus.Processing
                    ? "กำลังดำเนินการ"
                    : "ยังไม่จ่าย"}
                </td>
                <td className="py-2 px-3 text-center">
                  <button onClick={() => setEditingPayment(p)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-xs mr-2">
                    แก้ไข
                  </button>
                  <button onClick={() => handleDelete(p.payment_id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs">
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button onClick={onClose} className="mt-3 bg-gray-500 hover:bg-gray-700 text-white py-1 px-3 rounded text-sm">
        ปิด
      </button>

      {/* Edit Modal */}
      {editingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h3 className="font-bold mb-4">แก้ไขบิล {editingPayment.payment_id}</h3>
            <label className="block mb-2">
              น้ำ:
              <input
                type="number"
                value={editingPayment.water_amount}
                onChange={(e) => setEditingPayment({ ...editingPayment, water_amount: parseFloat(e.target.value) })}
                className="border rounded w-full mt-1 p-1"
              />
            </label>
            <label className="block mb-2">
              ไฟ:
              <input
                type="number"
                value={editingPayment.ele_amount}
                onChange={(e) => setEditingPayment({ ...editingPayment, ele_amount: parseFloat(e.target.value) })}
                className="border rounded w-full mt-1 p-1"
              />
            </label>
            <label className="block mb-2">
              อื่น ๆ:
              <input
                type="number"
                value={editingPayment.other_payment}
                onChange={(e) => setEditingPayment({ ...editingPayment, other_payment: parseFloat(e.target.value) })}
                className="border rounded w-full mt-1 p-1"
              />
            </label>
            <label className="block mb-4">
              สถานะ:
              <select
                value={editingPayment.payment_status}
                onChange={(e) => setEditingPayment({ ...editingPayment, payment_status: e.target.value as PaymentStatus })}
                className="border rounded w-full mt-1 p-1"
              >
                <option value={PaymentStatus.Unpaid}>ยังไม่จ่าย</option>
                <option value={PaymentStatus.Processing}>กำลังดำเนินการ</option>
                <option value={PaymentStatus.Paid}>จ่ายแล้ว</option>
              </select>
            </label>

            <div className="flex justify-end gap-2">
              <button onClick={() => setEditingPayment(null)} className="bg-gray-500 hover:bg-gray-700 text-white py-1 px-3 rounded">
                ยกเลิก
              </button>
              <button onClick={() => handleSaveEdit(editingPayment)} className="bg-green-500 hover:bg-green-700 text-white py-1 px-3 rounded">
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StayPaymentList;
