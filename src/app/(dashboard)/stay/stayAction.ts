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
