export interface Stay {
  stay_id: string;
  stay_date: string;
  stay_status: number;
  stay_dateout?: string | null;
  user_id?: string;
  user_name: string;
  room_id?: string;
  room_num: string;
  room_price: number;
}

export interface BillType {
  billtype_id: number;
  bill_type: string;
  billtype_price: number;
}

export enum PaymentStatus {
  Unpaid = "1",
  Paid = "2",
}

export interface Payment {
  payment_id: string;
  stay_id: string;
  admin_id: string;
  water_amount: number;
  ele_amount: number;
  other_payment?: number;
  other_payment_detail?: string;
  payment_date: string;
  payment_status: PaymentStatus;
  payment_total: number;
  room_price?: number;
  user_name?: string;
  room_num?: string;
}

export interface PaymentData {
  stay_id: string;
  admin_id: string;
  water_amount: number;
  ele_amount: number;
  other_payment?: number;
  other_payment_detail?: string;
  room_price: number;
  payment_date: string;
}

export interface PaymentSlip {
  slip_id: string;
  payment_id: string;
  stay_id: string;
  user_id: string;
  slip_url: string;
  uploaded_at: string;
}
