import Image from "next/image"

const Navbar = () => {
    return (
        <div className="flex items-cemter justify-between p-4">
            
            {/* ICONS AND USER*/}
            <div className="flex items-center gap-6 justify-end w-full">
                
                <div className="flex flex-col">
                    <span className="text-xs leading-3 font-medium">SuperAdmin</span>
                    <span className="text-[10px] text-gray-500 text-right">Admin</span>
                </div>
                <div className="">
                    <Image src="/avatar.png" alt="" width={36} height={36} className="rounded-full"/>
                </div>
            </div>
        </div>
    )
}

export default Navbar