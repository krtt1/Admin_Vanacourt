// src/app/roomActions.ts
"use server"; // <<< สำคัญมาก! ระบุว่าไฟล์นี้เป็น Server Action

import { createRoom, updateRoom, deleteRoom } from "@/lib/api"; // ดึงฟังก์ชัน CRUD สำหรับ Room
import { Room, RoomFormData } from "@/types/room"; // นำเข้า Room และ RoomFormData
import { revalidatePath } from 'next/cache';

export async function addRoomAction(formData: RoomFormData) {
  try {
    console.log("addRoomAction: Attempting to create room...");
    const newRoom = await createRoom(formData);

    // Revalidate the path after successful room creation
    // *** สำคัญ: เปลี่ยน '/rooms' เป็น path ที่ถูกต้องของหน้าที่มีการแสดงข้อมูลห้อง ***
    revalidatePath('/rooms'); // ตัวอย่าง: revalidate หน้า /rooms

    console.log("addRoomAction: Room created successfully:", newRoom);
    return { success: true, room: newRoom };
  } catch (error: any) {
    console.error("addRoomAction: Error creating room:", error.message);
    return { success: false, message: error.message || "Failed to create room." };
  }
}

export async function updateRoomAction(roomId: string, formData: Partial<RoomFormData>) {
  try {
    console.log(`updateRoomAction: Attempting to update room ${roomId}...`);
    const updatedRoom = await updateRoom(roomId, formData);

    // Revalidate the path after successful room update
    // *** สำคัญ: เปลี่ยน '/rooms' เป็น path ที่ถูกต้องของหน้าที่มีการแสดงข้อมูลห้อง ***
    revalidatePath('/rooms'); // ตัวอย่าง: revalidate หน้า /rooms

    console.log(`updateRoomAction: Room ${roomId} updated successfully:`, updatedRoom);
    return { success: true, room: updatedRoom };
  } catch (error: any) {
    console.error(`updateRoomAction: Error updating room ${roomId}:`, error.message);
    return { success: false, message: error.message || "Failed to update room." };
  }
}

export async function deleteRoomAction(roomId: string) {
  try {
    console.log(`deleteRoomAction: Attempting to delete room ${roomId}...`);
    await deleteRoom(roomId);

    // Revalidate the path after successful room deletion
    // *** สำคัญ: เปลี่ยน '/rooms' เป็น path ที่ถูกต้องของหน้าที่มีการแสดงข้อมูลห้อง ***
    revalidatePath('/rooms'); // ตัวอย่าง: revalidate หน้า /rooms

    console.log(`deleteRoomAction: Room ${roomId} deleted successfully.`);
    return { success: true };
  } catch (error: any) {
    console.error(`deleteRoomAction: Error deleting room ${roomId}:`, error.message);
    return { success: false, message: error.message || "Failed to delete room." };
  }
}