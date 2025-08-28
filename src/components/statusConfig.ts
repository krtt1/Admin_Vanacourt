// src/components/payment/statusConfig.ts
export const statusMap: Record<string, string> = {
  "0": "ยังไม่จ่าย",
  "1": "กำลังดำเนินการ",
  "2": "ชำระแล้ว",
};

export const statusColorMap: Record<string, string> = {
  "0": "text-red-500",
  "1": "text-yellow-500",
  "2": "text-green-500",
};
