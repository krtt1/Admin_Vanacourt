// src/types/user.ts
export interface User {
  user_id: string;
  user_name: string;
  user_username: string;
  user_tel: string;
  user_address: string;
  user_age: number;
  role: string;
  // ถ้า Backend ส่ง password กลับมาด้วย (ซึ่งไม่แนะนำให้ทำจริง)
  // password?: string;
}

export interface UserFormData {
  user_name: string;
  user_username: string;
  user_tel: string;
  user_address: string;
  user_age: number;
  role: string;
  // *** เพิ่ม field 'password' ตรงนี้ ***
  user_password: string; // ถ้าเป็น field ที่จำเป็นต้องกรอกเสมอ (recommended for registration)
  // หรือ password?: string; // ถ้าเป็น field ที่เป็น optional
}