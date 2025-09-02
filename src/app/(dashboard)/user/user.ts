"use server"; // <<< สำคัญมาก! ระบุว่าไฟล์นี้เป็น Server Action

import { createUser, updateUser, deleteUser } from "@/lib/api"; // ดึงฟังก์ชัน CRUD ที่มี revalidatePath อยู่แล้ว
import { UserFormData } from "@/types/user";
import { revalidatePath } from 'next/cache';


export async function addUserAction(formData: UserFormData) {
  try {
    console.log("addUserAction: Attempting to create user...");
    const newUser = await createUser(formData); // createUser จะจัดการ revalidatePath ภายใน

    
    console.log("addUserAction: User created successfully:", newUser);
    return { success: true, user: newUser };
  } catch (error: any) {
    console.error("addUserAction: Error creating user:", error.message);
    return { success: false, message: error.message || "Failed to create user." };
  }
}

export async function updateUserAction(userId: string, formData: Partial<UserFormData>) {
  try {
    console.log(`updateUserAction: Attempting to update user ${userId}...`);
    const updatedUser = await updateUser(userId, formData);
    console.log(`updateUserAction: User ${userId} updated successfully:`, updatedUser);
    return { success: true, user: updatedUser };
  } catch (error: any) {
    console.error(`updateUserAction: Error updating user ${userId}:`, error.message);
    return { success: false, message: error.message || "Failed to update user." };
  }
}

export async function deleteUserAction(userId: string) {
  try {
    console.log(`deleteUserAction: Attempting to delete user ${userId}...`);
    await deleteUser(userId);
    console.log(`deleteUserAction: User ${userId} deleted successfully.`);
    return { success: true };
  } catch (error: any) {
    console.error(`deleteUserAction: Error deleting user ${userId}:`, error.message);
    return { success: false, message: error.message || "Failed to delete user." };
  }
}

// ----------------- Reset Password -----------------
export async function resetUserPasswordAction(
  userId: string,
  username: string,   // เพิ่ม username
  newPassword: string
) {
  try {
    if (!newPassword) throw new Error("กรุณากรอกรหัสผ่านใหม่");
    if (!username) throw new Error("ไม่พบชื่อผู้ใช้");

    // สามารถใช้ username เพื่อ log หรือ confirm ก่อนอัปเดต
    console.log(`Reset password for user: ${username} (ID: ${userId})`);

    // เรียก updateUser และส่งแค่ user_password
    const updatedUser = await updateUser(userId, { user_password: newPassword });

    // revalidate หน้า users (ถ้าต้องการ)
    revalidatePath("/users");

    return { success: true, user: updatedUser };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to reset password" };
  }
}