// src/app/(dashboard)/stay/page.tsx

import Pagination from "@/components/Pagination";
import StayTable from "@/components/StayTable";
import Image from "next/image";
import { getAllStays, getAllUsers, getAllRooms } from "@/lib/api";
import { Stay, User as StayUser, Room as StayRoom } from "@/types/stay";

const StayPage = async () => {
  // Fetch data
  const [staysRes, usersRes, roomsRes] = await Promise.all([
    getAllStays(),
    getAllUsers(),
    getAllRooms()
  ]);

  // แปลง data ให้ตรงกับ interface ของ StayTable
  const users: StayUser[] = (usersRes || []).map(u => ({
    id: u.user_id,
    user_name: u.user_name
  }));

  const rooms: StayRoom[] = (roomsRes || []).map(r => ({
    id: r.room_id,
    room_num: r.room_num
  }));

  const stays: Stay[] = (staysRes || []).map(s => ({
    stay_id: s.stay_id,
    stay_date: s.stay_date,
    stay_status: s.stay_status,
    stay_dateout: s.stay_dateout,
    user_name: s.user_name,
    room_num: s.room_num,
    user_id: s.user_id,
    room_id: s.room_id
  }));

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Stays</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/plus.png" alt="" width={14} height={14} />
            </button>
          </div>
        </div>
      </div>

      {/* LIST */}
      <StayTable 
        initialStays={stays} 
        users={users} 
        rooms={rooms} 
      />

      {/* PAGINATION */}
      
    </div>
  );
};

export default StayPage;
