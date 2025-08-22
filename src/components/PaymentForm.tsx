"use client";

import { useState } from "react";
import { Stay, BillType, PaymentData } from "@/types/payment";

interface PaymentFormProps {
  stay: Stay;
  adminId: string;
  billTypes: BillType[];
  onSubmit: (paymentData: PaymentData) => void;
  onCancel: () => void;
}

const PaymentForm = ({ stay, adminId, billTypes, onSubmit, onCancel }: PaymentFormProps) => {
  const [waterAmount, setWaterAmount] = useState<number>(0);
  const [eleAmount, setEleAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [step, setStep] = useState<1 | 2>(1);

  // ดึงราคาบิลน้ำ/ไฟ
  const waterPrice = billTypes.find(b => b.bill_type.includes("น้ำ"))?.billtype_price || 0;
  const elePrice = billTypes.find(b => b.bill_type.includes("ไฟ"))?.billtype_price || 0;
  const roomPrice = stay.room_price ?? 3500; // ราคาห้องจาก stay

  // คำนวณรวม
  const waterTotal = waterAmount * waterPrice;
  const eleTotal = eleAmount * elePrice;
  const totalPrice = roomPrice + waterTotal + eleTotal;

  const handleNext = () => {
    if (waterAmount < 0 || eleAmount < 0) {
      alert("จำนวนหน่วยต้องไม่เป็นลบ");
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
      payment_date: paymentDate,
    };
    onSubmit(paymentData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
        {step === 1 && (
          <>
            <h2 className="text-lg font-bold mb-4">สร้างบิลชำระ</h2>
            <p>ผู้แจ้งบิล: {adminId}</p>
            <p>ห้องพัก: {stay.room_num}</p>

            <label className="block mt-2">
              จำนวนหน่วยน้ำ:
              <input
                type="number"
                value={waterAmount}
                onChange={(e) => setWaterAmount(Number(e.target.value))}
                className="border rounded w-full mt-1 px-2 py-1"
              />
            </label>

            <label className="block mt-2">
              จำนวนหน่วยไฟ:
              <input
                type="number"
                value={eleAmount}
                onChange={(e) => setEleAmount(Number(e.target.value))}
                className="border rounded w-full mt-1 px-2 py-1"
              />
            </label>

            <label className="block mt-2">
              วันที่เรียกชำระ:
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="border rounded w-full mt-1 px-2 py-1"
              />
            </label>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={handleNext}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                ถัดไป
              </button>
              <button
                onClick={onCancel}
                className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400"
              >
                ยกเลิก
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-lg font-bold mb-4">สรุปบิลชำระ</h2>
            <p>ผู้แจ้งบิล: {adminId}</p>
            <p>ห้องพัก: {stay.room_num}</p>
            <p>ค่าห้องพัก: {roomPrice.toLocaleString()}</p>
            <p>จำนวนหน่วยน้ำ: {waterAmount} x {waterPrice} = {waterTotal.toLocaleString()}</p>
            <p>จำนวนหน่วยไฟ: {eleAmount} x {elePrice} = {eleTotal.toLocaleString()}</p>
            <p>ราคารวมทั้งหมด: {totalPrice.toLocaleString()}</p>
            <p>วันที่เรียกชำระ: {paymentDate}</p>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={handleConfirm}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                ยืนยัน
              </button>
              <button
                onClick={() => setStep(1)}
                className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400"
              >
                ย้อนกลับ
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentForm;
