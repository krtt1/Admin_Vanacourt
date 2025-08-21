"use client";
import { useState, useEffect, FormEvent } from "react";
import { Stay, StayFormData, User, Room } from "@/types/stay";

interface StayTableProps {
  initialStays: Stay[];
  users: User[];
  rooms: Room[];
  addStayAction: (formData: StayFormData) => Promise<{ success: boolean; stay?: Stay; message?: string }>;
  updateStayAction: (stayId: string, formData: StayFormData) => Promise<{ success: boolean; stay?: Stay; message?: string }>;
  deleteStayAction: (stayId: string) => Promise<{ success: boolean; message?: string }>;
}

const StayTable: React.FC<StayTableProps> = ({ initialStays, users, rooms, addStayAction, updateStayAction, deleteStayAction }) => {
  const [stays, setStays] = useState<Stay[]>(initialStays);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingStay, setEditingStay] = useState<Stay | null>(null);
  const [stayToDelete, setStayToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState<StayFormData>({
    stay_date: "",
    stay_status: "",
    stay_dateout: "",
    user_id: "",
    room_id: "",
  });

  useEffect(() => {
    setStays(initialStays);
  }, [initialStays]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ stay_date: "", stay_status: "", stay_dateout: "", user_id: "", room_id: "" });
    setEditingStay(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editingStay) {
        const result = await updateStayAction(editingStay.stay_id, formData);
        if (result.success) setStays(stays.map(s => s.stay_id === editingStay.stay_id ? result.stay! : s));
        else throw new Error(result.message || "Failed to update stay");
      } else {
        const result = await addStayAction(formData);
        if (result.success) setStays([...stays, result.stay!]);
        else throw new Error(result.message || "Failed to add stay");
      }
      setShowForm(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (stay: Stay) => {
    setEditingStay(stay);
    setFormData({
      stay_date: stay.stay_date,
      stay_status: stay.stay_status,
      stay_dateout: stay.stay_dateout || "",
      user_id: stay.user_id || "",
      room_id: stay.room_id || "",
    });
    setShowForm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!stayToDelete) return;
    setLoading(true);
    setError(null);

    try {
      const result = await deleteStayAction(stayToDelete);
      if (result.success) setStays(stays.filter(s => s.stay_id !== stayToDelete));
      else throw new Error(result.message || "Failed to delete stay");
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
      setStayToDelete(null);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      <button onClick={() => { setShowForm(true); resetForm(); }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4">
        เพิ่มข้อมูล Stay ใหม่
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 border rounded-lg bg-gray-50">
          <div>
            <label>ผู้เข้าพัก:</label>
            <select name="user_id" value={formData.user_id} onChange={handleInputChange} className="border rounded w-full py-2 px-3" required>
              <option value="">เลือกผู้เข้าพัก</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.user_name}</option>)}
            </select>
          </div>
          <div>
            <label>หมายเลขห้อง:</label>
            <select name="room_id" value={formData.room_id} onChange={handleInputChange} className="border rounded w-full py-2 px-3" required>
              <option value="">เลือกห้อง</option>
              {rooms.map(r => <option key={r.id} value={r.id}>{r.room_num}</option>)}
            </select>
          </div>
          <div>
            <label>วันที่เข้าพัก:</label>
            <input type="date" name="stay_date" value={formData.stay_date} onChange={handleInputChange} className="border rounded w-full py-2 px-3" required />
          </div>
          <div>
            <label>วันที่ออก:</label>
            <input type="date" name="stay_dateout" value={formData.stay_dateout || ""} onChange={handleInputChange} className="border rounded w-full py-2 px-3" />
          </div>
          <div>
            <label>สถานะ:</label>
            <input type="text" name="stay_status" value={formData.stay_status} onChange={handleInputChange} className="border rounded w-full py-2 px-3" required />
          </div>

          <div className="md:col-span-2 flex justify-end gap-2 mt-4">
            <button type="submit" className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded">{loading ? "กำลังบันทึก..." : (editingStay ? "บันทึกการแก้ไข" : "เพิ่มที่พัก")}</button>
            <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="bg-gray-400 hover:bg-gray-600 text-white py-2 px-4 rounded">ยกเลิก</button>
          </div>
          {error && <p className="text-red-500 col-span-2 mt-2">{error}</p>}
        </form>
      )}

      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 text-left">หมายเลขห้อง</th>
            <th className="py-2 px-4 text-left">ชื่อผู้เข้าพัก</th>
            <th className="py-2 px-4 text-left">วันที่เข้าพัก</th>
            <th className="py-2 px-4 text-left">วันที่ออก</th>
            <th className="py-2 px-4 text-left">สถานะ</th>
            <th className="py-2 px-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {stays.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-4 text-center text-gray-500">{loading ? 'กำลังโหลด...' : 'ไม่พบข้อมูล'}</td>
            </tr>
          ) : (
            stays.map(s => (
              <tr key={s.stay_id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{s.room_num}</td>
                <td className="py-2 px-4">{s.user_name}</td>
                <td className="py-2 px-4">{s.stay_date}</td>
                <td className="py-2 px-4">{s.stay_dateout || "-"}</td>
                <td className="py-2 px-4">{s.stay_status}</td>
                <td className="py-2 px-4 text-center">
                  <button onClick={() => handleEdit(s)} className="bg-yellow-500 hover:bg-yellow-700 text-white px-2 py-1 rounded text-xs mr-2">แก้ไข</button>
                  <button onClick={() => setStayToDelete(s.stay_id)} className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded text-xs">ลบ</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StayTable;
