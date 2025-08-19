// src/app/(dashboard)/room/page.tsx
"use client"; // ต้องมีบรรทัดนี้

import { useState, useEffect } from "react";
import RoomsTable from "@/components/RoomsTable";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/Pagination";
import Image from "next/image";
import { getAllRooms } from "@/lib/api";
import { Room } from "@/types/room";

const RoomPage = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await getAllRooms();
        if (data) {
          setRooms(data);
        } else {
          setError("ไม่สามารถโหลดข้อมูลห้องได้");
        }
      } catch (err: any) {
        setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // Callback สำหรับ RoomsTable
  const handleRoomAdded = (room: Room) => setRooms((prev) => [...prev, room]);
  const handleRoomUpdated = (room: Room) =>
    setRooms((prev) => prev.map((r) => (r.room_id === room.room_id ? room : r)));
  const handleRoomDeleted = (roomId: string) =>
    setRooms((prev) => prev.filter((r) => r.room_id !== roomId));

  // Sort rooms ตาม room_id numeric
  const sortedRooms = [...rooms].sort((a, b) => Number(a.room_id) - Number(b.room_id));

  if (loading) {
    return <p className="text-center mt-4">กำลังโหลดข้อมูลห้อง...</p>;
  }

  if (error) {
    return <p className="text-red-500 text-center mt-4">{error}</p>;
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="hidden md:block text-lg font-semibold">All Rooms</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/plus.png" alt="Add" width={14} height={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Rooms Table */}
      <RoomsTable
        initialRooms={sortedRooms}
        onRoomAdded={handleRoomAdded}
        onRoomUpdated={handleRoomUpdated}
        onRoomDeleted={handleRoomDeleted}
      />

      {/* Pagination */}
      <Pagination />
    </div>
  );
};

export default RoomPage;
