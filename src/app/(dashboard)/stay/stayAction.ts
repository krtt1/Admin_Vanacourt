"use server";

import { StayFormData, Stay } from "@/types/stay";
import { revalidatePath } from "next/cache";

const BASE_URL = "http://localhost:5000";

export async function addStayAction(
  formData: StayFormData
): Promise<{ success: boolean; stay?: Stay; message?: string }> {
  try {
    // ✅ เตรียม payload ให้ตรงกับ backend
    const payload: StayFormData = {
      stay_date: formData.stay_date,
      stay_status: formData.stay_status,
      stay_dateout: formData.stay_dateout || null, // null ถ้าไม่ได้กรอก
      user_id: formData.user_id,
      room_id: formData.room_id,
    };

    const response = await fetch(`${BASE_URL}/stays/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.error || errorData.message || "Cannot create stay",
      };
    }

    const stay: Stay = await response.json();
    revalidatePath("/stay");
    return { success: true, stay };
  } catch (error: any) {
    console.error("addStayAction error:", error);
    return {
      success: false,
      message: error.message || "Unknown error creating stay",
    };
  }
}

export async function updateStayAction(
  stayId: string,
  formData: Partial<StayFormData>
): Promise<{ success: boolean; stay?: Stay; message?: string }> {
  try {
    const response = await fetch(`${BASE_URL}/stays/${stayId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.error || errorData.message || "Cannot update stay",
      };
    }

    const stay: Stay = await response.json();
    revalidatePath("/stay");
    return { success: true, stay };
  } catch (error: any) {
    console.error("updateStayAction error:", error);
    return {
      success: false,
      message: error.message || "Unknown error updating stay",
    };
  }
}

export async function deleteStayAction(
  stayId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${BASE_URL}/stays/${stayId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.error || errorData.message || "Cannot delete stay",
      };
    }

    revalidatePath("/stay");
    return { success: true };
  } catch (error: any) {
    console.error("deleteStayAction error:", error);
    return {
      success: false,
      message: error.message || "Unknown error deleting stay",
    };
  }
}

// ดึง Stay ทั้งหมด
export async function getAllStays(): Promise<Stay[]> {
  const res = await fetch(`${BASE_URL}/stays/getall`);
  if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูล Stay ได้");
  const data: Stay[] = await res.json();
  return data.map((s) => ({
    ...s,
    user_name: s.user_name ?? "Unknown User",
    room_num: s.room_num ?? "Unknown Room",
  }));
}

// ดึงผู้เช่าทั้งหมด
export async function getAllUsers(): Promise<{ user_id: string; user_name: string }[]> {
  const res = await fetch(`${BASE_URL}/users/getall`);
  if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูล Users ได้");
  return await res.json();
}

// ดึงห้องทั้งหมด
export async function getAllRooms(): Promise<{ room_id: string; room_num: string }[]> {
  const res = await fetch(`${BASE_URL}/rooms/getall`);
  if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูล Rooms ได้");
  return await res.json();
}