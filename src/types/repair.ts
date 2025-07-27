// src/types/repair.ts

export interface RepairItem {
  repair_id: string; // หรือ number ถ้า ID ใน DB เป็น number
  repair_date: string;
  repair_status: string | number; // Backend ส่งมาเป็นอะไรก็ตั้งตามนั้น (ถ้าเป็น string ก็ string อย่างเดียว)
  
  // ----------------------------------------------------
  // สำคัญ: ลบ room_id และ admin_id ออกจาก RepairItem
  // เพราะ Backend ส่ง room_num และ admin_name มาตรงๆ
  // room_id: string; // ลบออก
  // admin_id: string; // ลบออก
  // ----------------------------------------------------

  room_num: string | null; // Backend ส่ง room_num มาเป็นหลัก และอาจเป็น null ได้
  admin_name: string | null; // Backend ส่ง admin_name มาเป็นหลัก และอาจเป็น null ได้
  
  // ----------------------------------------------------
  // สำคัญ: ลบ repair_details และ repair_price ออกจาก RepairItem โดยตรง
  // เพราะ Backend รวมไว้ใน object repairlist แล้ว
  // repair_details: string; // ลบออก
  // repair_price: string; // ลบออก
  // ----------------------------------------------------

  completed_date?: string | null; // ถ้ามีใน DB และ Backend ส่งมา

  // Object นี้คือสิ่งที่ Backend ส่งกลับมาสำหรับรายละเอียดและราคาซ่อม
  repairlist: {
    repairlist_details: string | null;
    repairlist_price: number | null; // ควรเป็น number ถ้าเป็นราคา
  };
}

// RepairFormData interface ยังคงใช้สำหรับข้อมูลที่ส่งไปยัง Backend
// ซึ่ง Backend อาจจะคาดหวัง room_id และ admin_id ที่ใช้ใน Stay/Admin tables
export interface RepairFormData {
  room_id: string; // ID ของห้อง (สำหรับส่งไป Backend)
  admin_id: string; // ID ของ Admin (สำหรับส่งไป Backend)
  repair_details: string; // รายละเอียดการซ่อม (ชื่อฟิลด์ในฟอร์ม Frontend, ซึ่งจะถูกแมปไปยัง repairlist_details ใน Backend)
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | string; // สถานะการซ่อม
  reported_date: string; // วันที่แจ้งซ่อม
  repair_price: string; // ราคารายการซ่อม (ชื่อฟิลด์ในฟอร์ม Frontend, ซึ่งจะถูกแมปไปยัง repairlist_price ใน Backend)
  // stay_id: string; // ถ้าจำเป็นต้องส่ง stay_id ด้วย
}