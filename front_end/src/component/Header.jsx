import { IoMdNotifications } from "react-icons/io";

const Header = ({ title }) => {
  return (
    <div className="flex justify-between items-center mb-5 font-medium">
      <h1>{title}</h1>
      <div className="flex gap-2 items-center">
        <IoMdNotifications />
        <span className="w-6 h-6 rounded-[999px]">
          <img src="./imgs/avatar.png" alt="" />
        </span>
      </div>
    </div>
  );
};

export default Header;
