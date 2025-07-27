// src/app/(dashboard)/admin/page.tsx
import UserCard from "@/components/UserCard";
import RoomCard from "@/components/RoomCard";
import RepairCard from "@/components/RepairCard";
import AttendanceChart from "@/components/AttendanceChart";
import EventCalendar from "@/components/EventCalendar";
import Announcements from "@/components/Announcements";
import { getAllUsers, getAllRooms, getAllRepairs } from "@/lib/api"; // <--- แก้ไขตรงนี้: เปลี่ยน getAllRepairLists เป็น getAllRepairs

const AdminPage = async () => {
  // --- 1. ดึงและประมวลผลข้อมูลผู้เช่า (Users) ---
  const users = await getAllUsers();
  const totalTenants = users ? users.length : 0;
  console.log("Dashboard Data - Users:", { fetched: users, total: totalTenants });

  // --- 2. ดึงและประมวลผลข้อมูลห้องพัก (Rooms) ---
  let availableRooms = 0;
  let occupiedRooms = 0;
  const rooms = await getAllRooms();
  if (rooms) {
    // สมมติว่า "0" คือว่าง, ค่าอื่นๆ คือไม่ว่าง
    availableRooms = rooms.filter(room => room.room_status === "0").length;
    occupiedRooms = rooms.filter(room => room.room_status !== "0").length;
    console.log("Dashboard Data - Rooms:", { fetched: rooms, available: availableRooms, occupied: occupiedRooms });
  } else {
    console.error("Dashboard Data - Rooms: Failed to fetch or rooms data is null.");
  }

  // --- 3. ดึงและประมวลผลข้อมูลรายการซ่อม (Repair Lists) ---
  const repairLists = await getAllRepairs(); // <--- แก้ไขตรงนี้: เปลี่ยน getAllRepairLists() เป็น getAllRepairs()
  const totalRepairRequests = repairLists ? repairLists.length : 0;
  console.log("Dashboard Data - Repair Requests:", { fetched: repairLists, total: totalRepairRequests });

  // --- Render UI ---
  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* LEFT Section: Contains Cards and Chart */}
      <div className="w-full lg:w-2/3">
        {/* Metric Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
          <UserCard type="ผู้เช่าทั้งหมด" count={totalTenants}/>
          <RoomCard type="ห้องว่าง" count={availableRooms}/>
          <RoomCard type="ห้องไม่ว่าง" count={occupiedRooms}/>
          <RepairCard type="รายการซ่อม" count={totalRepairRequests}/>
        </div>

        {/* Middle Chart Section */}
        <div className="w-full h-[450px]">
          <AttendanceChart/>
        </div>
      </div>

      {/* RIGHT Section: Contains Calendar and Announcements */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <EventCalendar/>
        <Announcements/>
      </div>
    </div>
  )
}

export default AdminPage;