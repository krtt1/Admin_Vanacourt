"use client";

import { useState, useEffect, FormEvent } from "react";
import { Stay, StayFormData, User, Room } from "@/types/stay";
import { addStayAction, updateStayAction, deleteStayAction } from "@/app/(dashboard)/stay/StayAction";

interface StayTableProps {
  initialStays?: Stay[];
  users?: User[];
  rooms?: Room[];
}

const StayTable: React.FC<StayTableProps> = ({ initialStays = [], users = [], rooms = [] }) => {
  const [stays, setStays] = useState<Stay[]>(initialStays);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingStay, setEditingStay] = useState<Stay | null>(null);

  const [formData, setFormData] = useState<StayFormData>({
    stay_date: new Date().toISOString().split("T")[0],
    stay_status: 0,
    stay_dateout: "",
    user_id: "",
    room_id: "",
  });

  useEffect(() => {
    setStays(initialStays);
  }, [initialStays]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === "stay_status" ? Number(value) : value }));
  };

  const resetForm = () => {
    setFormData({
      stay_date: new Date().toISOString().split("T")[0],
      stay_status: 0,
      stay_dateout: "",
      user_id: "",
      room_id: "",
    });
    setEditingStay(null);
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

  const handleDelete = async (stayId: string) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ที่จะลบรายการนี้?")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await deleteStayAction(stayId);
      if (res.success) {
        setStays(prev => prev.filter(s => s.stay_id !== stayId));
      } else {
        throw new Error(res.message || "ไม่สามารถลบรายการได้");
      }
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการลบ");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let res;
      if (editingStay) {
        res = await updateStayAction(editingStay.stay_id, formData);
        if (res.success) {
          setStays(prev => prev.map(s => s.stay_id === res.stay!.stay_id ? res.stay! : s));
        }
      } else {
        res = await addStayAction(formData);
        if (res.success) {
          setStays(prev => [...prev, res.stay!]);
        }
      }
      if (res.success) {
        setShowForm(false);
        resetForm();
      } else {
        throw new Error(res.message);
      }
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return "เข้าพัก";
      case 1: return "กำลังเข้าพัก";
      case 2: return "ย้ายออกแล้ว";
      default: return "-";
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      <button
        onClick={() => { setShowForm(true); resetForm(); }}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        เพิ่ม Stay
      </button>

      {showForm && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold mb-3">{editingStay ? "แก้ไข Stay" : "เพิ่ม Stay"}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">ผู้ใช้:</label>
              <select name="user_id" value={formData.user_id} onChange={handleInputChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700">
                <option value=""> เลือกผู้ใช้ </option>
                {users.map(u => <option key={u.id} value={u.id}>{u.user_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">ห้อง:</label>
              <select name="room_id" value={formData.room_id} onChange={handleInputChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700">
                <option value=""> เลือกห้อง </option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.room_num}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">วันที่เข้าพัก:</label>
              <input type="date" name="stay_date" value={formData.stay_date} onChange={handleInputChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"/>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">สถานะ:</label>
              <select name="stay_status" value={formData.stay_status} onChange={handleInputChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700">
                <option value={0}>เข้าพัก</option>
                <option value={1}>กำลังเข้าพัก</option>
                <option value={2}>ย้ายออกแล้ว</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">วันที่ย้ายออก:</label>
              <input type="date" name="stay_dateout" value={formData.stay_dateout || ""} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"/>
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-4">
              <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                {editingStay ? "แก้ไข" : "บันทึก"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
                ยกเลิก
              </button>
            </div>
          </form>
          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        </div>
      )}

      {stays.length === 0 && !loading && !error ? (
        <p className="text-gray-600">ไม่พบข้อมูล</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">ผู้ใช้</th>
                <th className="py-3 px-6 text-left">ห้อง</th>
                <th className="py-3 px-6 text-left">วันที่เข้าพัก</th>
                <th className="py-3 px-6 text-left">วันที่ย้ายออก</th>
                <th className="py-3 px-6 text-left">สถานะ</th>
                <th className="py-3 px-6 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {stays.slice().sort((a,b)=>a.stay_date.localeCompare(b.stay_date)).map(s => (
                <tr key={s.stay_id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6">{s.user_name}</td>
                  <td className="py-3 px-6">{s.room_num}</td>
                  <td className="py-3 px-6">{s.stay_date}</td>
                  <td className="py-3 px-6">{s.stay_dateout || "-"}</td>
                  <td className="py-3 px-6">{getStatusText(s.stay_status)}</td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button onClick={() => handleEdit(s)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded text-xs">แก้ไข</button>
                      <button onClick={() => handleDelete(s.stay_id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs">ลบ</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <p className="text-blue-500 text-center mt-4">กำลังโหลด...</p>}
          {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default StayTable;
