
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import Image from "next/image";
import { getAllUsers } from "@/lib/api";

const UserPage = async () => {
    const users =await getAllUsers();//ดึงข้อมูลผู้่ใช่่้

    // Console log
    console.log("UserPage - Fetched Users:",users);

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            {/*TOP*/}
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">All Users</h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    
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
            <Table initialUsers={users || []}/>
            {/*PAGINATION*/}
                <Pagination/>
        </div>
    )
}

export default UserPage