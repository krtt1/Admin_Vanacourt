// src/app/rooms/page.tsx (หรือ path ที่คุณใช้สำหรับ RoomPage)

import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/Pagination";
import RoomsTable from "@/components/RoomsTable";
import Image from "next/image";
import { getAllRooms } from "@/lib/api";


const RoomPage = async () => {

    const initialRooms = await getAllRooms();
    if (initialRooms === null) {
        return (
            <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
                <p className="text-red-500 text-center">Failed to load rooms. Please try again later.</p>
            </div>
        );
    }



    return (
         <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            {/*TOP*/}
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">All Rooms</h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <TableSearch/>
                    <div className="flex items-center gap-4 self-end">
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                            <Image src="/filter.png" alt="" width={14} height={14}/>
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                            <Image src="/sort.png" alt="" width={14} height={14}/>
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                            <Image src="/plus.png" alt="" width={14} height={14}/>
                        </button>
                    </div>
                </div>
            </div>
            {/*LIST*/}
            <RoomsTable initialRooms={initialRooms}/>
            {/*PAGINATION*/}
                <Pagination/>
        </div>
    )
}

export default RoomPage