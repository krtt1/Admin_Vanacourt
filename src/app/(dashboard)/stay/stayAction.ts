"use server"; // ระบุว่าเป็น Server Action

import { createStay, updateStay, deleteStay } from "@/lib/api";
import { StayFormData } from "@/types/stay";

export async function addStayAction(formData: StayFormData) {
  try {
    console.log("addStayAction: Attempting to create stay...");
    const newStay = await createStay(formData);
    console.log("addStayAction: Stay created successfully:", newStay);
    return { success: true, stay: newStay };
  } catch (error: any) {
    console.error("addStayAction: Error creating stay:", error.message);
    return { success: false, message: error.message || "Failed to create stay." };
  }
}

export async function updateStayAction(stayId: string, formData: Partial<StayFormData>) {
  try {
    console.log(`updateStayAction: Attempting to update stay ${stayId}...`);
    const updatedStay = await updateStay(stayId, formData);
    console.log(`updateStayAction: Stay ${stayId} updated successfully:`, updatedStay);
    return { success: true, stay: updatedStay };
  } catch (error: any) {
    console.error(`updateStayAction: Error updating stay ${stayId}:`, error.message);
    return { success: false, message: error.message || "Failed to update stay." };
  }
}

export async function deleteStayAction(stayId: string) {
  try {
    console.log(`deleteStayAction: Attempting to delete stay ${stayId}...`);
    await deleteStay(stayId);
    console.log(`deleteStayAction: Stay ${stayId} deleted successfully.`);
    return { success: true };
  } catch (error: any) {
    console.error(`deleteStayAction: Error deleting stay ${stayId}:`, error.message);
    return { success: false, message: error.message || "Failed to delete stay." };
  }
}