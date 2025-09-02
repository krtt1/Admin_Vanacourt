// PaymentTable.tsx
"use client";

import { useState, useEffect } from "react";
import { Stay, BillType, Payment, PaymentStatus, PaymentSlip } from "@/types/payment";
import {
  getAllStaysForPayment,
  getAllBillTypes,
  getAllPayments,
  getSlipsByPayment,
  createPaymentAction,
  updatePaymentAction
} from "@/app/(dashboard)/payment/paymentAction";
import PaymentForm from "./PaymentForm";
import StayPaymentList from "./StayPaymentList";

interface PaymentTableProps {
  adminId: string;
  adminUsername: string;
}

const BASE_URL = "http://localhost:5000";

const PaymentTable = ({ adminId, adminUsername }: PaymentTableProps) => {
  const [stays, setStays] = useState<Stay[]>([]);
  const [billTypes, setBillTypes] = useState<BillType[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentSlipsMap, setPaymentSlipsMap] = useState<Record<string, PaymentSlip[]>>({});
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedStay, setSelectedStay] = useState<Stay | null>(null);
  const [expandedStayId, setExpandedStayId] = useState<string | null>(null);
  const [loadingMap, setLoadingMap] = useState<{ [key: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [staysData, billTypesData] = await Promise.all([getAllStaysForPayment(), getAllBillTypes()]);
      setStays(staysData);
      setBillTypes(billTypesData);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const allPayments = await getAllPayments();
      const filtered = allPayments.filter(p => {
        const d = new Date(p.payment_date);
        return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
      });
      setPayments(filtered);

      const slipsMap: Record<string, PaymentSlip[]> = {};
      await Promise.all(
        filtered.map(async (p) => {
          const slips = await getSlipsByPayment(p.payment_id);
          const validSlips: PaymentSlip[] = [];
          for (const s of slips) {
            try {
              const res = await fetch(`${BASE_URL}${s.slip_url}`, { method: "HEAD" });
              if (res.ok) validSlips.push(s);
            } catch {}
          }
          slipsMap[p.payment_id] = validSlips;
        })
      );
      setPaymentSlipsMap(slipsMap);
    } catch (err) {
      console.error(err);
      setPayments([]);
    }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { fetchPayments(); }, [selectedMonth, selectedYear]);

  const handleCreatePayment = async (paymentData: any) => {
    if (!selectedStay) return;
    setLoadingMap(prev => ({ ...prev, [selectedStay.stay_id]: true }));
    try {
      const newPayment = { 
        ...paymentData, 
        stay_id: selectedStay.stay_id, 
        admin_id: "5779bb7e-5b77-4f0f-905b-4bde758059bf" // ใช้ hardcode
      };
      const res = await createPaymentAction(newPayment);
      if (!res.success) throw new Error(res.message);
      setSelectedStay(null);
      await fetchPayments();
    } catch (err: any) {
      alert(err.message || "สร้างบิลไม่สำเร็จ");
    } finally {
      setLoadingMap(prev => ({ ...prev, [selectedStay!.stay_id]: false }));
    }
  };

  const toggleExpand = (stayId: string) => {
    setExpandedStayId(expandedStayId === stayId ? null : stayId);
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

  const getStayStatusText = (status: number) => {
    switch (status) {
      case 0: return "เข้าพัก";
      case 1: return "กำลังเข้าพัก";
      default: return "-";
    }
  };

  if (isLoading) return <p>กำลังโหลดข้อมูล...</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      {/* เลือกเดือน/ปี */}
      <div className="flex gap-2 mb-4">
        <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className="border rounded px-2 py-1">
          {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
        </select>
        <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="border rounded px-2 py-1">
          {[2023, 2024, 2025].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <table className="min-w-full border border-gray-200">
        <thead>
          <tr className="bg-gray-100 text-gray-600 uppercase text-sm">
            <th className="py-3 px-6 text-left">ผู้ใช้</th>
            <th className="py-3 px-6 text-left">ห้อง</th>
            <th className="py-3 px-6 text-left">วันที่เข้าพัก</th>
            <th className="py-3 px-6 text-left">สถานะเข้าพัก</th>
            <th className="py-3 px-6 text-left">สถานะบิล</th>
            <th className="py-3 px-6 text-left">สลิป</th>
            <th className="py-3 px-6 text-center">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {stays.map(stay => {
            const stayPayments = payments.filter(p => p.stay_id === stay.stay_id);
            return (
              <tr key={stay.stay_id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-6">{stay.user_name}</td>
                <td className="py-3 px-6">{stay.room_num}</td>
                <td className="py-3 px-6">{stay.stay_date}</td>
                <td className="py-3 px-6">{getStayStatusText(stay.stay_status)}</td>
                <td className="py-3 px-6 flex items-center gap-2">
                  {stayPayments.length > 0
                    ? stayPayments.map(p => (
                        <div key={p.payment_id} className="flex items-center gap-2">
                          {getStatusBadge(p.payment_status)}
                          {p.payment_status !== PaymentStatus.Paid && (
                            <button
                              onClick={async () => {
                                try {
                                  const updated = { ...p, payment_status: PaymentStatus.Paid };
                                  await updatePaymentAction(updated);
                                  await fetchPayments();
                                } catch (err: any) {
                                  alert("ไม่สามารถยืนยันการชำระได้: " + err.message);
                                }
                              }}
                              className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-xs"
                            >
                              จ่ายแล้ว
                            </button>
                          )}
                        </div>
                      ))
                    : <span className="text-gray-500">ยังไม่ได้สร้างบิล</span>
                  }
                </td>
                <td className="py-3 px-6">
                  {stayPayments.map(p => paymentSlipsMap[p.payment_id]?.length
                    ? paymentSlipsMap[p.payment_id].map((slip, idx) => (
                        <div key={idx}>
                          <a href={`${BASE_URL}${slip.slip_url}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                            ดูสลิป
                          </a>
                        </div>
                      ))
                    : "ยังไม่มีสลิป"
                  )}
                </td>
                <td className="py-3 px-6 text-center flex justify-center gap-2">
                  <button
                    onClick={() => setSelectedStay(stay)}
                    disabled={loadingMap[stay.stay_id]}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-xs"
                  >
                    {loadingMap[stay.stay_id] ? "กำลังสร้าง..." : "สร้างใบชำระ"}
                  </button>
                  <button
                    onClick={() => toggleExpand(stay.stay_id)}
                    className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-3 rounded text-xs"
                  >
                    {expandedStayId === stay.stay_id ? "ซ่อนสถานะ" : "ดูสถานะบิล"}
                  </button>
                </td>
              </tr>
            );
          })}

          {expandedStayId &&
            stays
              .filter(s => s.stay_id === expandedStayId)
              .map(stay => (
                <tr key={"expanded-" + stay.stay_id} className="bg-gray-50 border-b border-gray-200">
                  <td colSpan={7} className="py-3 px-6">
                    <StayPaymentList
                      stay={stay}
                      adminId={adminId}
                      adminUsername={adminUsername}
                      onClose={() => setExpandedStayId(null)}
                      refreshPayments={fetchPayments}
                      payments={payments.filter(p => p.stay_id === stay.stay_id)}
                      paymentSlips={paymentSlipsMap}
                    />
                  </td>
                </tr>
              ))}
        </tbody>
      </table>

      {selectedStay && billTypes.length > 0 && (
        <PaymentForm
          stay={selectedStay}
          adminId={adminId}
          billTypes={billTypes}
          adminUsername={adminUsername}
          onSubmit={handleCreatePayment}
          onCancel={() => setSelectedStay(null)}
        />
      )}
    </div>
  );
};

export default PaymentTable;
