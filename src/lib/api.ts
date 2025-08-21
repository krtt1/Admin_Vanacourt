// src/lib/api.ts
import { revalidatePath } from 'next/cache';
import { User, UserFormData } from "@/types/user";
import { Room, RoomFormData } from "@/types/room";
import { RepairItem, RepairFormData } from "@/types/repair";
import { Stay, StayFormData } from "@/types/stay";

const BASE_URL = "http://localhost:5000";

// ==================== USER ====================

export async function getAllUsers(): Promise<User[]> {
  const res = await fetch(`${BASE_URL}/users/getall`, { method: "GET", headers: { "Content-Type": "application/json" }, cache: 'no-store' });
  if (!res.ok) throw new Error("Cannot fetch users");
  return await res.json() as User[];
}

export async function createUser(userData: UserFormData): Promise<User> {
  const res = await fetch(`${BASE_URL}/users/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(userData) });
  if (!res.ok) throw new Error("Cannot create user");
  return await res.json() as User;
}

export async function updateUser(userId: string, userData: Partial<UserFormData>): Promise<User> {
  const res = await fetch(`${BASE_URL}/users/${userId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(userData) });
  if (!res.ok) throw new Error("Cannot update user");
  return await res.json() as User;
}

export async function deleteUser(userId: string): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/users/${userId}`, { method: "DELETE", headers: { "Content-Type": "application/json" } });
  if (!res.ok) throw new Error("Cannot delete user");
  return true;
}

// ==================== ROOM ====================

export async function getAllRooms(): Promise<Room[]> {
  const res = await fetch(`${BASE_URL}/rooms/getall`, { method: "GET", headers: { "Content-Type": "application/json" }, cache: 'no-store' });
  if (!res.ok) throw new Error("Cannot fetch rooms");
  return await res.json() as Room[];
}

export async function createRoom(roomData: RoomFormData): Promise<Room> {
  const res = await fetch(`${BASE_URL}/rooms/create`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(roomData) });
  if (!res.ok) throw new Error("Cannot create room");
  return await res.json() as Room;
}

export async function updateRoom(roomId: string, roomData: Partial<RoomFormData>): Promise<Room> {
  const res = await fetch(`${BASE_URL}/rooms/${roomId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(roomData) });
  if (!res.ok) throw new Error("Cannot update room");
  return await res.json() as Room;
}

export async function deleteRoom(roomId: string): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/rooms/${roomId}`, { method: "DELETE", headers: { "Content-Type": "application/json" } });
  if (!res.ok) throw new Error("Cannot delete room");
  return true;
}

// ==================== REPAIR ====================

export async function getAllRepairs(): Promise<RepairItem[]> {
  const res = await fetch(`${BASE_URL}/repairs/getall`, { method: "GET", headers: { "Content-Type": "application/json" }, cache: 'no-store' });
  if (!res.ok) throw new Error("Cannot fetch repairs");

  const data = await res.json();
  return data.map((r: any) => ({
    ...r,
    repairlist: r.repairlist ? {
      repairlist_details: r.repairlist.repairlist_details ?? "",
      repairlist_price: r.repairlist.repairlist_price != null ? Number(r.repairlist.repairlist_price) : null,
    } : null
  })) as RepairItem[];
}

export async function createRepairItem(repairData: RepairFormData): Promise<RepairItem> {
  const res = await fetch(`${BASE_URL}/repairs/create`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(repairData) });
  if (!res.ok) throw new Error("Cannot create repair item");

  const r = await res.json();
  return {
    ...r,
    repairlist: r.repairlist ? {
      repairlist_details: r.repairlist.repairlist_details ?? "",
      repairlist_price: r.repairlist.repairlist_price != null ? Number(r.repairlist.repairlist_price) : null,
    } : null
  } as RepairItem;
}

export async function updateRepairItem(repairId: string, repairData: Partial<RepairFormData>): Promise<RepairItem> {
  const res = await fetch(`${BASE_URL}/repairs/update`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: repairId, ...repairData }) });
  if (!res.ok) throw new Error("Cannot update repair item");

  const r = await res.json();
  return {
    ...r,
    repairlist: r.repairlist ? {
      repairlist_details: r.repairlist.repairlist_details ?? "",
      repairlist_price: r.repairlist.repairlist_price != null ? Number(r.repairlist.repairlist_price) : null,
    } : null
  } as RepairItem;
}

export async function deleteRepairItem(repairId: string): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/repairs/delete`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: repairId }) });
  if (!res.ok) throw new Error("Cannot delete repair item");
  return true;
}

// ==================== STAY ====================

export async function getAllStays(): Promise<Stay[]> {
  const res = await fetch(`${BASE_URL}/stays/getall`, { method: "GET", headers: { "Content-Type": "application/json" }, cache: 'no-store' });
  if (!res.ok) throw new Error("Cannot fetch stays");

  const data: Stay[] = await res.json();
  return data.map(s => ({
    ...s,
    user_name: s.user_name ?? "Unknown User",
    room_num: s.room_num ?? "Unknown Room",
  }));
}

export async function createStay(stayData: StayFormData): Promise<Stay> {
  if (!stayData.user_id || !stayData.room_id) throw new Error("กรุณาเลือกผู้ใช้และห้องก่อนบันทึก");

  const res = await fetch(`${BASE_URL}/stays/create`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(stayData) });
  if (!res.ok) throw new Error("Cannot create stay");

  const newStay: Stay = await res.json();
  newStay.user_name = newStay.user_name ?? "Unknown User";
  newStay.room_num = newStay.room_num ?? "Unknown Room";
  return newStay;
}

export async function updateStay(stayId: string, stayData: Partial<StayFormData>): Promise<Stay> {
  const res = await fetch(`${BASE_URL}/stays/${stayId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(stayData) });
  if (!res.ok) throw new Error("Cannot update stay");

  const updatedStay: Stay = await res.json();
  updatedStay.user_name = updatedStay.user_name ?? "Unknown User";
  updatedStay.room_num = updatedStay.room_num ?? "Unknown Room";

  revalidatePath('/stay');
  return updatedStay;
}

export async function deleteStay(stayId: string): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/stays/${stayId}`, { method: "DELETE", headers: { "Content-Type": "application/json" } });
  if (!res.ok) throw new Error("Cannot delete stay");

  revalidatePath('/stay');
  return true;
}
