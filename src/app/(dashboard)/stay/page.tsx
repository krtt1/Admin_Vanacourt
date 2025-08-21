import StayTable from '@/components/StayTable';
import { getAllStays, getAllUsers, getAllRooms } from '@/lib/api';
import { addStayAction, updateStayAction, deleteStayAction } from './stayAction';

export default async function StaysPage() {
  const stays = await getAllStays();
  const users = await getAllUsers();
  const rooms = await getAllRooms();

  return (
    <div className="p-4 bg-white rounded-md">
      <StayTable
        initialStays={stays}
        users={users}
        rooms={rooms}
        addStayAction={addStayAction}
        updateStayAction={updateStayAction}
        deleteStayAction={deleteStayAction}
      />
    </div>
  );
}
