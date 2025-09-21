import StayTable from "@/components/StayTable";
import { getAllStays, getAllUsers, getAllRooms } from "@/lib/api";
import { Stay, User as StayUser, Room as StayRoom } from "@/types/stay";

const StayPage = async () => {
  const [staysRes, usersRes, roomsRes] = await Promise.all([
    getAllStays(),
    getAllUsers(),
    getAllRooms()
  ]);

  // map users และ rooms
  const users: StayUser[] = (usersRes || []).map(u => ({
    user_id: u.user_id,
    user_name: u.user_name
  }));

  const rooms: StayRoom[] = (roomsRes || []).map(r => ({
    room_id: r.room_id,
    room_num: r.room_num
  }));

  // map stays พร้อม user_id / room_id
  const stays: Stay[] = (staysRes || []).map(s => ({
    stay_id: s.stay_id,
    stay_date: s.stay_date,
    stay_status: s.stay_status,
    stay_dateout: s.stay_dateout,
    user_name: s.user_name,
    room_num: s.room_num,
    user_id: users.find(u => u.user_name === s.user_name)?.user_id || "",
    room_id: rooms.find(r => r.room_num === s.room_num)?.room_id || "",
  }));

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <h1 className="hidden md:block text-lg font-semibold">All Stays</h1>
      <StayTable initialStays={stays} users={users} rooms={rooms} />
    </div>
  );
};

export default StayPage;
