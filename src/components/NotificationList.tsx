// src/components/NotificationList.tsx
"use client";

import { useState, useEffect } from "react";
import { NotificationItem } from "@/types/notification";
import { getNotifications, markNotificationAsRead } from "@/lib/api";
import { formatDistanceToNow, parseISO } from "date-fns";

interface Props {
  userId?: string;
  adminId?: string;
}

const NotificationList = ({ userId, adminId }: Props) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNotifications(userId, adminId);
      setNotifications(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "ไม่สามารถดึง Notification ได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId, adminId]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.notification_id === id ? { ...n, read_status: true } : n)
      );
    } catch (err: any) {
      console.error(err);
      setError(err.message || "ไม่สามารถ mark as read ได้");
    }
  };

  if (loading) return <p className="text-gray-500">กำลังโหลด Notifications...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (notifications.length === 0) return <p className="text-gray-400">ไม่มี Notification</p>;

  return (
    <div className="space-y-4">
      {notifications.map(notif => (
        <div
          key={notif.notification_id}
          className={`p-4 border rounded-lg shadow-sm flex flex-col md:flex-row md:justify-between transition transform hover:-translate-y-1 hover:shadow-md
            ${notif.read_status ? "bg-white" : "bg-blue-50"}`}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-sm">
              {notif.user?.user_name?.[0] || notif.admin?.admin_name?.[0] || "S"}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{notif.user?.user_name || notif.admin?.admin_name || "System"}</p>
                <p className="text-xs text-gray-400">
                  {formatDistanceToNow(parseISO(notif.created_at), { addSuffix: true })}
                </p>
              </div>
              <p className="mt-1 font-medium">{notif.title}</p>
              <p className="mt-1 text-gray-600 text-sm">{notif.message}</p>
            </div>
          </div>

          {!notif.read_status && (
            <div className="mt-2 md:mt-0 md:ml-4 flex-shrink-0">
              <button
                onClick={() => handleMarkAsRead(notif.notification_id)}
                className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded"
              >
                อ่านแล้ว
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default NotificationList;
