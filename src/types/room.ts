// src/types/room.ts
export interface Room {
  room_id: string;
  room_num: string;
  room_status: string;
  room_price: string; 
}

export interface RoomFormData {
  room_num: string;
  room_status: 'available' | 'occupied' | 'cleaning' | 'maintenance' | string;
  room_price: number;
}