import { BillType, PaymentData, Payment, Stay } from "@/types/payment";

const BASE_URL = "http://localhost:5000";

// Wrapper fetch
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, options);
  let data: any = null;
  try {
    data = await res.json();
  } catch {}
  if (!res.ok) throw new Error(data?.message || "API error");
  if (!data) throw new Error("Empty response from server");
  return data as T;
}

// ----------------- BillType -----------------

// ดึงข้อมูล BillType ทั้งหมด
export const getAllBillTypes = async (): Promise<BillType[]> => {
  return apiFetch<BillType[]>(`/billtype/getall`);
};

// ----------------- Payment -----------------

// สร้าง Payment
export const createPaymentAction = async (
  data: PaymentData
): Promise<{ success: boolean; payment?: Payment; message?: string }> => {
  try {
    const payment = await apiFetch<Payment>(`/payments/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return { success: true, payment };
  } catch (err: any) {
    return { success: false, message: err.message || "Cannot create payment" };
  }
};

// ดึง Payment ทั้งหมด
export const getAllPayments = async (): Promise<Payment[]> => {
  return apiFetch<Payment[]>(`/payments/getall`);
};

// อัปเดต Payment
export const updatePaymentAction = async (payment: Payment): Promise<Payment> => {
  return apiFetch<Payment>(`/payments/${payment.payment_id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payment),
  });
};

// ลบ Payment
export const deletePaymentAction = async (paymentId: string): Promise<{ message: string }> => {
  return apiFetch<{ message: string }>(`/payments/${paymentId}`, {
    method: "DELETE",
  });
};

// ----------------- Stay -----------------

// ดึง Stay ทั้งหมด สำหรับสร้าง Payment
export const getAllStaysForPayment = async (): Promise<Stay[]> => {
  const data = await apiFetch<Stay[]>(`/stays/getall`);
  return data.map((s) => ({
    ...s,
    user_name: s.user_name ?? "Unknown User",
    room_num: s.room_num ?? "Unknown Room",
    room_price: s.room_price ?? 0,
  }));
};
