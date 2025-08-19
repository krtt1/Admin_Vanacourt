// src/components/RoomsTable.tsx
"use client";
import { useRouter } from 'next/navigation';
import { useState, useEffect, FormEvent } from 'react';
import { Room, RoomFormData } from '@/types/room';
import { addRoomAction, updateRoomAction, deleteRoomAction } from '@/app/(dashboard)/room/roomAction';

interface RoomsTableProps {
  initialRooms: Room[];
}

const RoomsTable: React.FC<RoomsTableProps> = ({ initialRooms }) => {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const [formData, setFormData] = useState<RoomFormData>({
    room_num: '',
    room_status: 'available',
    room_price: 0,
  });

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

  const getBackendStatusValue = (
    formStatus: 'available' | 'occupied' | 'cleaning' | 'maintenance' | string
  ): string => {
    switch (formStatus) {
      case 'available':
        return '0';
      case 'occupied':
        return '1';
      case 'cleaning':
        return '2';
      case 'maintenance':
        return '3';
      default:
        return String(formStatus);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const dataToSend = {
        ...formData,
        room_status: getBackendStatusValue(formData.room_status),
      };

      let result;
      if (editingRoom) {
        result = await updateRoomAction(editingRoom.room_id, dataToSend);
      } else {
        result = await addRoomAction(dataToSend);
      }

      if (result.success) {
        console.log(
          editingRoom ? 'Room updated successfully!' : 'Room created successfully!',
          result.room
        );
        setShowForm(false);
        setEditingRoom(null);
        resetForm();
      } else {
        throw new Error(result.message || 'Failed to perform room operation.');
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  const getRoomStatusValueForForm = (
    statusValue: string | number
  ): 'available' | 'occupied' | 'cleaning' | 'maintenance' | string => {
    switch (String(statusValue)) {
      case 'available':
      case '0':
        return 'available';
      case 'occupied':
      case '1':
        return 'occupied';
      case 'cleaning':
      case '2':
        return 'cleaning';
      case 'maintenance':
      case '3':
        return 'maintenance';
      default:
        return String(statusValue);
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      room_num: room.room_num,
      room_status: getRoomStatusValueForForm(room.room_status),
      room_price: Number(room.room_price),
    });
    setShowForm(true);
  };

  const handleDelete = async (roomId: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบห้องนี้?')) {
      setLoading(true);
      setError(null);
      try {
        const result = await deleteRoomAction(roomId);

        if (result.success) {
          console.log('Room deleted:', roomId);
        } else {
          throw new Error(result.message || 'Failed to delete room.');
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
      room_num: '',
      room_status: 'available',
      room_price: 0,
    });
    setEditingRoom(null);
  };

  const getStatusDisplayText = (statusValue: string | number): string => {
    switch (String(statusValue)) {
      case 'available':
      case '0':
        return 'ว่าง';
      case 'occupied':
      case '1':
        return 'ไม่ว่าง';
      case 'cleaning':
      case '2':
        return 'กำลังทำความสะอาด';
      case 'maintenance':
      case '3':
        return 'กำลังซ่อมบำรุง';
      default:
        return String(statusValue);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      <button
        onClick={() => {
          setShowForm(true);
          resetForm();
        }}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        เพิ่มห้องใหม่
      </button>

      {showForm && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold mb-3">
            {editingRoom ? 'แก้ไขห้อง' : 'เพิ่มห้อง'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="room_num">
                หมายเลขห้อง:
              </label>
              <input
                type="text"
                id="room_num"
                name="room_num"
                value={formData.room_num}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="room_status">
                สถานะห้อง:
              </label>
              <select
                id="room_status"
                name="room_status"
                value={formData.room_status}
                onChange={handleInputChange}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="available">ว่าง</option>
                <option value="occupied">ไม่ว่าง</option>
                <option value="cleaning">กำลังทำความสะอาด</option>
                <option value="maintenance">กำลังซ่อมบำรุง</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="room_price">
                ราคา:
              </label>
              <input
                type="number"
                id="room_price"
                name="room_price"
                value={formData.room_price}
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
                {loading ? 'กำลังบันทึก...' : editingRoom ? 'บันทึกการแก้ไข' : 'เพิ่มห้อง'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
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

      {rooms.length === 0 && !loading && !error ? (
        <p className="text-gray-600">ไม่พบข้อมูลห้อง</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">หมายเลขห้อง</th>
                <th className="py-3 px-6 text-left">สถานะ</th>
                <th className="py-3 px-6 text-left">ราคา</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {rooms
                .slice()
                .sort((a, b) => Number(a.room_num) - Number(b.room_num)) // ✅ sort ASC
                .map((room) => (
                  <tr key={room.room_id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-6 text-left">{room.room_num}</td>
                    <td className="py-3 px-6 text-left">
                      {getStatusDisplayText(room.room_status)}
                    </td>
                    <td className="py-3 px-6 text-left">{room.room_price}</td>
                    <td className="py-3 px-6 text-center">
                      <div className="flex item-center justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(room)}
                          className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded text-xs"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDelete(room.room_id)}
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

export default RoomsTable;
