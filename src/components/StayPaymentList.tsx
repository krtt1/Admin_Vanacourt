"use client";

import { useState } from "react";
import { Payment, Stay, PaymentStatus, PaymentSlip } from "@/types/payment";
import { updatePaymentAction, deletePaymentAction } from "@/app/(dashboard)/payment/paymentAction";

interface StayPaymentListProps {
  stay: Stay;
  adminId: string;
  adminUsername: string;
  onClose: () => void;
  refreshPayments: () => void;
  payments: Payment[];
  paymentSlips: Record<string, PaymentSlip[]>;
}

const BASE_URL = "http://localhost:5000";

const StayPaymentList = ({
  stay,
  adminId,
  adminUsername,
  onClose,
  refreshPayments,
  payments,
  paymentSlips
}: StayPaymentListProps) => {
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

  const handleDelete = async (paymentId: string) => {
    if (!confirm("คุณต้องการลบบิลนี้หรือไม่?")) return;
    try {
      await deletePaymentAction(paymentId);
      refreshPayments();
    } catch (err: any) {
      alert(err.message || "ไม่สามารถลบบิลได้");
    }
  };

  const handleSaveEdit = async (updatedPayment: Payment) => {
    try {
      await updatePaymentAction(updatedPayment);
      setEditingPayment(null);
      refreshPayments();
    } catch (err: any) {
      alert(err.message || "ไม่สามารถแก้ไขบิลได้");
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.Paid:
        return <span className="text-white bg-green-500 px-2 py-1 rounded">จ่ายแล้ว</span>;
      case PaymentStatus.Processing:
        return <span className="text-white bg-yellow-500 px-2 py-1 rounded">กำลังดำเนินการ</span>;
      case PaymentStatus.Unpaid:
      default:
        return <span className="text-white bg-red-500 px-2 py-1 rounded">ยังไม่จ่าย</span>;
    }
  };

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
              <th className="py-2 px-3 text-left">สลิป</th>
              <th className="py-2 px-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.payment_id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-2 px-3">{new Date(p.payment_date).toLocaleDateString('th-TH')}</td>
                <td className="py-2 px-3">{p.payment_total}</td>
                <td className="py-2 px-3">{getStatusBadge(p.payment_status)}</td>
                <td className="py-2 px-3">
                  {paymentSlips[p.payment_id]?.length
                    ? paymentSlips[p.payment_id].map(slip => (
                        <div key={slip.slip_id}>
                          <a href={`${BASE_URL}${slip.slip_url}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                            ดูสลิป
                          </a>
                        </div>
                      ))
                    : "สลิปหาย"}
                </td>
                <td className="py-2 px-3 text-center flex justify-center gap-2">
                  {p.payment_status !== PaymentStatus.Paid && (
                    <button
                      onClick={() => setEditingPayment(p)}
                      className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-xs"
                    >
                      แก้ไข
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(p.payment_id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                  >
                    ลบ
                  </button>
                  {p.payment_status !== PaymentStatus.Paid && (
                    <button
                      onClick={async () => {
                        try {
                          const updated = { ...p, payment_status: PaymentStatus.Paid };
                          await updatePaymentAction(updated);
                          refreshPayments();
                        } catch (err: any) {
                          alert("ไม่สามารถยืนยันการชำระได้: " + err.message);
                        }
                      }}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-xs"
                    >
                      จ่ายแล้ว
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editingPayment && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h4 className="font-bold mb-2">แก้ไขบิล (เปลี่ยนสถานะ)</h4>
          <div className="flex flex-col gap-2">
            <label>
              สถานะ:
              <select
                value={editingPayment.payment_status}
                onChange={e => setEditingPayment({ ...editingPayment, payment_status: Number(e.target.value) })}
                className="border px-2 py-1 rounded w-full"
              >
                <option value={PaymentStatus.Unpaid}>ยังไม่จ่าย</option>
                <option value={PaymentStatus.Processing}>กำลังดำเนินการ</option>
                <option value={PaymentStatus.Paid}>จ่ายแล้ว</option>
              </select>
            </label>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => editingPayment && handleSaveEdit(editingPayment)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
              >
                บันทึก
              </button>
              <button
                onClick={() => setEditingPayment(null)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StayPaymentList;
