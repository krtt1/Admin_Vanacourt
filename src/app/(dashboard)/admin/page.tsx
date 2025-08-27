"use client";

import UserCard from "@/components/UserCard";
import RoomCard from "@/components/RoomCard";
import RepairCard from "@/components/RepairCard";
import EventCalendar from "@/components/EventCalendar";
import Announcements from "@/components/Announcements";
import { getAllUsers, getAllRooms, getAllRepairs } from "@/lib/api";
import { useEffect, useState } from "react";

const AdminPage = () => {
  const adminId = "5779bb7e-5b77-4f0f-905b-4bde758059bf"; // <-- ใส่ adminId แบบ hardcode

  const [totalTenants, setTotalTenants] = useState(0);
  const [availableRooms, setAvailableRooms] = useState(0);
  const [occupiedRooms, setOccupiedRooms] = useState(0);
  const [totalRepairRequests, setTotalRepairRequests] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Users
        const users = await getAllUsers();
        setTotalTenants(users?.length || 0);

        // Rooms
        const rooms = await getAllRooms();
        setAvailableRooms(rooms?.filter(r => r.room_status === "0").length || 0);
        setOccupiedRooms(rooms?.filter(r => r.room_status !== "0").length || 0);

        // Repairs
        const repairs = await getAllRepairs();
        setTotalRepairRequests(repairs?.length || 0);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* LEFT Section: Cards */}
      <div className="w-full lg:w-2/3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
          <UserCard type="ผู้เช่าทั้งหมด" count={totalTenants}/>
          <RoomCard type="ห้องว่าง" count={availableRooms}/>
          <RoomCard type="ห้องไม่ว่าง" count={occupiedRooms}/>
          <RepairCard type="รายการซ่อม" count={totalRepairRequests}/>
        </div>
      </div>

      {/* RIGHT Section: Calendar + Announcements */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <EventCalendar />
        <Announcements adminId={adminId} />
      </div>
    </div>
  );
};

export default AdminPage;
