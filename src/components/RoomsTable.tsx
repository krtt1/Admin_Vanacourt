// src/components/RoomsTable.tsx
"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect, FormEvent } from 'react';
import { Room, RoomFormData } from '@/types/room';
import { addRoomAction, updateRoomAction, deleteRoomAction } from '@/app/(dashboard)/room/roomAction';

interface RoomsTableProps {
  initialRooms: Room[];
  onRoomAdded?: (room: Room) => void;
  onRoomUpdated?: (room: Room) => void;
  onRoomDeleted?: (roomId: string) => void;
}

const RoomsTable: React.FC<RoomsTableProps> = ({
  initialRooms,
  onRoomAdded,
  onRoomUpdated,
  onRoomDeleted,
}) => {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const [formData, setFormData] = useState<RoomFormData>({
    room_num: '',
    room_status: '0',
    room_price: 0,
  });

  // ช่องค้นหาเดียว
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    setRooms(initialRooms);
  }, [initialRooms]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'room_price' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const dataToSend = { ...formData, room_status: formData.room_status };
      let result;
      if (editingRoom) result = await updateRoomAction(editingRoom.room_id, dataToSend);
      else result = await addRoomAction(dataToSend);

      if (result.success) {
        if (editingRoom) {
          setRooms(prev => prev.map(r => (r.room_id === result.room.room_id ? result.room : r)));
          onRoomUpdated && onRoomUpdated(result.room);
        } else {
          setRooms(prev => [...prev, result.room]);
          onRoomAdded && onRoomAdded(result.room);
        }
        setShowForm(false);
        setEditingRoom(null);
        resetForm();
      } else throw new Error(result.message || 'Failed to perform room operation.');
    } catch (err: any) {
      setError(err.message || 'An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      room_num: room.room_num,
      room_status: String(room.room_status),
      room_price: Number(room.room_price),
    });
    setShowForm(true);
  };

  const handleDelete = async (roomId: string) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบห้องนี้?')) return;
    setLoading(true);
    setError(null);
    try {
      const result = await deleteRoomAction(roomId);
      if (result.success) {
        setRooms(prev => prev.filter(r => r.room_id !== roomId));
        onRoomDeleted && onRoomDeleted(roomId);
      } else throw new Error(result.message || 'Failed to delete room.');
    } catch (err: any) {
      setError(err.message || 'An error occurred during deletion.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ room_num: '', room_status: '0', room_price: 0 });
    setEditingRoom(null);
  };

  const getStatusDisplayText = (statusValue: string | number): string => {
    switch (String(statusValue)) {
      case '0': return 'ว่าง';
      case '1': return 'ไม่ว่าง';
      default: return String(statusValue);
    }
  };

  // กรองห้อง: ค้นหาเลขห้อง + สถานะ
  const filteredRooms = rooms.filter(room => {
    const search = searchText.toLowerCase().trim();
    const statusText = getStatusDisplayText(room.room_status).toLowerCase();
    const roomNumText = room.room_num.toLowerCase();

    // ถ้า search ตรงกับ "ว่าง" หรือ "ไม่ว่าง"
    if (search === 'ว่าง' || search === 'ไม่ว่าง') {
      return statusText === search;
    }

    // search เลขห้อง หรือรวมเลขห้องกับสถานะ
    return roomNumText.includes(search) || statusText.includes(search);
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      <div className="flex justify-between mb-4 gap-2">
        <input
          type="text"
          placeholder="ค้นหาหมายเลขห้องหรือสถานะ เช่น 101 ว่าง"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className="border rounded py-1 px-3 w-full md:w-80"
        />
        <button
          onClick={() => { setShowForm(true); resetForm(); }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          เพิ่มห้องใหม่
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold mb-3">
            {editingRoom ? 'แก้ไขห้อง' : 'เพิ่มห้อง'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">หมายเลขห้อง:</label>
              <input
                type="text"
                name="room_num"
                value={formData.room_num}
                onChange={handleInputChange}
                className="shadow border rounded w-full py-2 px-3"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">สถานะห้อง:</label>
              <select
                name="room_status"
                value={formData.room_status}
                onChange={handleInputChange}
                className="shadow border rounded w-full py-2 px-3"
                required
              >
                <option value="0">ว่าง</option>
                <option value="1">ไม่ว่าง</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">ราคา:</label>
              <input
                type="number"
                name="room_price"
                value={formData.room_price}
                onChange={handleInputChange}
                className="shadow border rounded w-full py-2 px-3"
                required
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-2 mt-4">
              <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" disabled={loading}>
                {loading ? 'กำลังบันทึก...' : editingRoom ? 'บันทึกการแก้ไข' : 'เพิ่มห้อง'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded" disabled={loading}>
                ยกเลิก
              </button>
            </div>
          </form>
          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        </div>
      )}

      {filteredRooms.length === 0 ? (
        <p className="text-gray-600">ไม่พบข้อมูลห้อง</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm">
                <th className="py-3 px-6 text-left">หมายเลขห้อง</th>
                <th className="py-3 px-6 text-left">สถานะ</th>
                <th className="py-3 px-6 text-left">ราคา</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {filteredRooms
                .slice()
                .sort((a, b) => Number(a.room_num) - Number(b.room_num))
                .map(room => (
                  <tr key={room.room_id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-6">{room.room_num}</td>
                    <td className="py-3 px-6">{getStatusDisplayText(room.room_status)}</td>
                    <td className="py-3 px-6">{room.room_price}</td>
                    <td className="py-3 px-6 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEdit(room)} className="bg-yellow-500 hover:bg-yellow-700 text-white py-1 px-3 rounded text-xs">แก้ไข</button>
                        {String(room.room_status) !== '1' && (
                          <button onClick={() => handleDelete(room.room_id)} className="bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded text-xs">ลบ</button>
                        )}
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

export default RoomsTable;
