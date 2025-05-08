import React from "react";
import { IoMdNotifications } from "react-icons/io";

export const Header = ({ title, description }) => {
  return (
    <div className="flex justify-between items-center mb-5 font-medium">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        {description && (
          <p className="mt-2 text-gray-600">{description}</p>
        )}
      </div>
      <div className="flex gap-2 items-center">
        <IoMdNotifications />
      </div>
    </div>
  );
};

export default Header;
