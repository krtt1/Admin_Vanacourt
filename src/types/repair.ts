// src/types/repair.ts

export interface RepairItem {
  repair_id: string; // หรือ number ถ้า ID ใน DB เป็น number
  repair_date: string;
  repair_status: string | number; // Backend ส่งมาเป็น string หรือ number
  
  room_num: string | null; // Backend ส่ง room_num มาตรงๆ
  admin_name: string | null; // Backend ส่ง admin_name มาตรงๆ

  completed_date?: string | null; // ถ้ามีใน DB

  // รายละเอียดและราคาซ่อม
  repairlist: {
    repairlist_details: string | null;
    repairlist_price: string | null; // หรือ number ถ้า Backend ส่งเป็น number
  };
}

export interface RepairFormData {
  room_id: string; // สำหรับส่งไป Backend
  admin_id: string; // สำหรับส่งไป Backend
  repair_details: string; // จะถูกแมปไปยัง repairlist_details
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | string;
  reported_date: string;
  repair_price: string; // จะถูกแมปไปยัง repairlist_price
}
