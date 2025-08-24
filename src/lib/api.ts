// src/lib/api.ts
import { revalidatePath } from "next/cache";
import { User, UserFormData } from "@/types/user";
import { Room, RoomFormData } from "@/types/room";
import { RepairItem, RepairFormData, RepairlistItem } from "@/types/repair";
import { Stay, StayFormData } from "@/types/stay";
import { BillType, Payment, PaymentData } from "@/types/payment";
import { Income, Expense } from "@/types/finance";
import { NotificationItem, NotificationPayload } from "@/types/notification";

const BASE_URL = "http://localhost:5000";
const NOTIF_BASE = `${BASE_URL}/notificationrepairs`;

// -------------------- Helper --------------------
async function handleFetch<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(url, options);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("Backend error response:", data);
      throw new Error(data.error || data.message || "Something went wrong");
    }
    return data;
  } catch (err: any) {
    console.error("Network or parsing error:", err);
    throw new Error(err.message || "Network error");
  }
}

function safeNumber(value: any): number {
  return value != null ? Number(value) : 0;
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

// แก้ create ให้ส่ง room_id, admin_id, repairlist_id, status, reported_date
// ==================== REPAIR ====================
export async function createRepairItem(repairData: RepairFormData): Promise<RepairItem> {
  // ตรวจสอบและแปลงวันที่ให้ถูกต้อง
  const reportedDate = repairData.reported_date
    ? new Date(repairData.reported_date).toISOString()
    : new Date().toISOString();

  // ตรวจสอบ status ให้ไม่เป็น undefined
  const status = repairData.status || "pending";

  const payload = {
    stay_id: repairData.stay_id,
    admin_id: repairData.admin_id,
    repairlist_id: String(repairData.repairlist_id), // แปลงเป็น string
    repair_status: status,
    repair_date: reportedDate,
  };

  console.log("Sending payload:", payload);

  const r = await handleFetch(`${BASE_URL}/repairs/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
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

// แก้ update ให้ส่ง id + payload
// ฟังก์ชันอัปเดตการซ่อม
export const updateRepairItem = async (repairId: number, payload: any) => {
  try {
    const res = await fetch(`${BASE_URL}/repairs/${repairId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "เกิดข้อผิดพลาดในการอัปเดต");
    }

    return await res.json();
  } catch (err) {
    console.error("updateRepairItem error:", err);
    throw err;
  }
};

// ลบรายการซ่อม
export async function deleteRepairItem(repairId: string): Promise<boolean> {
  await handleFetch(`${BASE_URL}/repairs/${repairId}`, {
    method: "DELETE",
  });
  return true;
}


// ==================== REPAIRLIST ====================
export async function getAllRepairlists(): Promise<RepairlistItem[]> {
  const data: any[] = await handleFetch(`${BASE_URL}/repairlists/getall`, { cache: "no-store" });
  return data.map((r) => ({
    repairlist_id: r.repairlist_id,
    repairlist_details: r.repairlist_details ?? "",
    repairlist_price: safeNumber(r.repairlist_price),
  }));
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
  if (!stayData.user_id || !stayData.room_id) throw new Error("กรุณาเลือกผู้ใช้และห้องก่อนบันทึก");
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

// ==================== FINANCIAL / EXPENSE ====================
export interface ExpensePayload {
  expense_type: string;
  expense_price: string; // ต้องเป็น string
  expense_date: string;
  admin_id: string;      // UUID
}

export const getAllExpenses = async (): Promise<Expense[]> =>
  handleFetch<Expense[]>(`${BASE_URL}/expenses/getall`);

export const createExpense = async (data: ExpensePayload): Promise<Expense> =>
  handleFetch<Expense>(`${BASE_URL}/expenses/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      expense_price: data.expense_price,
      expense_type: data.expense_type,
      expense_date: data.expense_date,
      admin_id: data.admin_id || "5779bb7e-5b77-4f0f-905b-4bde758059bf", // UUID admin จริง
    }),
  });

export const updateExpense = async (expenseId: string, data: Partial<ExpensePayload>): Promise<Expense> =>
  handleFetch<Expense>(`${BASE_URL}/expenses/${expenseId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      expense_price: data.expense_price,
      expense_type: data.expense_type,
      expense_date: data.expense_date,
      admin_id: data.admin_id,
    }),
  });

export const deleteExpense = async (expenseId: string): Promise<boolean> => {
  await handleFetch(`${BASE_URL}/expenses/${expenseId}`, { method: "DELETE" });
  return true;
};

// ==================== INCOME ====================
export interface IncomePayload {
  income_amount: number;
  income_type: string;
  income_date: string;
  income_description?: string;
}

export const getAllIncomes = async (): Promise<Income[]> =>
  handleFetch<Income[]>(`${BASE_URL}/incomes/getall`);

export const createIncome = async (data: IncomePayload): Promise<Income> =>
  handleFetch<Income>(`${BASE_URL}/incomes/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const updateIncome = async (incomeId: string, data: Partial<IncomePayload>): Promise<Income> =>
  handleFetch<Income>(`${BASE_URL}/incomes/${incomeId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const deleteIncome = async (incomeId: string): Promise<boolean> => {
  await handleFetch(`${BASE_URL}/incomes/${incomeId}`, { method: "DELETE" });
  return true;
};

export const getYearEndBalance = async (year: number): Promise<number> => {
  const incomes = await handleFetch<{ total: string | number }>(
    `${BASE_URL}/incomes/summary/year/${year}`
  );
  const expenses = await handleFetch<{ total: string | number }>(
    `${BASE_URL}/expenses/summary/year/${year}`
  );
  return (Number(incomes.total) || 0) - (Number(expenses.total) || 0);
};

// ดึง Notification ของ user หรือ admin
export const getNotifications = async (userId?: string, adminId?: string): Promise<NotificationItem[]> => {
  try {
    let url = `${NOTIF_BASE}/getall`; // default get all
    const params: any = {};

    if (userId || adminId) {
      url = `${NOTIF_BASE}/user-or-admin`;
      if (userId) params.user_id = userId;
      if (adminId) params.admin_id = adminId;
    }

    const query = new URLSearchParams(params).toString();
    const finalUrl = query ? `${url}?${query}` : url;

    const data: NotificationItem[] = await handleFetch(finalUrl, { cache: "no-store" });
    return data;
  } catch (err: any) {
    console.error(err);
    throw new Error("ไม่สามารถดึง Notification ได้");
  }
};

// mark as read
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    return await handleFetch(`${NOTIF_BASE}/${notificationId}/read`, { method: "PATCH" });
  } catch (err: any) {
    console.error(err);
    throw new Error("ไม่สามารถ mark as read ได้");
  }
};

// สร้าง Notification
export const createNotification = async (payload: NotificationPayload) => {
  try {
    return await handleFetch(`${NOTIF_BASE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err: any) {
    console.error(err);
    throw new Error("ไม่สามารถสร้าง Notification ได้");
  }
};