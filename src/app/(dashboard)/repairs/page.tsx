// src/app/repairs/page.tsx (หรือ path ที่คุณใช้สำหรับหน้า Repairs)
// เนื่องจากไฟล์นี้ไม่ได้มี "use client"; จึงเป็น Server Component โดยปริยาย
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/Pagination";
import RepairsTable from "@/components/RepairsTable"; // นำเข้า RepairsTable
import Image from "next/image";
import { getAllRepairs } from "@/lib/api"; // <--- เปลี่ยนจาก getAllRepairLists เป็น getAllRepairs

const RepairsPage = async () => { // ทำให้เป็น async function เพื่อรอข้อมูล
    const initialRepairs = await getAllRepairs(); // <--- เปลี่ยนจาก initialRepairList เป็น initialRepairs และเรียก getAllRepairs()

    // จัดการกรณีที่ดึงข้อมูลไม่สำเร็จ (เช่น initialRepairs เป็น null)
    if (initialRepairs === null) {
        return (
            <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
                <p className="text-red-500 text-center">Failed to load repair list. Please try again later.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            {/*TOP*/}
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">All Repairs</h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <TableSearch/>
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
            {/*LIST*/}
            {/* ส่ง initialRepairs เป็น prop ไปยัง RepairsTable */}
            <RepairsTable initialRepairs={initialRepairs}/> {/* <--- เปลี่ยนชื่อ prop เป็น initialRepairs */}
            {/*PAGINATION*/}
            <Pagination/>
        </div>
    );
};

export default RepairsPage;