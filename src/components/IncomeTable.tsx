"use client";

import { useEffect, useState } from "react";

export interface IncomeItem {
  income_id: string;
  income_amount: number;
  income_date: string;
  income_type: "room" | "other";
  description?: string;
}

export interface Payment {
  payment_id: string;
  stay_id: string;
  admin_name: string;
  user_id: string;
  user_name: string;
  room_num: string;
  water_amount: string;
  water_price: string;
  ele_amount: string;
  ele_price: string;
  other_payment?: string;
  other_payment_detail?: string;
  payment_total: string;
  payment_date: string;
  payment_status: string;
}

const BASE_URL = "http://localhost:5000";
const PAYMENTS_PER_PAGE = 10;

const IncomeTable = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [incomeItems, setIncomeItems] = useState<IncomeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter states
  const [filterMonth, setFilterMonth] = useState<string>("");
  const [filterYear, setFilterYear] = useState<string>("");
  const [filterType, setFilterType] = useState<"all" | "room" | "other">("all");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch(`${BASE_URL}/payments/getall`);
        if (!res.ok) throw new Error("Fetch payments failed");
        const data: Payment[] = await res.json();
        setPayments(data);
      } catch (err: any) {
        console.error("Fetch payments error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  useEffect(() => {
    const items: IncomeItem[] = payments.flatMap((p) => {
      const arr: IncomeItem[] = [];

      const roomAmount =
        parseFloat(p.payment_total) -
        (p.other_payment ? parseFloat(p.other_payment) : 0);

      if (roomAmount > 0) {
        arr.push({
          income_id: p.payment_id + "-room",
          income_date: p.payment_date,
          income_type: "room",
          income_amount: roomAmount,
          description: `ห้อง ${p.room_num} (${p.user_name})`,
        });
      }

      if (p.other_payment && parseFloat(p.other_payment) > 0) {
        arr.push({
          income_id: p.payment_id + "-other",
          income_date: p.payment_date,
          income_type: "other",
          income_amount: parseFloat(p.other_payment),
          description: p.other_payment_detail,
        });
      }

      return arr;
    });

    // Apply filters
    const filtered = items.filter((item) => {
      const date = new Date(item.income_date);
      const monthMatch = filterMonth ? date.getMonth() + 1 === parseInt(filterMonth) : true;
      const yearMatch = filterYear ? date.getFullYear() === parseInt(filterYear) : true;
      const typeMatch = filterType !== "all" ? item.income_type === filterType : true;
      return monthMatch && yearMatch && typeMatch;
    });

    setIncomeItems(filtered);
    setCurrentPage(1);
  }, [payments, filterMonth, filterYear, filterType]);

  const totalPages = Math.ceil(incomeItems.length / PAYMENTS_PER_PAGE);
  const currentItems = incomeItems.slice(
    (currentPage - 1) * PAYMENTS_PER_PAGE,
    currentPage * PAYMENTS_PER_PAGE
  );

  const totalIncome = incomeItems.reduce((sum, item) => sum + item.income_amount, 0);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="bg-white p-4 rounded shadow-lg mt-4 max-h-[600px] overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">รายรับ</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <div>
          <label className="mr-2 text-sm font-semibold">เดือน:</label>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="">ทั้งหมด</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mr-2 text-sm font-semibold">ปี:</label>
          <input
            type="number"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            placeholder="เช่น 2025"
            className="border border-gray-300 rounded px-2 py-1 text-sm w-20"
          />
        </div>

        <div>
          <label className="mr-2 text-sm font-semibold">ประเภท:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="all">ทั้งหมด</option>
            <option value="room">ค่าห้อง</option>
            <option value="other">อื่น ๆ</option>
          </select>
        </div>
      </div>

      {incomeItems.length === 0 ? (
        <p>ยังไม่มีข้อมูลรายรับ</p>
      ) : (
        <>
          <table className="min-w-full border border-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-3 text-left">วันที่</th>
                <th className="py-2 px-3 text-left">ประเภท</th>
                <th className="py-2 px-3 text-left">รายละเอียด</th>
                <th className="py-2 px-3 text-right">จำนวนเงิน</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => (
                <tr
                  key={item.income_id}
                  className={`border-b border-gray-200 hover:bg-gray-50 ${
                    item.income_type === "room" ? "bg-green-50" : "bg-yellow-50"
                  }`}
                >
                  <td className="py-2 px-3">{item.income_date}</td>
                  <td className="py-2 px-3 font-semibold">
                    {item.income_type === "room" ? "ค่าห้อง" : "อื่น ๆ"}
                  </td>
                  <td className="py-2 px-3">{item.description}</td>
                  <td className="py-2 px-3 text-right">
                    {item.income_amount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                ก่อนหน้า
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-2 py-1 rounded ${
                    currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                ถัดไป
              </button>
            </div>
          )}

          {/* Total */}
          <div className="mt-4 font-bold text-right">
            รวมทั้งหมด:{" "}
            {totalIncome.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default IncomeTable;
