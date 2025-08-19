export interface Room {
  room_id: string;         // ใช้ string แต่ถ้าเป็นตัวเลขล้วนสามารถแปลงตอน sort
  room_num: string;
  room_status: string;
  room_price: number;      // เปลี่ยนเป็น number จะสะดวกต่อการคำนวณ/แสดง
}

export interface RoomFormData {
  room_num: string;
  room_status: 'available' | 'occupied' | 'cleaning' | 'maintenance' | string;
  room_price: number;
}
