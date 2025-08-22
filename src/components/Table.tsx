"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, FormEvent, useMemo } from "react";
import { User, UserFormData } from "@/types/user";
import { createUser, updateUser, deleteUser } from "@/lib/api";

interface TableProps {
  initialUsers: User[];
}

const Table: React.FC<TableProps> = ({ initialUsers }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    user_name: "",
    user_username: "",
    user_tel: "",
    user_address: "",
    user_age: 0,
    user_password: "",
  });
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<string>("");

  useEffect(() => {
    setUsers(initialUsers);
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
    });
    setEditingUser(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editingUser) {
        const updatedUser = await updateUser(editingUser.user_id, formData);
        setUsers(users.map((u) => (u.user_id === updatedUser.user_id ? updatedUser : u)));
      } else {
        const newUser = await createUser(formData);
        setUsers([...users, newUser]);
      }
      setShowForm(false);
      setEditingUser(null);
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
      user_name: user.user_name,
      user_username: user.user_username,
      user_tel: user.user_tel,
      user_address: user.user_address,
      user_age: user.user_age,
      user_password: "",
    });
    setShowForm(true);
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?")) return;

    setLoading(true);
    setError(null);

    try {
      await deleteUser(userId);
      setUsers(users.filter((u) => u.user_id !== userId));
      router.refresh();
    } catch (err: any) {
      if (err.message.includes("ยังมีการใช้งานอยู่ในตาราง Stay")) {
        alert("ไม่สามารถลบผู้ใช้ได้ เนื่องจากยังมี Stay อยู่ในระบบ");
      } else if (err.message.includes("ไม่พบผู้ใช้นี้")) {
        alert("ไม่พบผู้ใช้นี้ อาจถูกลบไปแล้ว");
      } else {
        alert("เกิดข้อผิดพลาดในการลบผู้ใช้");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = (userId: string) => {
    setResetPasswordUserId(userId);
    setNewPassword("");
  };

  const submitResetPassword = async () => {
    if (!resetPasswordUserId) return;
    if (!newPassword) {
      alert("กรุณากรอกรหัสผ่านใหม่");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await updateUser(resetPasswordUserId, { user_password: newPassword });
      setUsers(users.map((u) => (u.user_id === updatedUser.user_id ? updatedUser : u)));
      setResetPasswordUserId(null);
      setNewPassword("");
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
    } finally {
      setLoading(false);
    }
  };

  // ================== SORT USERS ==================
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const usernameA = a.user_username ?? "";
      const usernameB = b.user_username ?? "";
      const matchA = usernameA.match(/([A-Za-z]+)(\d*)/);
      const matchB = usernameB.match(/([A-Za-z]+)(\d*)/);
      if (!matchA || !matchB) return 0;
      const [_, lettersA, numA] = matchA;
      const [__, lettersB, numB] = matchB;
      if (lettersA < lettersB) return sortOrder === "asc" ? -1 : 1;
      if (lettersA > lettersB) return sortOrder === "asc" ? 1 : -1;
      const numberCompare = parseInt(numA || "0") - parseInt(numB || "0");
      return sortOrder === "asc" ? numberCompare : -numberCompare;
    });
  }, [users, sortOrder]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      <button
        onClick={() => {
          setShowForm(true);
          resetForm();
        }}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        เพิ่มผู้ใช้ใหม่
      </button>

      {showForm && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold mb-3">{editingUser ? "แก้ไขผู้ใช้" : "เพิ่มผู้ใช้"}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="user_name">
                ชื่อ:
              </label>
              <input
                type="text"
                id="user_name"
                name="user_name"
                value={formData.user_name}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="user_username">
                Username:
              </label>
              <input
                type="text"
                id="user_username"
                name="user_username"
                value={formData.user_username}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="user_tel">
                เบอร์โทร:
              </label>
              <input
                type="text"
                id="user_tel"
                name="user_tel"
                value={formData.user_tel}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="user_address">
                ที่อยู่:
              </label>
              <input
                type="text"
                id="user_address"
                name="user_address"
                value={formData.user_address}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="user_age">
                อายุ:
              </label>
              <input
                type="number"
                id="user_age"
                name="user_age"
                value={formData.user_age}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                required
              />
            </div>
            {!editingUser && (
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="user_password">
                  รหัสผ่าน:
                </label>
                <input
                  type="password"
                  id="user_password"
                  name="user_password"
                  value={formData.user_password}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                  required
                />
              </div>
            )}
            <div className="md:col-span-2 flex justify-end gap-2 mt-4">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                disabled={loading}
              >
                {loading ? "กำลังบันทึก..." : editingUser ? "บันทึกการแก้ไข" : "เพิ่มผู้ใช้"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                disabled={loading}
              >
                ยกเลิก
              </button>
            </div>
          </form>
          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        </div>
      )}

      {users.length === 0 && !loading && !error ? (
        <p className="text-gray-600">ไม่พบข้อมูลผู้ใช้</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">ชื่อ</th>
                <th
                  className="py-3 px-6 text-left cursor-pointer"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                >
                  Username {sortOrder === "asc" ? "↑" : "↓"}
                </th>
                <th className="py-3 px-6 text-left">Password</th>
                <th className="py-3 px-6 text-left">เบอร์โทร</th>
                <th className="py-3 px-6 text-left">ที่อยู่</th>
                <th className="py-3 px-6 text-left">อายุ</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {sortedUsers.map((user) => (
                <tr key={user.user_id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-left whitespace-nowrap">{user.user_name}</td>
                  <td className="py-3 px-6 text-left">{user.user_username}</td>
                  <td className="py-3 px-6 text-left">
                    {resetPasswordUserId === user.user_id ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="รหัสผ่านใหม่"
                          className="shadow appearance-none border rounded py-1 px-2 text-gray-700"
                        />
                        <button
                          onClick={submitResetPassword}
                          className="bg-green-500 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                        >
                          บันทึก
                        </button>
                        <button
                          onClick={() => setResetPasswordUserId(null)}
                          className="bg-gray-400 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleResetPassword(user.user_id)}
                        className="bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                      >
                        Reset Password
                      </button>
                    )}
                  </td>
                  <td className="py-3 px-6 text-left">{user.user_tel}</td>
                  <td className="py-3 px-6 text-left">{user.user_address}</td>
                  <td className="py-3 px-6 text-left">{user.user_age}</td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex item-center justify-center space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded text-xs"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDelete(user.user_id)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs"
                      >
                        ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <p className="text-blue-500 text-center mt-4">กำลังโหลด...</p>}
        </div>
      )}
    </div>
  );
};

export default Table;
