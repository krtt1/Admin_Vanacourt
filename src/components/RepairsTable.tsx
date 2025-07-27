// src/components/RepairsTable.tsx
"use client";
import { useRouter } from 'next/navigation';
import { useState, useEffect, FormEvent } from 'react';
import { RepairItem, RepairFormData } from '@/types/repair'; 

// ตรวจสอบ PATH นี้อีกครั้งว่าถูกต้องแน่นอน!
import { addRepairItemAction, updateRepairItemAction, deleteRepairItemAction } from '@/app/(dashboard)/repairs/repairActions';

interface RepairsTableProps {
  initialRepairs: RepairItem[]; 
}

const RepairsTable: React.FC<RepairsTableProps> = ({ initialRepairs }) => {
  const [repairs, setRepairs] = useState<RepairItem[]>(initialRepairs); 
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingRepairItem, setEditingRepairItem] = useState<RepairItem | null>(null); 
  
  const [formData, setFormData] = useState<RepairFormData>({ 
    room_id: '', // อันนี้โอเคสำหรับ formData ที่จะส่งไป
    repair_details: '', // อันนี้โอเคสำหรับ formData ที่จะส่งไป
    status: 'pending', 
    reported_date: new Date().toISOString().split('T')[0],
    repair_price: '', // อันนี้โอเคสำหรับ formData ที่จะส่งไป
    admin_id: '', // อันนี้โอเคสำหรับ formData ที่จะส่งไป
  });

  useEffect(() => {
    setRepairs(initialRepairs); 
  }, [initialRepairs]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const getBackendStatusValue = (formStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled' | string): string => {
    switch (String(formStatus)) { 
      case 'pending': case '0': return '0';
      case 'in_progress': case '1': return '1'; 
      case 'completed': case '2': return '2'; 
      case 'cancelled': case '3': return '3'; 
      default: return String(formStatus); 
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const dataToSend: RepairFormData = { // Cast เพื่อความชัวร์
        ...formData,
        status: getBackendStatusValue(formData.status)
      };

      let result;
      if (editingRepairItem) {
        result = await updateRepairItemAction(String(editingRepairItem.repair_id), dataToSend); 
      } else {
        result = await addRepairItemAction(dataToSend);
      }

      if (result.success) {
        console.log(editingRepairItem ? 'Repair item updated successfully!' : 'Repair item created successfully!', result.repairItem);
        // เนื่องจากเป็น Client Component และมีการใช้ Server Action
        // ข้อมูลใน repairs state จะไม่ update อัตโนมัติจาก Server Action
        // คุณอาจจะต้องเรียก getAllRepairs ใหม่ หรือใช้ router.refresh()
        router.refresh(); // บังคับให้ Next.js refresh page เพื่อโหลดข้อมูลล่าสุดจาก Server Component
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

  const getRepairStatusValueForForm = (statusValue: string | number): 'pending' | 'in_progress' | 'completed' | 'cancelled' | string => {
    switch (String(statusValue)) { 
      case 'pending': case '0': return 'pending';
      case 'in_progress': case '1': return 'in_progress'; 
      case 'completed': case '2': return 'completed'; 
      case 'cancelled': case '3': return 'cancelled'; 
      default: return String(statusValue);
    }
  };

  const handleEdit = (item: RepairItem) => { 
    setEditingRepairItem(item);
    setFormData({
      room_id: item.room_num || '', // ใช้ item.room_num แทน item.room_id
      repair_details: item.repairlist?.repairlist_details || '', // ใช้ item.repairlist.repairlist_details แทน item.repair_details
      status: getRepairStatusValueForForm(item.repair_status), // ใช้ item.repair_status
      reported_date: item.repair_date ? item.repair_date.split('T')[0] : '', // ใช้ item.repair_date
      repair_price: item.repairlist?.repairlist_price?.toString() || '', // ใช้ item.repairlist.repairlist_price.toString()
      admin_id: item.admin_name || '', // ใช้ item.admin_name แทน item.admin_id
    });
    setShowForm(true);
  };

  const handleDelete = async (repairId: string) => { 
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบรายการซ่อมนี้?')) {
      setLoading(true);
      setError(null);
      try {
        const result = await deleteRepairItemAction(repairId); 

        if (result.success) {
          console.log('Repair item deleted:', repairId);
          router.refresh(); // บังคับให้ Next.js refresh page เพื่อโหลดข้อมูลล่าสุด
        } else {
          throw new Error(result.message || 'Failed to delete repair item.');
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
      room_id: '',
      repair_details: '',
      status: 'pending',
      reported_date: new Date().toISOString().split('T')[0],
      repair_price: '',
      admin_id: '', 
    });
    setEditingRepairItem(null);
  };

  const getStatusDisplayText = (statusValue: string | number): string => {
    switch (String(statusValue)) { 
      case 'pending': case '0': return 'รอดำเนินการ';
      case 'in_progress': case '1': return 'กำลังดำเนินการ'; 
      case 'completed': case '2': return 'เสร็จสมบูรณ์'; 
      case 'cancelled': case '3': return 'ยกเลิกแล้ว'; 
      default: return String(statusValue); 
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
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold mb-3">{editingRepairItem ? 'แก้ไขรายการซ่อม' : 'เพิ่มรายการซ่อม'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input fields for Repair List data */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="room_id">ID ห้อง:</label>
              <input type="text" id="room_id" name="room_id" value={formData.room_id} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="repair_details">รายละเอียด:</label> 
              <textarea id="repair_details" name="repair_details" value={formData.repair_details} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required rows={3}></textarea>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">สถานะ:</label>
              <select id="status" name="status" value={formData.status} onChange={handleInputChange} className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                <option value="pending">รอดำเนินการ</option>
                <option value="in_progress">กำลังดำเนินการ</option>
                <option value="completed">เสร็จสมบูรณ์</option>
                <option value="cancelled">ยกเลิกแล้ว</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reported_date">วันที่แจ้งซ่อม:</label>
              <input type="date" id="reported_date" name="reported_date" value={formData.reported_date} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="repair_price">ราคา:</label> 
              <input type="text" id="repair_price" name="repair_price" value={formData.repair_price} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="admin_id">Admin ID:</label>
              <input type="text" id="admin_id" name="admin_id" value={formData.admin_id} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
            </div>
            
            <div className="md:col-span-2 flex justify-end gap-2 mt-4">
              <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50" disabled={loading}>
                {loading ? 'กำลังบันทึก...' : (editingRepairItem ? 'บันทึกการแก้ไข' : 'เพิ่มรายการซ่อม')}
              </button>
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" disabled={loading}>
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
                <th className="py-3 px-6 text-left">ID รายการซ่อม</th>
                <th className="py-3 px-6 text-left">ห้อง</th> {/* เปลี่ยนเป็น "ห้อง" */}
                <th className="py-3 px-6 text-left">รายละเอียด</th>
                <th className="py-3 px-6 text-left">ราคา</th> {/* เพิ่ม ราคา */}
                <th className="py-3 px-6 text-left">ผู้แจ้งซ่อม (Admin)</th> {/* เปลี่ยนเป็น Admin */}
                <th className="py-3 px-6 text-left">สถานะ</th>
                <th className="py-3 px-6 text-left">วันที่แจ้ง</th>
                <th className="py-3 px-6 text-left">วันที่ซ่อมเสร็จ</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {repairs.map((item) => ( 
                <tr key={item.repair_id} className="border-b border-gray-200 hover:bg-gray-50"> 
                  <td className="py-3 px-6 text-left whitespace-nowrap">{item.repair_id}</td>
                  <td className="py-3 px-6 text-left">{item.room_num}</td> {/* ใช้ item.room_num */}
                  <td className="py-3 px-6 text-left">{item.repairlist?.repairlist_details}</td> {/* ใช้ item.repairlist?.repairlist_details */}
                  <td className="py-3 px-6 text-left">{item.repairlist?.repairlist_price}</td> {/* เพิ่ม item.repairlist?.repairlist_price */}
                  <td className="py-3 px-6 text-left">{item.admin_name}</td> {/* ใช้ item.admin_name */}
                  <td className="py-3 px-6 text-left">{getStatusDisplayText(item.repair_status)}</td> {/* ใช้ item.repair_status */}
                  <td className="py-3 px-6 text-left">{item.repair_date ? new Date(item.repair_date).toLocaleDateString() : 'N/A'}</td> {/* ใช้ item.repair_date */}
                  <td className="py-3 px-6 text-left">{item.completed_date ? new Date(item.completed_date).toLocaleDateString() : 'ยังไม่เสร็จ'}</td>
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