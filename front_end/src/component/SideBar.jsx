import { LuLayoutDashboard } from "react-icons/lu";
import { MdOutlineLocalMovies } from "react-icons/md";
import { MdOutlineMeetingRoom } from "react-icons/md";
import { IoIosTimer } from "react-icons/io";
import { IoTicketOutline } from "react-icons/io5";
import { LiaHamburgerSolid } from "react-icons/lia";
import { FaShoppingCart } from "react-icons/fa";
import { FaPercentage } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";
const SideBar = () => {
  const [focus, setFocus] = useState(() => {
    return parseInt(localStorage.getItem("focus")) || 0;
  });

  const handleFocus = (idx) => {
    setFocus(idx);
    localStorage.setItem("focus", idx);
  };
  const listItems = [
    { icon: <LuLayoutDashboard />, nameItem: "Dashboard", path: "/dashboard" },
    { icon: <MdOutlineLocalMovies />, nameItem: "Movies", path: "/movies" },
    { icon: <MdOutlineMeetingRoom />, nameItem: "Rooms", path: "/rooms" },
    { icon: <IoIosTimer />, nameItem: "Showtimes", path: "/showtimes" },
    { icon: <IoTicketOutline />, nameItem: "Tickets", path: "/tickets" },
    {
      icon: <LiaHamburgerSolid />,
      nameItem: "Products & Combos",
      path: "/products",
    },
    { icon: <FaShoppingCart />, nameItem: "Orders", path: "/orders" },
    { icon: <FaPercentage />, nameItem: "Promotions", path: "/promotions" },
  ];

  return (
    <div className="w-[100%] h-[100vh] px-[16px] py-[16px] bg-neutral-900 text-white font-medium text-sm">
      <h1 className="mb-4">Cinema Admin</h1>
      <ul className="flex flex-col gap-y-2">
        {listItems.map((item, idx) => (
          <Link to={item.path} key={item.icon}>
            <li
              onClick={() => {
                handleFocus(idx);
              }}
              className={
                focus === idx
                  ? "hover flex items-center gap-2  p-2 rounded-lg cursor-pointer bg-neutral-800"
                  : "hover flex items-center gap-2  p-2 rounded-lg cursor-pointer"
              }
            >
              {item.icon}
              {item.nameItem}
            </li>
          </Link>
        ))}
      </ul>
    </div>
  );
};

export default SideBar;
