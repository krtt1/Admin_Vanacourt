// types/notification.ts

export interface NotificationItem {
  notification_id: string;
  user_id: string | null;
  admin_id: string | null;
  title: string;
  message: string;
  read_status: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    user_name: string;
  } | null;
  admin?: {
    admin_name: string;
  } | null;
}

export interface NotificationPayload {
  user_id?: string | null;
  admin_id?: string | null;
  title: string;
  message: string;
}
