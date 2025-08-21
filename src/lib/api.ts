// src/lib/api.ts
import { revalidatePath } from 'next/cache'; // revalidatePath จะถูกใช้ใน Server Actions แทน
import { User, UserFormData } from "@/types/user";
import { Room, RoomFormData } from "@/types/room";
import { RepairItem, RepairFormData } from "@/types/repair";
import { Stay, StayFormData } from "@/types/stay";

const BASE_URL = "http://localhost:5000"; // Base URL ของ Backend

// --- GET All Functions ---

export async function getAllUsers(): Promise<User[] | null> {
  try {
    const response = await fetch(`${BASE_URL}/users/getall`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to fetch users:", response.status, errorData);
      if (response.status === 404) return [];
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
      headers: { "Content-Type": "application/json" },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to fetch rooms:", response.status, errorData);
      if (response.status === 404) return [];
      throw new Error(`Error fetching rooms: ${response.statusText}`);
    }

    const rooms: Room[] = await response.json();
    return rooms;
  } catch (error) {
    console.error("An unexpected error occurred while fetching rooms:", error);
    return null;
  }
}

// --- GET All Repairs ---
export async function getAllRepairs(): Promise<RepairItem[] | null> {
  try {
    const response = await fetch(`${BASE_URL}/repairs/getall`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to fetch repairs:", response.status, errorData);
      if (response.status === 404) return [];
      throw new Error(`Error fetching repairs: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Raw repairs data:", data);

    const repairs: RepairItem[] = data.map((r: any) => ({
      ...r,
      repairlist: r.repairlist
        ? {
            repairlist_details: r.repairlist.repairlist_details ?? "",
            repairlist_price: r.repairlist.repairlist_price != null
              ? Number(r.repairlist.repairlist_price)
              : null,
          }
        : null,
    }));

    return repairs;
  } catch (error) {
    console.error("An unexpected error occurred while fetching repairs:", error);
    return null;
  }
}

// --- CRUD Functions for User ---

export async function createUser(userData: UserFormData): Promise<User> {
  try {
    const response = await fetch(`${BASE_URL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to create user:", response.status, errorData);
      throw new Error(errorData.message || `Error creating user: ${response.statusText}`);
    }

    const responseData = await response.json();
    if (responseData && responseData.user) {
      return responseData.user as User;
    } else {
      throw new Error("Invalid response format from server for user creation.");
    }
  } catch (error: any) {
    console.error("Error creating user:", error);
    throw new Error(error.message || "Unknown error during user creation.");
  }
}

export async function updateUser(userId: string, userData: Partial<UserFormData>): Promise<User> {
  try {
    const dataToSend: Partial<UserFormData> = { ...userData };
    if ('user_password' in dataToSend && !dataToSend.user_password) {
      delete dataToSend.user_password;
    }

    const response = await fetch(`${BASE_URL}/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to update user:", response.status, errorData);
      throw new Error(errorData.message || `Error updating user: ${response.statusText}`);
    }

    const updatedUser = await response.json();
    return updatedUser as User;
  } catch (error: any) {
    console.error("Error updating user:", error);
    throw new Error(error.message || "Unknown error during user update.");
  }
}

export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/users/${userId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to delete user:", response.status, errorData);
      throw new Error(errorData.message || `Error deleting user: ${response.statusText}`);
    }
    return true;
  } catch (error: any) {
    console.error("Error deleting user:", error);
    throw new Error(error.message || "Unknown error during user deletion.");
  }
}

// --- CRUD Functions for Room ---

export async function createRoom(roomData: RoomFormData): Promise<Room> {
  try {
    const response = await fetch(`${BASE_URL}/rooms/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(roomData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to create room:", response.status, errorData);
      throw new Error(errorData.message || `Error creating room: ${response.statusText}`);
    }

    const newRoom: Room = await response.json();
    return newRoom;
  } catch (error: any) {
    console.error("Error creating room:", error);
    throw new Error(error.message || "Unknown error during room creation.");
  }
}

export async function updateRoom(roomId: string, roomData: Partial<RoomFormData>): Promise<Room> {
  try {
    const response = await fetch(`${BASE_URL}/rooms/${roomId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(roomData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to update room:", response.status, errorData);
      throw new Error(errorData.message || `Error updating room: ${response.statusText}`);
    }

    const updatedRoom: Room = await response.json();
    return updatedRoom;
  } catch (error: any) {
    console.error("Error updating room:", error);
    throw new Error(error.message || "Unknown error during room update.");
  }
}

export async function deleteRoom(roomId: string): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/rooms/${roomId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to delete room:", response.status, errorData);
      throw new Error(errorData.message || `Error deleting room: ${response.statusText}`);
    }
    return true;
  } catch (error: any) {
    console.error("Error deleting room:", error);
    throw new Error(error.message || "Unknown error during room deletion.");
  }
}

// --- CRUD Functions for Repair ---

export async function createRepairItem(repairData: RepairFormData): Promise<RepairItem> {
  try {
    const response = await fetch(`${BASE_URL}/repairs/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(repairData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to create repair item:", response.status, errorData);
      throw new Error(errorData.message || `Error creating repair item: ${response.statusText}`);
    }

    const r = await response.json();
    const newRepairItem: RepairItem = {
      ...r,
      repairlist: r.repairlist
        ? {
            repairlist_details: r.repairlist.repairlist_details ?? "",
            repairlist_price: r.repairlist.repairlist_price != null
              ? Number(r.repairlist.repairlist_price)
              : null,
          }
        : null,
    };

    return newRepairItem;
  } catch (error: any) {
    console.error("Error creating repair item:", error);
    throw new Error(error.message || "Unknown error during repair item creation.");
  }
}

export async function updateRepairItem(repairId: string, repairData: Partial<RepairFormData>): Promise<RepairItem> {
  try {
    const response = await fetch(`${BASE_URL}/repairs/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: repairId, ...repairData }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to update repair item:", response.status, errorData);
      throw new Error(errorData.message || `Error updating repair item: ${response.statusText}`);
    }

    const r = await response.json();
    const updatedRepairItem: RepairItem = {
      ...r,
      repairlist: r.repairlist
        ? {
            repairlist_details: r.repairlist.repairlist_details ?? "",
            repairlist_price: r.repairlist.repairlist_price != null
              ? Number(r.repairlist.repairlist_price)
              : null,
          }
        : null,
    };

    return updatedRepairItem;
  } catch (error: any) {
    console.error("Error updating repair item:", error);
    throw new Error(error.message || "Unknown error during repair item update.");
  }
}

export async function deleteRepairItem(repairId: string): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/repairs/delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: repairId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to delete repair item:", response.status, errorData);
      throw new Error(errorData.message || `Error deleting repair item: ${response.statusText}`);
    }

    return true;
  } catch (error: any) {
    console.error("Error deleting repair item:", error);
    throw new Error(error.message || "Unknown error during repair item deletion.");
  }
}

export async function getRepairItemById(repairId: string): Promise<RepairItem | null> {
  try {
    const response = await fetch(`${BASE_URL}/repairs/get?id=${repairId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Failed to fetch repair item by ID ${repairId}:`, response.status, errorData);
      return null;
    }

    const r = await response.json();
    const repairItem: RepairItem = {
      ...r,
      repairlist: r.repairlist
        ? {
            repairlist_details: r.repairlist.repairlist_details ?? "",
            repairlist_price: r.repairlist.repairlist_price != null
              ? Number(r.repairlist.repairlist_price)
              : null,
          }
        : null,
    };

    return repairItem;
  } catch (error) {
    console.error(`Error fetching repair item by ID ${repairId}:`, error);
    return null;
  }
}

// --- GET All Stays ---
export async function getAllStays(): Promise<Stay[] | null> {
  try {
    const response = await fetch(`${BASE_URL}/stays/getall`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Failed with status: ${response.status}` }));
      console.error("Failed to fetch stays:", response.status, errorData);
      if (response.status === 404) return [];
      throw new Error(errorData.message || `Error fetching stays: ${response.statusText}`);
    }

    const stays: Stay[] = await response.json();
    return stays;
  } catch (error) {
    console.error("An unexpected error occurred while fetching stays:", error);
    return null;
  }
}

// --- CRUD Functions for Stay ---
export async function createStay(stayData: StayFormData): Promise<Stay> {
  try {
    const response = await fetch(`${BASE_URL}/stays/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stayData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Failed with status: ${response.status}` }));
      console.error("Failed to create stay:", response.status, errorData);
      throw new Error(errorData.message || `Error creating stay: ${response.statusText}`);
    }

    const newStay: Stay = await response.json();
    revalidatePath('/stay');
    return newStay;
  } catch (error: any) {
    console.error("Error creating stay:", error);
    throw new Error(error.message || "Unknown error during stay creation.");
  }
}

export async function updateStay(stayId: string, stayData: Partial<StayFormData>): Promise<Stay> {
  try {
    const response = await fetch(`${BASE_URL}/stays/${stayId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stayData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Failed with status: ${response.status}` }));
      console.error("Failed to update stay:", response.status, errorData);
      throw new Error(errorData.message || `Error updating stay: ${response.statusText}`);
    }

    const updatedStay: Stay = await response.json();
    revalidatePath('/stay');
    return updatedStay;
  } catch (error: any) {
    console.error("Error updating stay:", error);
    throw new Error(error.message || "Unknown error during stay update.");
  }
}

export async function deleteStay(stayId: string): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/stays/${stayId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Failed with status: ${response.status}` }));
      console.error("Failed to delete stay:", response.status, errorData);
      throw new Error(errorData.message || `Error deleting stay: ${response.statusText}`);
    }

    revalidatePath('/stay');
    return true;
  } catch (error: any) {
    console.error("Error deleting stay:", error);
    throw new Error(error.message || "Unknown error during stay deletion.");
  }
}