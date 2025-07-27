import { role } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";

const menuItems = [
  {
    title: "MENU",
    items: [
      {
        icon: "/dashboard.png",
        label: "Dashboard",
        href: "/admin",
        visible: ["admin", "user",],
      },
      {
        icon: "/payment.png",
        label: "Payments",
        href: "/payment",
        visible: ["admin", "user"],
      },
      {
        icon: "/student.png",
        label: "User",
        href: "/user",
        visible: ["admin", "user" ],
      },
      {
        icon: "/repairs.png",
        label: "Repairs",
        href: "/repairs",
        visible: ["admin", "user"],
      },
      {
        icon: "/subject.png",
        label: "Tenants",
        href: "/tenants",
        visible: ["admin"],
      },
      {
        icon: "/room.png",
        label: "Room",
        href: "/room",
        visible: ["admin", "user"],
      },
      {
        icon: "/message.png",
        label: "Messages",
        href: "/list/messages",
        visible: ["admin", "user",],
      },
      {
        icon: "/announcement.png",
        label: "Announcements",
        href: "/list/announcements",
        visible: ["admin", "user",],
      },
    ],
  },
  {
    title: "OTHER",
    items: [
      {
        icon: "/profile.png",
        label: "Profile",
        href: "/profile",
        visible: ["admin", "user",],
      },
      {
        icon: "/setting.png",
        label: "Settings",
        href: "/settings",
        visible: ["admin", "user",],
      },
      {
        icon: "/logout.png",
        label: "Logout",
        href: "/logout",
        visible: ["admin", "user",],
      },
    ],
  },
];

const Menu = () => {
  return (
    <div className="">
      {menuItems.map(i=>(
        <div className="flex flex-col gap-2" key={i.title}>
          <span className="hidden lg:block text-gray-400 font-light my-4">
            {i.title}
            </span>
          {i.items.map(item=> {
            if(item.visible.includes(role)){
              return (
            <Link 
            href={item.href} 
            key={item.label} 
            className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 round-md hover:bg-lamaSkyLight"
            >
            <Image src={item.icon} alt="" width={20} height={20}/>
            <span className="hidden lg:block">{item.label}</span>
            </Link>
          )
            }
          })}
        </div>
      ))}
    </div>
  )
}

export default Menu