import { revalidatePath } from "next/cache";
import { User, UserFormData } from "@/types/user";
import { Room, RoomFormData } from "@/types/room";
import { RepairItem, RepairFormData } from "@/types/repair";
import { Stay, StayFormData } from "@/types/stay";
import { BillType, Payment, PaymentData } from "@/types/payment";

const BASE_URL = "http://localhost:5000";

// -------------------- Helper --------------------
async function handleFetch<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Something went wrong");
    }
    return res.json();
  } catch (err: any) {
    throw new Error(err.message || "Network error");
  }
}

function safeNumber(value: any): number | null {
  return value != null ? Number(value) : null;
}

function revalidateStay() {
  try { revalidatePath("/stay"); } catch {}
}

// ==================== USER ====================

export async function getAllUsers(): Promise<User[]> {
  return handleFetch(`${BASE_URL}/users/getall`, { cache: "no-store" });
}

export async function createUser(userData: UserFormData): Promise<User> {
  return handleFetch(`${BASE_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
}

export async function updateUser(userId: string, userData: Partial<UserFormData>): Promise<User> {
  return handleFetch(`${BASE_URL}/users/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
}

export async function deleteUser(userId: string): Promise<boolean> {
  await handleFetch(`${BASE_URL}/users/${userId}`, { method: "DELETE" });
  return true;
}

// ==================== ROOM ====================

export async function getAllRooms(): Promise<Room[]> {
  return handleFetch(`${BASE_URL}/rooms/getall`, { cache: "no-store" });
}

export async function createRoom(roomData: RoomFormData): Promise<Room> {
  return handleFetch(`${BASE_URL}/rooms/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(roomData),
  });
}

export async function updateRoom(roomId: string, roomData: Partial<RoomFormData>): Promise<Room> {
  return handleFetch(`${BASE_URL}/rooms/${roomId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(roomData),
  });
}

export async function deleteRoom(roomId: string): Promise<boolean> {
  await handleFetch(`${BASE_URL}/rooms/${roomId}`, { method: "DELETE" });
  return true;
}

// ==================== REPAIR ====================

export async function getAllRepairs(): Promise<RepairItem[]> {
  const data: any[] = await handleFetch(`${BASE_URL}/repairs/getall`, { cache: "no-store" });
  return data.map((r) => ({
    ...r,
    repairlist: r.repairlist
      ? {
          repairlist_details: r.repairlist.repairlist_details ?? "",
          repairlist_price: safeNumber(r.repairlist.repairlist_price),
        }
      : null,
  }));
}

export async function createRepairItem(repairData: RepairFormData): Promise<RepairItem> {
  const r = await handleFetch(`${BASE_URL}/repairs/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(repairData),
  });
  return {
    ...r,
    repairlist: r.repairlist
      ? {
          repairlist_details: r.repairlist.repairlist_details ?? "",
          repairlist_price: safeNumber(r.repairlist.repairlist_price),
        }
      : null,
  };
}

export async function updateRepairItem(repairId: string, repairData: Partial<RepairFormData>): Promise<RepairItem> {
  const r = await handleFetch(`${BASE_URL}/repairs/update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: repairId, ...repairData }),
  });
  return {
    ...r,
    repairlist: r.repairlist
      ? {
          repairlist_details: r.repairlist.repairlist_details ?? "",
          repairlist_price: safeNumber(r.repairlist.repairlist_price),
        }
      : null,
  };
}

export async function deleteRepairItem(repairId: string): Promise<boolean> {
  await handleFetch(`${BASE_URL}/repairs/delete`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: repairId }),
  });
  return true;
}

// ==================== STAY ====================

export async function getAllStays(): Promise<Stay[]> {
  const data: Stay[] = await handleFetch(`${BASE_URL}/stays/getall`, { cache: "no-store" });
  return data.map((s) => ({
    ...s,
    user_name: s.user_name ?? "Unknown User",
    room_num: s.room_num ?? "Unknown Room",
  }));
}

export async function createStay(stayData: StayFormData): Promise<Stay> {
  if (!stayData.user_id || !stayData.room_id)
    throw new Error("กรุณาเลือกผู้ใช้และห้องก่อนบันทึก");

  const newStay: Stay = await handleFetch(`${BASE_URL}/stays/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(stayData),
  });
  newStay.user_name = newStay.user_name ?? "Unknown User";
  newStay.room_num = newStay.room_num ?? "Unknown Room";
  return newStay;
}

export async function updateStay(stayId: string, stayData: Partial<StayFormData>): Promise<Stay> {
  const updatedStay: Stay = await handleFetch(`${BASE_URL}/stays/${stayId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(stayData),
  });
  updatedStay.user_name = updatedStay.user_name ?? "Unknown User";
  updatedStay.room_num = updatedStay.room_num ?? "Unknown Room";
  revalidateStay();
  return updatedStay;
}

export async function deleteStay(stayId: string): Promise<boolean> {
  await handleFetch(`${BASE_URL}/stays/${stayId}`, { method: "DELETE" });
  revalidateStay();
  return true;
}

// ==================== BILLTYPE ====================

export async function getAllBillTypes(): Promise<BillType[]> {
  return handleFetch(`${BASE_URL}/billtype/getall`, { cache: "no-store" });
}

// ==================== PAYMENT ====================

export async function createPaymentAction(
  data: PaymentData
): Promise<{ success: boolean; payment?: Payment; message?: string }> {
  try {
    const payment: Payment = await handleFetch(`${BASE_URL}/payments/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return { success: true, payment };
  } catch (err: any) {
    return { success: false, message: err.message || "Cannot create payment" };
  }
}
