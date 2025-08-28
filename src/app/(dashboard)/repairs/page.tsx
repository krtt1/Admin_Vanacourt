
import Pagination from "@/components/Pagination";
import RepairsTable from "@/components/RepairsTable";
import Image from "next/image";
import { getAllRepairs, getAllRooms } from "@/lib/api"; // <-- import getAllRooms

const RepairsPage = async () => {
  const [initialRepairs, rooms] = await Promise.all([
    getAllRepairs(),
    getAllRooms()
  ]);

  if (!initialRepairs || !rooms) {
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <p className="text-red-500 text-center">
          Failed to load repair list or rooms. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Repairs</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="Filter Icon" width={14} height={14}/>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="Sort Icon" width={14} height={14}/>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/plus.png" alt="Add Icon" width={14} height={14}/>
            </button>
          </div>
        </div>
      </div>

      {/* LIST */}
      <RepairsTable initialRepairs={initialRepairs} rooms={rooms} /> {/* ส่ง rooms ด้วย */}

      {/* PAGINATION */}
      <Pagination/>
    </div>
  );
};

export default RepairsPage;
