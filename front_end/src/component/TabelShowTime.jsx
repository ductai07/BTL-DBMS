import React from "react";
import { FaEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";

const TabelShowTime = ({
  showTimes,
  setOpen,
  setInfoShowTime,
  changeEntry,
  handleDelete,
}) => {
  // Function to format time (HH:MM:SS to HH:MM)
  const formatTime = (timeString) => {
    if (!timeString) return "";
    return timeString.substring(0, 5);
  };

  // Function to format date (YYYY-MM-DD to DD/MM/YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md overflow-x-auto">
      <h3 className="text-lg font-semibold mb-4">Danh sách lịch chiếu</h3>
      {!showTimes || showTimes.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          Không có lịch chiếu nào được tìm thấy
        </div>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr className="text-sm text-gray-500 border-b">
              <th className="py-2 px-2">ID</th>
              <th className="py-2 px-2">Ngày chiếu</th>
              <th className="py-2 px-2">Giờ bắt đầu</th>
              <th className="py-2 px-2">Giờ kết thúc</th>
              <th className="py-2 px-2">ID Phòng</th>
              <th className="py-2 px-2">ID Phim</th>
              <th className="py-2 px-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {showTimes.map((showTime) => (
              <tr
                key={showTime.id}
                className="border-b text-sm text-gray-700 hover:bg-gray-50"
              >
                <td className="py-3 px-2">{showTime.id}</td>
                <td className="py-3 px-2">{formatDate(showTime.showDate)}</td>
                <td className="py-3 px-2">{formatTime(showTime.startTime)}</td>
                <td className="py-3 px-2">{formatTime(showTime.endTime)}</td>
                <td className="py-3 px-2">{showTime.room_id}</td>
                <td className="py-3 px-2">{showTime.movie_id}</td>
                <td className="py-3 px-2">
                  <span className="flex gap-2">
                    <span
                      className="hover:cursor-pointer hover:text-blue-600"
                      onClick={() => {
                        setOpen(true);
                        changeEntry(["Edit showtime", "Save"]);
                        setInfoShowTime(showTime);
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
      )}
    </div>
  );
};

export default TabelShowTime;
