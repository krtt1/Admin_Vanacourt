// src/app/(dashboard)/notifications/page.tsx
"use client";

import { useState, useEffect } from "react";
import NotificationList from "@/components/NotificationList";
import { getAllUsers, getNotifications } from "@/lib/api";

interface User {
  user_id: string;
  user_name: string;
}

interface Admin {
  admin_id: string;
  admin_name: string;
}

const NotificationPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([
    { admin_id: "5779bb7e-5b77-4f0f-905b-4bde758059bf", admin_name: "AdminTest" },
    
  ]);

  const [selectedUser, setSelectedUser] = useState<string | undefined>(undefined);
  const [selectedAdmin, setSelectedAdmin] = useState<string | undefined>(undefined);

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // --- Fetch Users ---
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const data = await getAllUsers();
        setUsers(data.map(u => ({ user_id: u.user_id, user_name: u.user_name })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  // --- Fetch Notifications ---
  useEffect(() => {
    const fetchNotifs = async () => {
      setLoadingNotifications(true);
      try {
        const data = await getNotifications(selectedUser, selectedAdmin);
        setNotifications(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingNotifications(false);
      }
    };
    fetchNotifs();
  }, [selectedUser, selectedAdmin]);

  const totalNotifs = notifications.length;
  const readNotifs = notifications.filter(n => n.read_status).length;
  const unreadNotifs = totalNotifs - readNotifs;

  const handleUserChange = (value: string) => {
    setSelectedUser(value || undefined);
    setSelectedAdmin(undefined);
  };

  const handleAdminChange = (value: string) => {
    setSelectedAdmin(value || undefined);
    setSelectedUser(undefined);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">

      {/* Main Content */}
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Notifications Dashboard</h1>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            <p className="text-gray-500 text-sm">ทั้งหมด</p>
            <p className="text-2xl font-bold">{totalNotifs}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            <p className="text-gray-500 text-sm">อ่านแล้ว</p>
            <p className="text-2xl font-bold text-green-600">{readNotifs}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            <p className="text-gray-500 text-sm">ยังไม่ได้อ่าน</p>
            <p className="text-2xl font-bold text-red-600">{unreadNotifs}</p>
          </div>
        </div>

        {/* Notification Feed */}
        <NotificationList userId={selectedUser} adminId={selectedAdmin} />
      </main>
    </div>
  );
};

export default NotificationPage;
