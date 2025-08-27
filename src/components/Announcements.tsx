"use client";

import { useEffect, useState } from "react";
import { getNotifications, markNotificationAsRead } from "@/lib/api";

interface Announcement {
  notification_id: string;
  title: string;
  message: string;
  read_status: boolean;
  created_at: string;
}

interface Props {
  adminId: string;
}

const Announcements = ({ adminId }: Props) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!adminId) return;

    const fetchAnnouncements = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getNotifications(undefined, adminId);
        // แสดง 3 รายการล่าสุด
        setAnnouncements(data.slice(0, 3));
      } catch (err: any) {
        console.error(err);
        setError(err.message || "ไม่สามารถดึง Announcements ได้");
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [adminId]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setAnnouncements(prev =>
        prev.map(a => (a.notification_id === id ? { ...a, read_status: true } : a))
      );
    } catch (err: any) {
      console.error(err);
      setError(err.message || "ไม่สามารถ mark as read ได้");
    }
  };

  if (loading) return <p className="text-gray-500">กำลังโหลด Announcements...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (announcements.length === 0) return <p className="text-gray-400">ไม่มี Announcements</p>;

  return (
    <div className="bg-white p-4 rounded-md">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Announcements</h1>
        <span className="text-xs text-gray-400">View All</span>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        {announcements.map(notif => (
          <div
            key={notif.notification_id}
            className={`rounded-md p-4 ${notif.read_status ? "bg-gray-50" : "bg-blue-50"}`}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-medium">{notif.title}</h2>
              <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                {notif.created_at.split("T")[0]}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
            {!notif.read_status && (
              <button
                onClick={() => handleMarkAsRead(notif.notification_id)}
                className="mt-2 bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded"
              >
                อ่านแล้ว
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Announcements;
