"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { RepairItem, RepairFormData, RepairlistItem } from "@/types/repair";
import { getAllRepairs, createRepairItem, updateRepairItem, deleteRepairItem, getAllRepairlists } from "@/lib/api";
import { getAllStays } from "@/lib/api";

interface StayWithRoom {
  stay_id: string;
  room_num: string;
}

const RepairsTable = () => {
  const router = useRouter();

  const [repairs, setRepairs] = useState<RepairItem[]>([]);
  const [repairlists, setRepairlists] = useState<RepairlistItem[]>([]);
  const [stays, setStays] = useState<StayWithRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingRepair, setEditingRepair] = useState<RepairItem | null>(null);

  const [formData, setFormData] = useState<RepairFormData>({
    stay_id: "",
    admin_id: "5779bb7e-5b77-4f0f-905b-4bde758059bf",
    repairlist_id: 0,
    status: "pending",
    reported_date: new Date().toISOString().split("T")[0],
  });

  // โหลดข้อมูลทั้งหมด
  useEffect(() => {
    fetchRepairs();
    fetchStays();
    fetchRepairlists();
  }, []);

  const fetchRepairs = async () => {
    try {
      const data = await getAllRepairs();
      setRepairs(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  const fetchStays = async () => {
    try {
      const data = await getAllStays();
      setStays(data.map(s => ({ stay_id: s.stay_id, room_num: s.room_num || "" })));
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchRepairlists = async () => {
    try {
      const data = await getAllRepairlists();
      setRepairlists(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      stay_id: "",
      admin_id: "5779bb7e-5b77-4f0f-905b-4bde758059bf",
      repairlist_id: 0,
      status: "pending",
      reported_date: new Date().toISOString().split("T")[0],
    });
    setEditingRepair(null);
  };

  const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  if (!formData.stay_id || !formData.repairlist_id) {
    setError("กรุณาเลือกห้องและรายการซ่อมให้ถูกต้อง");
    setLoading(false);
    return;
  }

  // แปลงวันที่เป็น ISO string
  const repairDateISO = formData.reported_date
    ? new Date(formData.reported_date).toISOString()
    : new Date().toISOString();

  const payload = {
    stay_id: formData.stay_id,
    admin_id: formData.admin_id,
    repairlist_id: String(formData.repairlist_id),
    repair_status: formData.status || "pending",
    repair_date: repairDateISO,
  };

  try {
    if (editingRepair) {
      await updateRepairItem(editingRepair.repair_id, payload);
    } else {
      await createRepairItem(payload);
    }
    resetForm();
    setShowForm(false);
    fetchRepairs();
  } catch (err: any) {
    console.error(err);
    setError(err.message || "เกิดข้อผิดพลาด");
  } finally {
    setLoading(false);
  }
};

  const handleEdit = (item: RepairItem) => {
    setEditingRepair(item);
    const stay = stays.find(s => s.room_num === item.room_num);
    setFormData({
      stay_id: stay?.stay_id || "",
      admin_id: item.admin_id || "5779bb7e-5b77-4f0f-905b-4bde758059bf",
      repairlist_id: item.repairlist?.repairlist_id || 0,
      status: item.repair_status?.toString() || "pending",
      reported_date: item.repair_date?.split("T")[0] || new Date().toISOString().split("T")[0],
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบรายการซ่อมนี้?")) return;
    setLoading(true);
    setError(null);
    try {
      await deleteRepairItem(id);
      fetchRepairs();
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      <button
        onClick={() => { setShowForm(true); resetForm(); }}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        เพิ่มรายการซ่อมใหม่
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg bg-gray-50 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="stay_id">ห้อง:</label>
            <select
              id="stay_id"
              value={formData.stay_id}
              onChange={e => setFormData(prev => ({ ...prev, stay_id: e.target.value }))}
              required
              className="shadow border rounded w-full py-2 px-3"
            >
              <option value="">-- เลือกห้อง --</option>
              {stays.map(s => (
                <option key={s.stay_id} value={s.stay_id}>{s.room_num}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="repairlist_id">รายการซ่อม:</label>
            <select
              id="repairlist_id"
              value={formData.repairlist_id ? String(formData.repairlist_id) : ""}
              onChange={e => setFormData(prev => ({ ...prev, repairlist_id: Number(e.target.value) }))}
              required
              className="shadow border rounded w-full py-2 px-3"
            >
              <option value="">-- เลือกรายการซ่อม --</option>
              {repairlists.map(r => (
                <option key={r.repairlist_id} value={String(r.repairlist_id)}>
                  {r.repairlist_details} ({r.repairlist_price})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="status">สถานะ:</label>
            <select
              id="status"
              value={formData.status}
              onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="shadow border rounded w-full py-2 px-3"
            >
              <option value="pending">รอดำเนินการ</option>
              <option value="in_progress">กำลังดำเนินการ</option>
              <option value="completed">ซ่อมแล้ว</option>
              <option value="cancelled">ยกเลิกแล้ว</option>
            </select>
          </div>

          <div>
            <label htmlFor="reported_date">วันที่แจ้งซ่อม:</label>
            <input
              type="date"
              id="reported_date"
              value={formData.reported_date}
              onChange={e => setFormData(prev => ({ ...prev, reported_date: e.target.value }))}
              className="shadow border rounded w-full py-2 px-3"
              required
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-2 mt-4">
            <button type="submit" disabled={loading} className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded">
              {editingRepair ? "บันทึกการแก้ไข" : "เพิ่มรายการซ่อม"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="bg-gray-400 hover:bg-gray-600 text-white py-2 px-4 rounded">
              ยกเลิก
            </button>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>
      )}

      {repairs.length === 0 && !loading ? (
        <p className="text-gray-600">ไม่พบรายการซ่อม</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm">
                <th className="py-3 px-6 text-left">ห้อง</th>
                <th className="py-3 px-6 text-left">รายละเอียด</th>
                <th className="py-3 px-6 text-left">ราคา</th>
                <th className="py-3 px-6 text-left">ผู้แจ้งซ่อม</th>
                <th className="py-3 px-6 text-left">สถานะ</th>
                <th className="py-3 px-6 text-left">วันที่แจ้ง</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {repairs.map(item => (
                <tr key={item.repair_id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6">{item.room_num}</td>
                  <td className="py-3 px-6">{item.repairlist?.repairlist_details}</td>
                  <td className="py-3 px-6">{item.repairlist?.repairlist_price}</td>
                  <td className="py-3 px-6">{item.admin_name}</td>
                  <td className="py-3 px-6">{item.repair_status}</td>
                  <td className="py-3 px-6">{item.repair_date?.split("T")[0]}</td>
                  <td className="py-3 px-6 text-center flex justify-center gap-2">
                    <button onClick={() => handleEdit(item)} className="bg-yellow-500 hover:bg-yellow-700 text-white py-1 px-3 rounded text-xs">แก้ไข</button>
                    <button onClick={() => handleDelete(item.repair_id)} className="bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded text-xs">ลบ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RepairsTable;
