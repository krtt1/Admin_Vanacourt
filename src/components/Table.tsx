"use client";

import { useState, useMemo, useEffect } from "react";
import { User, UserFormData } from "@/types/user";
import { createUser, updateUser, deleteUser } from "@/lib/api";
import { resetUserPasswordAction } from "@/app/(dashboard)/user/user"; // server action
import { useRouter } from "next/navigation";

interface UsersTableProps {
  initialUsers: User[];
}

const UsersTable: React.FC<UsersTableProps> = ({ initialUsers }) => {
  const [users, setUsers] = useState<User[]>(initialUsers || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchName, setSearchName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    user_name: "",
    user_username: "",
    user_tel: "",
    user_address: "",
    user_age: 0,
    user_password: "",
    role: "",
  });

  // สำหรับ Reset Password
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const router = useRouter();

  // Update users state if initialUsers change
  useEffect(() => {
    setUsers(initialUsers || []);
  }, [initialUsers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "user_age" ? parseInt(value) || 0 : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      user_name: "",
      user_username: "",
      user_tel: "",
      user_address: "",
      user_age: 0,
      user_password: "",
      role: "",
    });
    setEditingUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editingUser) {
        const updatedUser = await updateUser(editingUser.user_id, formData);
        setUsers(users.map(u => (u.user_id === updatedUser.user_id ? updatedUser : u)));
      } else {
        const newUser = await createUser(formData);
        setUsers([...users, newUser]);
      }
      setShowForm(false);
      resetForm();
      router.refresh();
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      user_name: user.user_name || "",
      user_username: user.user_username || "",
      user_tel: user.user_tel || "",
      user_address: user.user_address || "",
      user_age: user.user_age || 0,
      user_password: "",
      role: user.role || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?")) return;
    setLoading(true);
    setError(null);
    try {
      await deleteUser(userId);
      setUsers(users.filter(u => u.user_id !== userId));
      router.refresh();
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการลบผู้ใช้");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetUser) return;
    if (!newPassword) return alert("กรุณากรอกรหัสผ่านใหม่");

    setLoading(true);
    try {
      const res = await resetUserPasswordAction(resetUser.user_id, resetUser.user_username, newPassword);
      if (!res.success) throw new Error(res.message);
      alert(`รีเซ็ตรหัสผ่านสำเร็จสำหรับ ${resetUser.user_username}`);
      setResetUser(null);
      setNewPassword("");
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน");
    } finally {
      setLoading(false);
    }
  };

  // กรอง users โดยตรวจสอบ undefined
  const filteredUsers = useMemo(() => {
    return users.filter(u =>
      (u.user_name || "").toLowerCase().includes(searchName.toLowerCase())
    );
  }, [users, searchName]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      {/* Search */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
        <input
          type="text"
          placeholder="ค้นหาชื่อผู้ใช้..."
          value={searchName}
          onChange={e => setSearchName(e.target.value)}
          className="border rounded py-1 px-2 w-full md:w-64"
        />
        <button
          onClick={() => { setShowForm(true); resetForm(); }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          เพิ่มผู้ใช้ใหม่
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold mb-3">{editingUser ? "แก้ไขผู้ใช้" : "เพิ่มผู้ใช้"}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="ชื่อ"
              name="user_name"
              value={formData.user_name}
              onChange={handleInputChange}
              className="border rounded py-2 px-3 w-full"
              required
            />
            <input
              type="text"
              placeholder="Username"
              name="user_username"
              value={formData.user_username}
              onChange={handleInputChange}
              className="border rounded py-2 px-3 w-full"
              required
            />
            <input
              type="text"
              placeholder="เบอร์โทร"
              name="user_tel"
              value={formData.user_tel}
              onChange={handleInputChange}
              className="border rounded py-2 px-3 w-full"
              required
            />
            <input
              type="text"
              placeholder="ที่อยู่"
              name="user_address"
              value={formData.user_address}
              onChange={handleInputChange}
              className="border rounded py-2 px-3 w-full"
              required
            />
            <input
              type="number"
              placeholder="อายุ"
              name="user_age"
              value={formData.user_age}
              onChange={handleInputChange}
              className="border rounded py-2 px-3 w-full"
              required
            />
            {!editingUser && (
              <input
                type="password"
                placeholder="รหัสผ่าน"
                name="user_password"
                value={formData.user_password}
                onChange={handleInputChange}
                className="border rounded py-2 px-3 w-full"
                required
              />
            )}
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                {editingUser ? "บันทึกการแก้ไข" : "เพิ่มผู้ใช้"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); resetForm(); }}
                className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-2">รีเซ็ตรหัสผ่าน</h3>
            <p className="mb-4">สำหรับผู้ใช้: <strong>{resetUser.user_username || resetUser.user_name}</strong></p>
            <input
              type="password"
              placeholder="รหัสผ่านใหม่"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border rounded py-2 px-3 w-full mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setResetUser(null)}
                className="bg-gray-400 hover:bg-gray-600 text-white py-1 px-3 rounded"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleResetPassword}
                className="bg-green-500 hover:bg-green-700 text-white py-1 px-3 rounded"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-sm">
              <th className="py-3 px-6 text-left">ชื่อ</th>
              <th className="py-3 px-6 text-left">Username</th>
              <th className="py-3 px-6 text-left">เบอร์โทร</th>
              <th className="py-3 px-6 text-left">ที่อยู่</th>
              <th className="py-3 px-6 text-left">อายุ</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {filteredUsers.map(user => (
              <tr key={user.user_id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-6">{user.user_name || "-"}</td>
                <td className="py-3 px-6">{user.user_username || "-"}</td>
                <td className="py-3 px-6">{user.user_tel || "-"}</td>
                <td className="py-3 px-6">{user.user_address || "-"}</td>
                <td className="py-3 px-6">{user.user_age || 0}</td>
                <td className="py-3 px-6 text-center flex justify-center gap-2">
                  <button onClick={() => handleEdit(user)} className="bg-yellow-500 hover:bg-yellow-700 text-white py-1 px-3 rounded text-xs">
                    แก้ไข
                  </button>
                  <button onClick={() => handleDelete(user.user_id)} className="bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded text-xs">
                    ลบ
                  </button>
                  <button onClick={() => setResetUser(user)} className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded text-xs">
                    Reset Password
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className="text-blue-500 text-center mt-4">กำลังโหลด...</p>}
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default UsersTable;
