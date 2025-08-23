import Image from "next/image";
import Link from "next/link";

const menuItems = [
  {
    title: "MENU",
    items: [
      { icon: "/dashboard.png", label: "Dashboard", href: "/admin" },
      { icon: "/payment.png", label: "Payments", href: "/payment" },
      { icon: "/payment.png", label: "Stay Management", href: "/stay" },
      { icon: "/student.png", label: "User", href: "/user" },
      { icon: "/repairs.png", label: "Repairs", href: "/repairs" },
      { icon: "/income.png", label: "Income and Expenses", href: "/finance" },
      { icon: "/room.png", label: "Room", href: "/room" },
      { icon: "/announcement.png", label: "Announcements", href: "/list/announcements" },
    ],
  },
  {
    title: "OTHER",
    items: [
      { icon: "/setting.png", label: "Settings", href: "/settings" },
      { icon: "/logout.png", label: "Logout", href: "/sign-in" },
    ],
  },
];

const Menu = () => {
  return (
    <div className="">
      {menuItems.map((section) => (
        <div className="flex flex-col gap-2" key={section.title}>
          <span className="hidden lg:block text-gray-400 font-light my-4">
            {section.title}
          </span>
          {section.items.map((item) => (
            <Link
              href={item.href}
              key={item.label}
              className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 round-md hover:bg-lamaSkyLight"
            >
              <Image src={item.icon} alt="" width={20} height={20} />
              <span className="hidden lg:block">{item.label}</span>
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Menu;
