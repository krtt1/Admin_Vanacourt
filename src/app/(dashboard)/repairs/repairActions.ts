// src/app/repairActions.ts
"use server"; // <<< สำคัญมาก! ระบุว่าไฟล์นี้เป็น Server Action

// ดึงฟังก์ชัน CRUD สำหรับ Repair (เปลี่ยนชื่อตาม api.ts ที่แก้ไขไปแล้ว)
import { createRepairItem, updateRepairItem, deleteRepairItem } from "@/lib/api";
// นำเข้า Type ของ Repair ที่อัปเดตแล้ว (เปลี่ยนชื่อ Type และไฟล์ type)
import { RepairItem, RepairFormData } from "@/types/repair";
import { revalidatePath } from 'next/cache';

export async function addRepairItemAction(formData: RepairFormData) {
  try {
    console.log("addRepairItemAction: Attempting to create repair item...");
    const newRepairItem = await createRepairItem(formData);

    // Revalidate the path after successful repair item creation
    // *** สำคัญ: ตรวจสอบว่าหน้าแสดงรายการซ่อมของคุณมี URL เป็นอะไร
    // ถ้าเป็น http://localhost:3000/repairs ให้ใช้ '/repairs'
    // ถ้าเป็น http://localhost:3000/admin/repairs ให้ใช้ '/admin/repairs'
    revalidatePath('/repairs'); // <--- แก้ไข path ให้ตรงกับ URL จริงของหน้าแสดงรายการซ่อม

    console.log("addRepairItemAction: Repair item created successfully:", newRepairItem);
    return { success: true, repairItem: newRepairItem };
  } catch (error: any) {
    console.error("addRepairItemAction: Error creating repair item:", error.message);
    return { success: false, message: error.message || "Failed to create repair item." };
  }
}

export async function updateRepairItemAction(repairId: string, formData: Partial<RepairFormData>) {
  try {
    console.log(`updateRepairItemAction: Attempting to update repair item ${repairId}...`);
    const updatedRepairItem = await updateRepairItem(repairId, formData);

    // Revalidate the path after successful repair item update
    // *** สำคัญ: ตรวจสอบว่าหน้าแสดงรายการซ่อมของคุณมี URL เป็นอะไร
    revalidatePath('/repairs'); // <--- แก้ไข path ให้ตรงกับ URL จริงของหน้าแสดงรายการซ่อม

    console.log(`updateRepairItemAction: Repair item ${repairId} updated successfully:`, updatedRepairItem);
    return { success: true, repairItem: updatedRepairItem };
  } catch (error: any) {
    console.error(`updateRepairItemAction: Error updating repair item ${repairId}:`, error.message);
    return { success: false, message: error.message || "Failed to update repair item." };
  }
}

export async function deleteRepairItemAction(repairId: string) {
  try {
    console.log(`deleteRepairItemAction: Attempting to delete repair item ${repairId}...`);
    await deleteRepairItem(repairId);

    // Revalidate the path after successful repair item deletion
    // *** สำคัญ: ตรวจสอบว่าหน้าแสดงรายการซ่อมของคุณมี URL เป็นอะไร
    revalidatePath('/repairs'); // <--- แก้ไข path ให้ตรงกับ URL จริงของหน้าแสดงรายการซ่อม

    console.log(`deleteRepairItemAction: Repair item ${repairId} deleted successfully.`);
    return { success: true };
  } catch (error: any) {
    console.error(`deleteRepairItemAction: Error deleting repair item ${repairId}:`, error.message);
    return { success: false, message: error.message || "Failed to delete repair item." };
  }
}