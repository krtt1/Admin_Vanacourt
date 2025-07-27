// src/lib/api.ts
import { revalidatePath } from 'next/cache'; // revalidatePath จะถูกใช้ใน Server Actions แทน
import { User, UserFormData } from "@/types/user";
import { Room, RoomFormData } from "@/types/room";
import { RepairItem, RepairFormData } from "@/types/repair"; // ตรวจสอบว่า import นี้ถูกต้อง

const BASE_URL = "http://localhost:5000"; // ตรวจสอบว่านี่คือ Base URL ที่ถูกต้องของ Backend คุณ

// --- GET All Functions ---

export async function getAllUsers(): Promise<User[] | null> {
  try {
    const response = await fetch(`${BASE_URL}/users/getall`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to fetch users:", response.status, errorData);
      if (response.status === 404) {
        return [];
      }
      throw new Error(`Error fetching users: ${response.statusText}`);
    }

    const users: User[] = await response.json();
    return users;
  } catch (error) {
    console.error("An unexpected error occurred while fetching users:", error);
    return null;
  }
}

export async function getAllRooms(): Promise<Room[] | null> {
  try {
    const response = await fetch(`${BASE_URL}/rooms/getall`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to fetch rooms:", response.status, errorData);
      if (response.status === 404) {
        return [];
      }
      throw new Error(`Error fetching rooms: ${response.statusText}`);
    }

    const rooms: Room[] = await response.json();
    return rooms;
  } catch (error) {
    console.error("An unexpected error occurred while fetching rooms:", error);
    return null;
  }
}

// === NEW: เปลี่ยน getAllRepairLists() เป็น getAllRepairs() และเปลี่ยน Endpoint ===
export async function getAllRepairs(): Promise<RepairItem[] | null> { // <--- ฟังก์ชันนี้คืออันที่ควรเก็บไว้
  try {
    // ใช้ endpoint สำหรับดึงรายการ Repair ทั้งหมด: /Repair/GetAll
    const response = await fetch(`${BASE_URL}/Repair/GetAll`, { // <--- แก้ไข endpoint ตรงนี้
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to fetch repairs:", response.status, errorData); // <--- เปลี่ยนข้อความ Log
      if (response.status === 404) {
        return [];
      }
      throw new Error(`Error fetching repairs: ${response.statusText}`); // <--- เปลี่ยนข้อความ Error
    }

    const repairs: RepairItem[] = await response.json(); // <--- เปลี่ยนชื่อตัวแปรและ Type
    return repairs;
  } catch (error) {
    console.error("An unexpected error occurred while fetching repairs:", error); // <--- เปลี่ยนข้อความ Log
    return null;
  }
}

// --- CRUD Functions for User ---

export async function createUser(userData: UserFormData): Promise<User> {
  try {
    const response = await fetch(`${BASE_URL}/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.message || `Error creating user: ${response.statusText}`;
      console.error("Failed to create user (API Response Error):", response.status, errorData);
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    console.log("Raw response data from API (createUser):", responseData);

    if (responseData && responseData.user) {
      return responseData.user as User;
    } else {
      console.error("API response for user creation did not contain expected 'user' object:", responseData);
      throw new Error("Invalid response format from server for user creation.");
    }

  } catch (error: any) {
    console.error("An unexpected error occurred while creating user (Client-side processing error):", error);
    throw new Error(error.message || "An unknown error occurred during user creation.");
  }
}

export async function updateUser(userId: string, userData: Partial<UserFormData>): Promise<User> {
  try {
    const dataToSend: Partial<UserFormData> = { ...userData };
    if ('user_password' in dataToSend && (dataToSend.user_password === '' || dataToSend.user_password === undefined)) {
        delete dataToSend.user_password;
    }

    const response = await fetch(`${BASE_URL}/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToSend),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.message || `Error updating user: ${response.statusText}`;
      console.error("Failed to update user:", response.status, errorData);
      throw new Error(errorMessage);
    }

    const updatedUser = await response.json();
    return updatedUser as User;
  } catch (error: any) {
    console.error("An unexpected error occurred while updating user:", error);
    throw new Error(error.message || "An unknown error occurred during user update.");
  }
}

export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/users/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.message || `Error deleting user: ${response.statusText}`;
      console.error("Failed to delete user:", response.status, errorData);
      throw new Error(errorMessage);
    }
    return true;
  } catch (error: any) {
    console.error("An unexpected error occurred while deleting user:", error);
    throw new Error(error.message || "An unknown error occurred during user deletion.");
  }
}

// --- CRUD Functions for Room ---

export async function createRoom(roomData: RoomFormData): Promise<Room> {
  try {
    const response = await fetch(`${BASE_URL}/rooms/create`, { // ปรับ endpoint ตาม Backend ของคุณ
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(roomData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.message || `Error creating room: ${response.statusText}`;
      console.error("Failed to create room (API Response Error):", response.status, errorData);
      throw new Error(errorMessage);
    }

    const newRoom: Room = await response.json(); // สมมติว่า Backend ส่ง Room object โดยตรง
    console.log("Raw response data from API (createRoom):", newRoom);
    return newRoom;

  } catch (error: any) {
    console.error("An unexpected error occurred while creating room (Client-side processing error):", error);
    throw new Error(error.message || "An unknown error occurred during room creation.");
  }
}

export async function updateRoom(roomId: string, roomData: Partial<RoomFormData>): Promise<Room> {
  try {
    const response = await fetch(`${BASE_URL}/rooms/${roomId}`, { // ปรับ endpoint ตาม Backend ของคุณ
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(roomData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.message || `Error updating room: ${response.statusText}`;
      console.error("Failed to update room:", response.status, errorData);
      throw new Error(errorMessage);
    }

    const updatedRoom: Room = await response.json(); // สมมติว่า Backend ส่ง Room object โดยตรง
    return updatedRoom;
  } catch (error: any) {
    console.error("An unexpected error occurred while updating room:", error);
    throw new Error(error.message || "An unknown error occurred during room update.");
  }
}

export async function deleteRoom(roomId: string): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/rooms/${roomId}`, { // ปรับ endpoint ตาม Backend ของคุณ
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.message || `Error deleting room: ${response.statusText}`;
      console.error("Failed to delete room:", response.status, errorData);
      throw new Error(errorMessage);
    }
    return true;
  } catch (error: any) {
    console.error("An unexpected error occurred while deleting room:", error);
    throw new Error(error.message || "An unknown error occurred during room deletion.");
  }
}

// === NEW: CRUD Functions for Repair (เปลี่ยนจาก Repair List เป็น Repair) ===

export async function createRepairItem(repairData: RepairFormData): Promise<RepairItem> { // <--- เปลี่ยนชื่อฟังก์ชันและ Type Return/Parameter
  try {
    // ใช้ endpoint สำหรับสร้างรายการ Repair: /Repair/CreateRepair
    const response = await fetch(`${BASE_URL}/Repair/CreateRepair`, { // <--- แก้ไข endpoint
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(repairData), // ส่งข้อมูลตาม RepairFormData
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.message || `Error creating repair item: ${response.statusText}`;
      console.error("Failed to create repair item (API Response Error):", response.status, errorData);
      throw new Error(errorMessage);
    }

    const newRepairItem: RepairItem = await response.json(); // <--- เปลี่ยน Type
    console.log("Raw response data from API (createRepairItem):", newRepairItem); // <--- เปลี่ยนชื่อ Log
    return newRepairItem;

  } catch (error: any) {
    console.error("An unexpected error occurred while creating repair item (Client-side processing error):", error);
    throw new Error(error.message || "An unknown error occurred during repair item creation.");
  }
}

export async function updateRepairItem(repairId: string, repairData: Partial<RepairFormData>): Promise<RepairItem> { // <--- เปลี่ยนชื่อฟังก์ชันและ Type Return/Parameter
  try {
    // ใช้ endpoint สำหรับแก้ไขรายการ Repair: /Repair/Update
    // ตามภาพ API: รับ ID ผ่าน Request Body
    const response = await fetch(`${BASE_URL}/Repair/Update`, { // <--- แก้ไข endpoint
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: repairId, ...repairData }), // <--- ส่ง ID ใน body
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.message || `Error updating repair item: ${response.statusText}`;
      console.error("Failed to update repair item:", response.status, errorData);
      throw new Error(errorMessage);
    }

    const updatedRepairItem: RepairItem = await response.json(); // <--- เปลี่ยน Type
    return updatedRepairItem;
  } catch (error: any) {
    console.error("An unexpected error occurred while updating repair item:", error);
    throw new Error(error.message || "An unknown error occurred during repair item update.");
  }
}

export async function deleteRepairItem(repairId: string): Promise<boolean> { // <--- เปลี่ยนชื่อฟังก์ชัน
  try {
    // ใช้ endpoint สำหรับลบรายการ Repair: /Repair/Delete
    // ตามภาพ API: รับ ID ผ่าน Request Body
    const response = await fetch(`${BASE_URL}/Repair/Delete`, { // <--- แก้ไข endpoint
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: repairId }), // <--- ส่ง ID ใน body
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.message || `Error deleting repair item: ${response.statusText}`;
      console.error("Failed to delete repair item:", response.status, errorData);
      throw new Error(errorMessage);
    }
    return true; // ลบสำเร็จ
  } catch (error: any) {
    console.error("An unexpected error occurred while deleting repair item:", error);
    throw new Error(error.message || "An unknown error occurred during repair item deletion.");
  }
}

// === NEW: เพิ่มฟังก์ชัน getRepairItemById() ===
// (อันนี้คือฟังก์ชัน GetID ที่ควรจะมีอยู่จริง)
export async function getRepairItemById(repairId: string): Promise<RepairItem | null> {
  try {
    const response = await fetch(`${BASE_URL}/Repair/GetID?id=${repairId}`, { // <--- Endpoint สำหรับ GetID
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Failed to fetch repair item by ID ${repairId}:`, response.status, errorData);
      return null;
    }
    const repairItem: RepairItem = await response.json();
    return repairItem;
  } catch (error) {
    console.error(`An unexpected error occurred while fetching repair item by ID ${repairId}:`, error);
    return null;
  }
}