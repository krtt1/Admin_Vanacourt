"use client";

import { useState } from "react";
import { Stay, BillType, PaymentData } from "@/types/payment";

interface PaymentFormProps {
  stay: Stay;
  adminId: string;
  adminUsername: string;
  billTypes: BillType[];
  onSubmit: (paymentData: PaymentData) => void;
  onCancel: () => void;
}

const PaymentForm = ({ stay, adminId, adminUsername, billTypes, onSubmit, onCancel }: PaymentFormProps) => {
  const [waterAmount, setWaterAmount] = useState<number>(0);
  const [eleAmount, setEleAmount] = useState<number>(0);
  const [otherPayment, setOtherPayment] = useState<number>(0);
  const [otherPaymentDetail, setOtherPaymentDetail] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState<string>('1'); // ✅ defaultValue
  const [step, setStep] = useState<1 | 2>(1);

  const statusMap: Record<string, string> = {
    "0": "ค้างชำระ",
    "1": "กำลังดำเนินการ",
    "2": "ชำระแล้ว",
  };

  const waterPrice = billTypes.find(b => b.bill_type.includes("น้ำ"))?.billtype_price || 0;
  const elePrice = billTypes.find(b => b.bill_type.includes("ไฟ"))?.billtype_price || 0;
  const roomPrice = 3500;

  const waterTotal = waterAmount * waterPrice;
  const eleTotal = eleAmount * elePrice;
  const totalPrice = roomPrice + waterTotal + eleTotal + otherPayment;

  const handleNext = () => {
    if (waterAmount < 0 || eleAmount < 0 || otherPayment < 0) {
      alert("จำนวนหน่วยหรือค่าใช้จ่ายต้องไม่เป็นลบ");
      return;
    }
    setStep(2);
  };

  const handleConfirm = () => {
    const paymentData: PaymentData = {
      stay_id: stay.stay_id,
      admin_id: adminId,
      water_amount: waterAmount,
      ele_amount: eleAmount,
      payment_date: paymentDate, // ✅ ใช้ค่า string จาก input
      other_payment: otherPayment,
      other_payment_detail: otherPaymentDetail,
      status, // ✅ ส่งตาม state
    };
    onSubmit(paymentData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onCancel}>
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg" onClick={(e) => e.stopPropagation()}>
        {step === 1 && (
          <>
            <h2 className="text-lg font-bold mb-4">สร้างบิลชำระ</h2>
            <p>ผู้แจ้งบิล: {adminUsername}</p>
            <p>ห้องพัก: {stay.room_num}</p>

            <label className="block mt-2">
              จำนวนหน่วยน้ำ:
              <input type="number" value={waterAmount} onChange={(e) => setWaterAmount(Number(e.target.value))} className="border rounded w-full mt-1 px-2 py-1" />
            </label>

            <label className="block mt-2">
              จำนวนหน่วยไฟ:
              <input type="number" value={eleAmount} onChange={(e) => setEleAmount(Number(e.target.value))} className="border rounded w-full mt-1 px-2 py-1" />
            </label>

            <label className="block mt-2">
              ค่าใช้จ่ายอื่น ๆ:
              <input type="number" value={otherPayment} onChange={(e) => setOtherPayment(Number(e.target.value))} className="border rounded w-full mt-1 px-2 py-1" />
            </label>

            <label className="block mt-2">
              รายละเอียดค่าใช้จ่ายอื่น ๆ:
              <input type="text" value={otherPaymentDetail} onChange={(e) => setOtherPaymentDetail(e.target.value)} className="border rounded w-full mt-1 px-2 py-1" />
            </label>

            <label className="block mt-2">
              วันที่เรียกชำระ:
              <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="border rounded w-full mt-1 px-2 py-1" />
            </label>

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={handleNext} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">ถัดไป</button>
              <button onClick={onCancel} className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400">ยกเลิก</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-lg font-bold mb-4">สรุปบิลชำระ</h2>
            <p>ผู้แจ้งบิล: {adminUsername}</p>
            <p>ห้องพัก: {stay.room_num}</p>
            <p>ค่าห้องพัก: {roomPrice.toLocaleString()}</p>
            <p>จำนวนหน่วยน้ำ: {waterAmount} x {waterPrice} = {waterTotal.toLocaleString()}</p>
            <p>จำนวนหน่วยไฟ: {eleAmount} x {elePrice} = {eleTotal.toLocaleString()}</p>
            <p>ค่าใช้จ่ายอื่น ๆ: {otherPayment.toLocaleString()} ({otherPaymentDetail || "-"})</p>
            <p>ราคารวมทั้งหมด: {totalPrice.toLocaleString()}</p>
            <p>วันที่เรียกชำระ: {paymentDate}</p>
            <p>สถานะเริ่มต้น: {statusMap[status]}</p>

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={handleConfirm} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">ยืนยัน</button>
              <button onClick={() => setStep(1)} className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400">ย้อนกลับ</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentForm;
