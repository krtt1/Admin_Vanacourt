"use client";

import { useState, useEffect } from "react";
import { Payment, Stay, PaymentStatus, BillType, PaymentSlip } from "@/types/payment";
import {
  getAllPayments,
  updatePaymentAction,
  deletePaymentAction,
  getAllBillTypes,
  getSlipsByPayment
} from "@/app/(dashboard)/payment/paymentAction";

interface StayPaymentListProps {
  stay: Stay;
  adminId: string;
  adminUsername: string;
  onClose: () => void;
  refreshPayments: () => void; // เพิ่ม prop
}

const BASE_URL = "http://localhost:5000";

const StayPaymentList = ({ stay, adminId, adminUsername, onClose, refreshPayments }: StayPaymentListProps) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentSlips, setPaymentSlips] = useState<Record<string, PaymentSlip[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [billTypes, setBillTypes] = useState<BillType[]>([]);

  const checkFileExists = async (url: string): Promise<boolean> => {
    try {
      const res = await fetch(`${BASE_URL}${url}`, { method: "HEAD" });
      return res.ok;
    } catch {
      return false;
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const allPayments = await getAllPayments();
      const stayPayments = allPayments.filter(p => p.stay_id === stay.stay_id);
      setPayments(stayPayments);

      const slipsMap: Record<string, PaymentSlip[]> = {};
      await Promise.all(
        stayPayments.map(async p => {
          const slips = await getSlipsByPayment(p.payment_id);
          const validSlips = [];
          for (const slip of slips) if (await checkFileExists(slip.slip_url)) validSlips.push(slip);
          slipsMap[p.payment_id] = validSlips;
        })
      );
      setPaymentSlips(slipsMap);
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
      setPaymentSlips(prev => {
        const copy = { ...prev };
        delete copy[paymentId];
        return copy;
      });
      refreshPayments(); // รีเฟรช PaymentTable
    } catch (err: any) {
      alert(err.message || "Cannot delete payment");
    }
  };

  const handleSaveEdit = async (updatedPayment: Payment) => {
    try {
      await updatePaymentAction(updatedPayment);
      setPayments(prev => prev.map(p => p.payment_id === updatedPayment.payment_id ? updatedPayment : p));
      setEditingPayment(null);
      refreshPayments(); // รีเฟรช PaymentTable
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
              <th className="py-2 px-3 text-left">สลิป</th>
              <th className="py-2 px-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.payment_id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-2 px-3">
                  {new Date(p.payment_date).toLocaleDateString('th-TH')}
                  </td>
                <td className="py-2 px-3">{p.payment_total}</td>
                <td className="py-2 px-3">
                  {p.payment_status === PaymentStatus.Paid
                    ? "จ่ายแล้ว"
                    : p.payment_status === PaymentStatus.Processing
                    ? "กำลังดำเนินการ"
                    : "ยังไม่จ่าย"}
                </td>
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
                  <button
                    onClick={() => setEditingPayment(p)}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-xs"
                  >
                    แก้ไข
                  </button>
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
                          setPayments(prev => prev.map(pay => pay.payment_id === p.payment_id ? updated : pay));
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
          <h4 className="font-bold mb-2">แก้ไขบิล</h4>
          <div className="flex flex-col gap-2">
            <label>
              จำนวนเงิน:
              <input
                type="number"
                value={editingPayment.payment_total}
                onChange={e => setEditingPayment({ ...editingPayment, payment_total: Number(e.target.value) })}
                className="border px-2 py-1 rounded w-full"
              />
            </label>
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
