// src/app/(dashboard)/room/RoomPage.tsx
"use client";

import { useState, useEffect } from "react";
import RoomsTable from "@/components/RoomsTable";
import { getAllRooms } from "@/lib/api";
import { Room } from "@/types/room";

const RoomPage = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await getAllRooms();
        if (data) setRooms(data);
        else setError("ไม่สามารถโหลดข้อมูลห้องได้");
      } catch (err: any) {
        setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  if (loading) return <p className="text-center mt-4">กำลังโหลดข้อมูลห้อง...</p>;
  if (error) return <p className="text-red-500 text-center mt-4">{error}</p>;

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* Rooms Table ส่ง rooms ทั้งหมด */}
      <RoomsTable
        initialRooms={rooms}
        onRoomAdded={(room: Room) => setRooms(prev => [...prev, room])}
        onRoomUpdated={(room: Room) =>
          setRooms(prev => prev.map(r => (r.room_id === room.room_id ? room : r)))
        }
        onRoomDeleted={(roomId: string) =>
          setRooms(prev => prev.filter(r => r.room_id !== roomId))
        }
      />
    </div>
  );
};

export default RoomPage;
