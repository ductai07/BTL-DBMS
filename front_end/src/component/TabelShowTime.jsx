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
  // Function to format time (HH:MM:SS to HH:MM AM/PM)
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";

    // If the timeString already includes a date part (like "1970-"), extract just the time portion
    if (timeString.includes("1970-") || timeString.includes("T")) {
      // Extract just the time portion from a full datetime string
      const timePart =
        timeString.split("T")[1]?.split(".")[0] || timeString.split(" ")[1];
      if (timePart) {
        timeString = timePart;
      }
    }

    try {
      // For handling just time strings like "HH:MM:SS"
      const [hours, minutes] = timeString.split(":");
      const h = parseInt(hours, 10);
      const m = parseInt(minutes, 10);

      if (isNaN(h) || isNaN(m)) return "Invalid Time";

      const period = h >= 12 ? "PM" : "AM";
      const hour12 = h % 12 || 12;
      return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
    } catch (error) {
      console.error("Error formatting time:", error, timeString);
      return "Invalid Time";
    }
  };

  // Function to format date (YYYY-MM-DD to DD/MM/YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const dateObj = new Date(dateString);
      if (isNaN(dateObj.getTime())) return "Invalid Date";

      const day = dateObj.getDate().toString().padStart(2, "0");
      const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
      const year = dateObj.getFullYear();

      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return "Invalid Date";
    }
  };

  // Function to format price (if available)
  const formatPrice = (price) => {
    if (!price && price !== 0) return "N/A";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Function to get status badge color
  const getStatusBadge = (status) => {
    if (!status) return "bg-gray-200 text-gray-700";

    switch (status) {
      case "Đang chiếu":
        return "bg-green-100 text-green-800";
      case "Sắp chiếu":
        return "bg-blue-100 text-blue-800";
      case "Đã chiếu":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  // Safely access movie title considering different data structures
  const getMovieTitle = (showTime) => {
    // First try the display-ready title field
    if (showTime.title) return showTime.title;

    // Then try the nested Movie object if it exists
    if (showTime.Movie && showTime.Movie.title) return showTime.Movie.title;

    // Finally fall back to movie_id
    return `ID: ${showTime.movie_id || "Unknown"}`;
  };

  // Safely access cinema and room information
  const getCinemaRoom = (showTime) => {
    // First try display-ready fields
    if (showTime.cinema && showTime.room) {
      return `${showTime.cinema} - ${showTime.room}`;
    }

    // Then try nested objects
    if (showTime.Room) {
      const cinemaName = showTime.Room.Cinema
        ? showTime.Room.Cinema.name
        : "Unknown Cinema";
      return `${cinemaName} - ${
        showTime.Room.name || `Room #${showTime.room_id}`
      }`;
    }

    // Fall back to room_id
    return `Phòng: ${showTime.room_id || "Unknown"}`;
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
              <th className="py-2 px-2">Phim</th>
              <th className="py-2 px-2">Rạp - Phòng</th>
              <th className="py-2 px-2">Ngày chiếu</th>
              <th className="py-2 px-2">Giờ bắt đầu</th>
              <th className="py-2 px-2">Kết thúc</th>
              {/* <th className="py-2 px-2">Trạng thái</th> */}
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
                <td className="py-3 px-2">{getMovieTitle(showTime)}</td>
                <td className="py-3 px-2">{getCinemaRoom(showTime)}</td>
                <td className="py-3 px-2">{formatDate(showTime.showDate)}</td>
                <td className="py-3 px-2">
                  {showTime.time || formatTime(showTime.startTime)}
                </td>
                <td className="py-3 px-2">{formatTime(showTime.endTime)}</td>
                {/* <td className="py-3 px-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                      showTime.status
                    )}`}
                  >
                    {showTime.status || "N/A"}
                  </span>
                </td> */}
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
