// src/components/Table.tsx
"use client";
import { useRouter } from 'next/navigation';
import { useState, useEffect, FormEvent } from 'react';
import { User, UserFormData } from '@/types/user';
import { createUser, updateUser, deleteUser } from '@/lib/api'; // Import CRUD functions

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
    user_name: '',
    user_username: '',
    user_tel: '',
    user_address: '',
    user_age: 0,
    role: '',
    user_password: '', // *** มี password ใน initial state แล้ว
  });

  // อัปเดต State เมื่อ initialUsers เปลี่ยน (เช่น หลังการสร้าง/แก้ไข/ลบแล้ว revalidate data)
  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'user_age' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editingUser) {
        // สำหรับการแก้ไข: ไม่จำเป็นต้องส่ง password ไปถ้า Backend ไม่ได้คาดหวังให้เปลี่ยน password ผ่าน endpoint นี้
        // หาก Backend ต้องการให้ส่ง password หรือต้องการช่องเปลี่ยน password แยกต่างหาก
        // คุณอาจจะต้องจัดการ formData.password ให้เป็น optional หรือลบออกก่อนส่ง
        const updatedUser = await updateUser(editingUser.user_id, formData);
        if (updatedUser) {
          setUsers(users.map(u => (u.user_id === updatedUser.user_id ? updatedUser : u)));
          console.log('User updated:', updatedUser);
        } else {
          throw new Error('Failed to update user.');
        }
      } else {
        // สำหรับการสร้าง: ส่ง password ไปด้วย
        const newUser = await createUser(formData);
        if (newUser) {
          setUsers([...users, newUser]);
          console.log('User created:', newUser);
        } else {
          throw new Error('Failed to create user.');
        }
      }
      setShowForm(false);
      setEditingUser(null);
      resetForm();
      router.refresh
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'An error occurred during submission.');
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
      role: user.role,
      user_password: '', // *** ไม่ต้องใส่ password เดิมลงในฟอร์มแก้ไข (เพื่อความปลอดภัย) ***
                    // ผู้ใช้ควรกรอกใหม่ถ้าต้องการเปลี่ยน หรือมีช่องแยกต่างหากสำหรับเปลี่ยนรหัสผ่าน
    });
    setShowForm(true);
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?')) {
      setLoading(true);
      setError(null);
      try {
        const success = await deleteUser(userId);
        if (success) {
          setUsers(users.filter(user => user.user_id !== userId));
          console.log('User deleted:', userId);
          router.refresh();
        } else {
          throw new Error('Failed to delete user.');
        }
      } catch (err: any) {
        console.error('Delete error:', err);
        setError(err.message || 'An error occurred during deletion.');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      user_name: '',
      user_username: '',
      user_tel: '',
      user_address: '',
      user_age: 0,
      role: '',
      user_password: '', // *** มี password ใน resetForm แล้ว
    });
    setEditingUser(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">

      <button
        onClick={() => { setShowForm(true); resetForm(); }}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        เพิ่มผู้ใช้ใหม่
      </button>

      {showForm && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold mb-3">{editingUser ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input fields as per your UserFormData type */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="user_name">ชื่อ:</label>
              <input type="text" id="user_name" name="user_name" value={formData.user_name} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="user_username">ชื่อผู้ใช้ (Username):</label>
              <input type="text" id="user_username" name="user_username" value={formData.user_username} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="user_tel">เบอร์โทรศัพท์:</label>
              <input type="text" id="user_tel" name="user_tel" value={formData.user_tel} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="user_address">ที่อยู่:</label>
              <input type="text" id="user_address" name="user_address" value={formData.user_address} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="user_age">อายุ:</label>
              <input type="number" id="user_age" name="user_age" value={formData.user_age} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">บทบาท:</label>
              <select id="role" name="role" value={formData.role} onChange={handleInputChange} className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                <option value="">เลือกบทบาท</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {/* *** เพิ่มช่องกรอก Password ตรงนี้ *** */}
            {/* โดยทั่วไป password จะมีแค่ตอนสร้างหรือเปลี่ยนรหัสผ่าน ไม่ใช่ตอนแก้ไขข้อมูลทั่วไป */}
            {!editingUser && ( // แสดงเฉพาะตอนเพิ่มผู้ใช้ใหม่
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">รหัสผ่าน:</label>
                <input
                  type="password" // ใช้ type="password" เพื่อซ่อนตัวอักษร
                  id="user_password"
                  name="user_password"
                  value={formData.user_password}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required // ให้เป็น field ที่ต้องกรอก
                />
              </div>
            )}
            <div className="md:col-span-2 flex justify-end gap-2 mt-4">
              <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50" disabled={loading}>
                {loading ? 'กำลังบันทึก...' : (editingUser ? 'บันทึกการแก้ไข' : 'เพิ่มผู้ใช้')}
              </button>
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" disabled={loading}>
                ยกเลิก
              </button>
            </div>
          </form>
          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        </div>
      )}

      {/* User List Table */}
      {users.length === 0 && !loading && !error ? (
        <p className="text-gray-600">ไม่พบข้อมูลผู้ใช้</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">ชื่อ</th>
                <th className="py-3 px-6 text-left">Username</th>
                <th className="py-3 px-6 text-left">เบอร์โทร</th>
                <th className="py-3 px-6 text-left">ที่อยู่</th>
                <th className="py-3 px-6 text-left">อายุ</th>
                <th className="py-3 px-6 text-left">บทบาท</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {users.map((user) => (
                <tr key={user.user_id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-left whitespace-nowrap">{user.user_name}</td>
                  <td className="py-3 px-6 text-left">{user.user_username}</td>
                  <td className="py-3 px-6 text-left">{user.user_tel}</td>
                  <td className="py-3 px-6 text-left">{user.user_address}</td>
                  <td className="py-3 px-6 text-left">{user.user_age}</td>
                  <td className="py-3 px-6 text-left">{user.role}</td>
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
          {error && <p className="text-red-500 text-center mt-4">Error: {error}</p>}
        </div>
      )}
    </div>
  );
};

export default Table; // อย่าลืม export Component ด้วย