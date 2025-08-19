// src/components/RepairsTable.tsx
"use client";
import { useRouter } from 'next/navigation';
import { useState, useEffect, FormEvent } from 'react';
import { RepairItem, RepairFormData } from '@/types/repair';
import { addRepairItemAction, updateRepairItemAction, deleteRepairItemAction } from '@/app/(dashboard)/repairs/repairActions';

interface Room {
  room_id: string;
  room_num: string;
}

interface RepairsTableProps {
  initialRepairs?: RepairItem[];
  rooms?: Room[];
}

// Component สำหรับแสดงวันที่ ฝั่ง client
const DateDisplay = ({ date, fallback = 'N/A' }: { date?: string | null; fallback?: string }) => {
  const [formatted, setFormatted] = useState<string>('');

  useEffect(() => {
    if (date) setFormatted(new Date(date).toLocaleDateString('th-TH'));
  }, [date]);

  return <>{formatted || fallback}</>;
};

const RepairsTable: React.FC<RepairsTableProps> = ({ initialRepairs = [], rooms = [] }) => {
  const [repairs, setRepairs] = useState<RepairItem[]>(initialRepairs);
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingRepairItem, setEditingRepairItem] = useState<RepairItem | null>(null);

  const [formData, setFormData] = useState<RepairFormData>({
    room_id: '',
    repair_details: '',
    status: 'pending',
    reported_date: new Date().toISOString().split('T')[0],
    repair_price: '',
    admin_id: '',
  });

  useEffect(() => setRepairs(initialRepairs), [initialRepairs]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getBackendStatusValue = (status: string) => {
    switch (status) {
      case 'pending':
      case '0':
        return '0';
      case 'in_progress':
      case '1':
        return '1';
      case 'completed':
      case '2':
        return '2';
      case 'cancelled':
      case '3':
        return '3';
      default:
        return status;
    }
  };

  const getRepairStatusValueForForm = (status: string | number) => {
    switch (String(status)) {
      case '0':
      case 'pending':
        return 'pending';
      case '1':
      case 'in_progress':
        return 'in_progress';
      case '2':
      case 'completed':
        return 'completed';
      case '3':
      case 'cancelled':
        return 'cancelled';
      default:
        return String(status);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const dataToSend: RepairFormData = { ...formData, status: getBackendStatusValue(formData.status) };
      let result;

      if (editingRepairItem) {
        result = await updateRepairItemAction(String(editingRepairItem.repair_id), dataToSend);
      } else {
        result = await addRepairItemAction(dataToSend);
      }

      if (result.success) {
        router.refresh();
        setShowForm(false);
        setEditingRepairItem(null);
        resetForm();
      } else {
        throw new Error(result.message || 'Failed to perform repair item operation.');
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: RepairItem) => {
    setEditingRepairItem(item);
    setFormData({
      room_id: item.room_num || '',
      repair_details: item.repairlist?.repairlist_details || '',
      status: getRepairStatusValueForForm(item.repair_status),
      reported_date: item.repair_date ? item.repair_date.split('T')[0] : '',
      repair_price: item.repairlist?.repairlist_price?.toString() || '',
      admin_id: item.admin_name || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (repairId: string) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบรายการซ่อมนี้?')) return;
    setLoading(true);
    setError(null);
    try {
      const result = await deleteRepairItemAction(repairId);
      if (result.success) router.refresh();
      else throw new Error(result.message || 'Failed to delete repair item.');
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(err.message || 'An error occurred during deletion.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      room_id: '',
      repair_details: '',
      status: 'pending',
      reported_date: '',
      repair_price: '',
      admin_id: '',
    });
    setEditingRepairItem(null);
  };

  const getStatusDisplayText = (status: string | number) => {
    switch (String(status)) {
      case '0':
      case 'pending':
        return 'รอดำเนินการ';
      case '1':
      case 'in_progress':
        return 'กำลังดำเนินการ';
      case '2':
      case 'completed':
        return 'เสร็จสมบูรณ์';
      case '3':
      case 'cancelled':
        return 'ยกเลิกแล้ว';
      default:
        return String(status);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      {/* Button เพิ่มรายการ */}
      <button
        onClick={() => { setShowForm(true); resetForm(); }}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        เพิ่มรายการซ่อมใหม่
      </button>

      {/* Form */}
      {showForm && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold mb-3">{editingRepairItem ? 'แก้ไขรายการซ่อม' : 'เพิ่มรายการซ่อม'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dropdown room */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="room_id">เลือกห้อง:</label>
              <select
                id="room_id"
                name="room_id"
                value={formData.room_id}
                onChange={handleInputChange}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="">-- เลือกห้อง --</option>
                {rooms
                  ?.sort((a, b) => a.room_num.localeCompare(b.room_num))
                  .map(room => (
                    <option key={room.room_id} value={room.room_id}>
                      {room.room_num}
                    </option>
                  ))}
              </select>
            </div>

            {/* Repair details */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="repair_details">รายละเอียด:</label>
              <textarea
                id="repair_details"
                name="repair_details"
                value={formData.repair_details}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
                rows={3}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">สถานะ:</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="pending">รอดำเนินการ</option>
                <option value="in_progress">กำลังดำเนินการ</option>
                <option value="completed">เสร็จสมบูรณ์</option>
                <option value="cancelled">ยกเลิกแล้ว</option>
              </select>
            </div>

            {/* Reported date */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reported_date">วันที่แจ้งซ่อม:</label>
              <input
                type="date"
                id="reported_date"
                name="reported_date"
                value={formData.reported_date}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="repair_price">ราคา:</label>
              <input
                type="text"
                id="repair_price"
                name="repair_price"
                value={formData.repair_price}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>

            {/* Admin */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="admin_id">Admin:</label>
              <input
                type="text"
                id="admin_id"
                name="admin_id"
                value={formData.admin_id}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-2 mt-4">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'กำลังบันทึก...' : (editingRepairItem ? 'บันทึกการแก้ไข' : 'เพิ่มรายการซ่อม')}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); resetForm(); }}
                className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={loading}
              >
                ยกเลิก
              </button>
            </div>
          </form>
          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        </div>
      )}

      {/* Repair List Table */}
      {repairs.length === 0 && !loading && !error ? (
        <p className="text-gray-600">ไม่พบข้อมูลรายการซ่อมบำรุง</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">ห้อง</th>
                <th className="py-3 px-6 text-left">รายละเอียด</th>
                <th className="py-3 px-6 text-left">ราคา</th>
                <th className="py-3 px-6 text-left">ผู้แจ้งซ่อม (Admin)</th>
                <th className="py-3 px-6 text-left">สถานะ</th>
                <th className="py-3 px-6 text-left">วันที่แจ้ง</th>
                <th className="py-3 px-6 text-left">วันที่ซ่อมเสร็จ</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {repairs?.map(item => (
                <tr key={item.repair_id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-left">{item.room_num}</td>
                  <td className="py-3 px-6 text-left">{item.repairlist?.repairlist_details}</td>
                  <td className="py-3 px-6 text-left">{item.repairlist?.repairlist_price}</td>
                  <td className="py-3 px-6 text-left">{item.admin_name}</td>
                  <td className="py-3 px-6 text-left">{getStatusDisplayText(item.repair_status)}</td>
                  <td className="py-3 px-6 text-left"><DateDisplay date={item.repair_date} /></td>
                  <td className="py-3 px-6 text-left"><DateDisplay date={item.completed_date} fallback="ยังไม่เสร็จ" /></td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex item-center justify-center space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded text-xs"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDelete(item.repair_id)}
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

export default RepairsTable;
