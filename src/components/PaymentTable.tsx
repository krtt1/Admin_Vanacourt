"use client";

import { useState, useEffect } from "react";
import { Stay, BillType, PaymentData, PaymentStatus } from "@/types/payment";
import { getAllStaysForPayment, getAllBillTypes, createPaymentAction } from "@/app/(dashboard)/payment/paymentAction";
import PaymentForm from "./PaymentForm";
import StayPaymentList from "./StayPaymentList";

interface PaymentTableProps {
  adminId: string;
  adminUsername: string;
}

const PaymentTable = ({ adminId, adminUsername }: PaymentTableProps) => {
  const [stays, setStays] = useState<Stay[]>([]);
  const [billTypes, setBillTypes] = useState<BillType[]>([]);
  const [selectedStay, setSelectedStay] = useState<Stay | null>(null);
  const [viewStay, setViewStay] = useState<Stay | null>(null);
  const [loadingMap, setLoadingMap] = useState<{ [key: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(true);

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

  const handleCreatePayment = async (paymentData: PaymentData) => {
    if (!selectedStay) return;

    setLoadingMap(prev => ({ ...prev, [selectedStay.stay_id]: true }));
    try {
      // ตั้งสถานะ default เป็น Processing (1)
      const newPayment: PaymentData = {
        ...paymentData,
        status: PaymentStatus.Processing
      };
      await createPaymentAction(newPayment);
      setSelectedStay(null);
    } catch (err: any) {
      alert(err.message || "สร้างบิลไม่สำเร็จ");
    } finally {
      setLoadingMap(prev => ({ ...prev, [selectedStay!.stay_id]: false }));
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
      <table className="min-w-full border border-gray-200">
        <thead>
          <tr className="bg-gray-100 text-gray-600 uppercase text-sm">
            <th className="py-3 px-6 text-left">ผู้ใช้</th>
            <th className="py-3 px-6 text-left">ห้อง</th>
            <th className="py-3 px-6 text-left">วันที่เข้าพัก</th>
            <th className="py-3 px-6 text-left">สถานะเข้าพัก</th>
            <th className="py-3 px-6 text-center">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {stays.map(stay => (
            <tr key={stay.stay_id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-3 px-6">{stay.user_name}</td>
              <td className="py-3 px-6">{stay.room_num}</td>
              <td className="py-3 px-6">{stay.stay_date}</td>
              <td className="py-3 px-6">{getStayStatusText(stay.stay_status)}</td>
              <td className="py-3 px-6 text-center flex justify-center gap-2">
                <button
                  onClick={() => setSelectedStay(stay)}
                  disabled={loadingMap[stay.stay_id]}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-xs"
                >
                  {loadingMap[stay.stay_id] ? "กำลังสร้าง..." : "สร้างใบชำระ"}
                </button>
                <button
                  onClick={() => setViewStay(stay)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-xs"
                >
                  ดูบิล
                </button>
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

      {viewStay && (
        <StayPaymentList
          stay={viewStay}
          adminId={adminId}
          adminUsername={adminUsername}
          onClose={() => setViewStay(null)}
        />
      )}
    </div>
  );
};

export default PaymentTable;
