export interface Stay {
  stay_id: string;
  stay_date: string;
  stay_status: number;
  stay_dateout?: string | null;
  user_name: string;
  room_num: string;
  user_id?: string;
  room_id?: string;
}

export interface StayFormData {
  stay_date: string;
  stay_status: number;
  stay_dateout?: string | null;
  user_id: string;
  room_id: string;
}

export interface User {
  id: string;
  user_name: string;
}

export interface Room {
  id: string;
  room_num: string;
}
