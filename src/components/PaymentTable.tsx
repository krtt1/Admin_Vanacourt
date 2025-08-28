"use client";

import { useState, useEffect } from "react";
import { Stay, BillType, PaymentData, Payment, PaymentStatus } from "@/types/payment";
import { 
  getAllStaysForPayment, 
  getAllBillTypes, 
  createPaymentAction, 
  getAllPayments 
} from "@/app/(dashboard)/payment/paymentAction";
import PaymentForm from "./PaymentForm";
import StayPaymentList from "./StayPaymentList";

interface PaymentTableProps {
  adminId: string;
  adminUsername: string;
}

const PaymentTable = ({ adminId, adminUsername }: PaymentTableProps) => {
  const [stays, setStays] = useState<Stay[]>([]);
  const [billTypes, setBillTypes] = useState<BillType[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedStay, setSelectedStay] = useState<Stay | null>(null);
  const [expandedStayId, setExpandedStayId] = useState<string | null>(null);
  const [loadingMap, setLoadingMap] = useState<{ [key: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(true);

  // ดึง stays และ bill types
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [staysData, billTypesData] = await Promise.all([
        getAllStaysForPayment(),
        getAllBillTypes()
      ]);
      setStays(staysData);
      setBillTypes(billTypesData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ดึง payments
  const fetchPayments = async () => {
    try {
      const allPayments = await getAllPayments();
      const filtered = allPayments.filter(p => {
        const d = new Date(p.payment_date);
        return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
      });
      setPayments(filtered);
    } catch (err) {
      console.error(err);
      setPayments([]);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [selectedMonth, selectedYear]);

  // สร้าง Payment ใหม่
  const handleCreatePayment = async (paymentData: PaymentData) => {
    if (!selectedStay) return;

    setLoadingMap(prev => ({ ...prev, [selectedStay.stay_id]: true }));
    try {
      const newPayment: PaymentData = {
        ...paymentData,
        stay_id: selectedStay.stay_id,
        admin_id: adminId,
        
      };
      
      const res = await createPaymentAction(newPayment);
      if (!res.success) throw new Error(res.message);

      setSelectedStay(null);
      await fetchPayments(); // รีเฟรช payments
    } catch (err: any) {
      alert(err.message || "สร้างบิลไม่สำเร็จ");
    } finally {
      setLoadingMap(prev => ({ ...prev, [selectedStay!.stay_id]: false }));
    }
  };

  const toggleExpand = (stayId: string) => {
    setExpandedStayId(expandedStayId === stayId ? null : stayId);
  };

  const getPaymentStatusByStay = (stayId: string) => {
    const payment = payments.find(p => p.stay_id === stayId);
    if (!payment) return "ยังไม่ได้สร้างบิล";
    switch (payment.payment_status) {
      case PaymentStatus.Paid: return "จ่ายแล้ว";
      case PaymentStatus.Processing: return "กำลังดำเนินการ";
      default: return "ยังไม่จ่าย";
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
      <div className="flex gap-2 mb-4">
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(Number(e.target.value))}
          className="border rounded px-2 py-1"
        >
          {[...Array(12)].map((_, i) => (
            <option key={i+1} value={i+1}>{i+1}</option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={e => setSelectedYear(Number(e.target.value))}
          className="border rounded px-2 py-1"
        >
          {[2023, 2024, 2025].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
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
            <th className="py-3 px-6 text-center">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {stays.map(stay => (
            <>
              <tr key={stay.stay_id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-6">{stay.user_name}</td>
                <td className="py-3 px-6">{stay.room_num}</td>
                <td className="py-3 px-6">{stay.stay_date}</td>
                <td className="py-3 px-6">{getStayStatusText(stay.stay_status)}</td>
                <td className="py-3 px-6">{getPaymentStatusByStay(stay.stay_id)}</td>
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

              {expandedStayId === stay.stay_id && (
                <tr className="bg-gray-50 border-b border-gray-200">
                  <td colSpan={6} className="py-3 px-6">
                    <StayPaymentList
                      stay={stay}
                      adminId={adminId}
                      adminUsername={adminUsername}
                      onClose={() => setExpandedStayId(null)}
                      refreshPayments={fetchPayments} // เพิ่ม prop สำหรับรีเฟรช
                    />
                  </td>
                </tr>
              )}
            </>
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
