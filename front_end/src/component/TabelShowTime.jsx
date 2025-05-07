import React from "react";
import { FaEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { formatCurrency } from "../utils/formatUtils";

const TabelShowTime = ({
  showTimes,
  setOpen,
  setInfoShowTime,
  changeEntry,
  handleDelete,
}) => {
  // Function to format date for display (YYYY-MM-DD to DD/MM/YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  };

  // Get status class for coloring
  const getStatusClass = (status) => {
    switch (status) {
      case "Sắp chiếu":
      case "Coming Soon":
        return "bg-yellow-100 text-yellow-800";
      case "Đang chiếu":
      case "Now Showing":
        return "bg-green-100 text-green-800";
      case "Đã chiếu":
      case "Ended":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md overflow-x-auto">
      <h3 className="text-lg font-semibold mb-4">Danh sách lịch chiếu</h3>
      <table className="w-full text-left">
        <thead>
          <tr className="text-sm text-gray-500 border-b">
            <th className="py-2 px-2">Phim</th>
            <th className="py-2 px-2">Rạp</th>
            <th className="py-2 px-2">Phòng</th>
            <th className="py-2 px-2">Ngày chiếu</th>
            <th className="py-2 px-2">Giờ chiếu</th>
            <th className="py-2 px-2">Trạng thái</th>
            <th className="py-2 px-2">Vé đã bán</th>
            <th className="py-2 px-2">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {showTimes.map((showTime) => (
            <tr
              key={showTime.id}
              className="border-b text-sm text-gray-700 hover:bg-gray-50"
            >
              <td className="py-3 px-2">{showTime.title}</td>
              <td className="py-3 px-2">{showTime.cinema}</td>
              <td className="py-3 px-2">{showTime.room}</td>
              <td className="py-3 px-2">{formatDate(showTime.date)}</td>
              <td className="py-3 px-2">{showTime.time}</td>
              <td className="py-3 px-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(
                    showTime.status
                  )}`}
                >
                  {showTime.status}
                </span>
              </td>
              <td className="py-3 px-2">
                {showTime.tickets ? `${showTime.tickets.sold}/${showTime.tickets.total}` : "0/0"}
              </td>
              <td className="py-3 px-2">
                <span className="flex gap-2">
                  <span
                    className="hover:cursor-pointer hover:text-blue-600"
                    onClick={() => {
                      setOpen(true);
                      changeEntry(["Edit showtime", "Save"]);
                      setInfoShowTime(showTime.originalData || showTime);
                    }}
                  >
                    <FaEdit />
                  </span>
                  <span
                    className="hover:cursor-pointer hover:text-red-600"
                    onClick={() => handleDelete(showTime.id)}
                  >
                    <MdDeleteForever size={16} />
                  </span>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TabelShowTime;
