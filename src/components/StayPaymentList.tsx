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
  payments: Payment[]; // ดึงบิลทั้งหมดของ stay
  paymentSlips: Record<string, PaymentSlip[]>;
}

const BASE_URL = "http://localhost:5000";
const PAYMENTS_PER_PAGE = 10; // จำนวนบิลต่อหน้า

const StayPaymentList = ({
  stay,
  adminId,
  adminUsername,
  onClose,
  refreshPayments,
  payments,
  paymentSlips
}: StayPaymentListProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const handleDelete = async (paymentId: string) => {
    if (!confirm("คุณต้องการลบบิลนี้หรือไม่?")) return;
    try {
      await deletePaymentAction(paymentId);
      refreshPayments();
    } catch (err: any) {
      alert(err.message || "ไม่สามารถลบบิลได้");
    }
  };

  const handleMarkPaid = async (p: Payment) => {
    try {
      const updated = { ...p, payment_status: PaymentStatus.Paid };
      await updatePaymentAction(updated);
      refreshPayments();
    } catch (err: any) {
      alert("ไม่สามารถยืนยันการชำระได้: " + err.message);
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.Paid:
        return <span className="text-white bg-green-500 px-2 py-1 rounded">จ่ายแล้ว</span>;
      case PaymentStatus.Unpaid:
      default:
        return <span className="text-white bg-red-500 px-2 py-1 rounded">ยังไม่จ่าย</span>;
    }
  };

  // เรียงบิลจากใหม่ → เก่า
  const sortedPayments = [...payments].sort(
    (a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
  );

  const totalPages = Math.ceil(sortedPayments.length / PAYMENTS_PER_PAGE);
  const currentPayments = sortedPayments.slice(
    (currentPage - 1) * PAYMENTS_PER_PAGE,
    currentPage * PAYMENTS_PER_PAGE
  );

  return (
    <div className="bg-white p-4 rounded shadow-lg mt-4 max-h-[500px] overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">บิลของ {stay.user_name} ห้อง {stay.room_num}</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">ปิด</button>
      </div>

      {sortedPayments.length === 0 ? (
        <p>ยังไม่มีบิลสำหรับ stay นี้</p>
      ) : (
        <>
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
              {currentPayments.map(p => (
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
                    <button
                      onClick={() => handleDelete(p.payment_id)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                    >
                      ลบ
                    </button>
                    {p.payment_status !== PaymentStatus.Paid && (
                      <button
                        onClick={() => handleMarkPaid(p)}
                        className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-1 px-3 rounded text-xs"
                      >
                        อัพเดทสถานะบิล
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                ก่อนหน้า
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-2 py-1 rounded ${currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                ถัดไป
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StayPaymentList;
