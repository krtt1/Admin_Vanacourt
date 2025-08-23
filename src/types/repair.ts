// src/types/repair.ts

export interface RepairlistItem {
  repairlist_id: number;                 // ID ของ master data repairlist
  repairlist_details: string;            // รายละเอียดงานซ่อม
  repairlist_price: number;            // ราคาซ่อม (string หรือ number ตาม backend)
}

export interface RepairItem {
  repair_id: string;                     // หรือ number ถ้า ID ใน DB เป็น number
  repair_date: string;
  repair_status: string | number;        // Backend ส่งมาเป็น string หรือ number

  room_num: string | null;               // Backend ส่ง room_num มาตรงๆ
  admin_name: string | null;             // Backend ส่ง admin_name มาตรงๆ

  completed_date?: string | null;        // ถ้ามีใน DB

  // รายละเอียดและราคาซ่อม
  repairlist: RepairlistItem | null;
}

export interface RepairFormData {
  stay_id: string;                         // สำหรับส่งไป Backend
  admin_id: string;                       // สำหรับส่งไป Backend
  repairlist_id: number;                  // เลือกจาก dropdown ของ repairlist
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | string;
  reported_date: string;
}
