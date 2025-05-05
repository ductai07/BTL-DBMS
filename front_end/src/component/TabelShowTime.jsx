import { useState } from "react";
import { FaEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";

const TabelShowTime = ({
  showTimes,
  setOpen,
  setInfoShowTime,
  changeEntry,
  handleDelete,
}) => {
  const columnNames = [
    "Tên phim",
    "Phòng chiếu",
    "Ngày",
    "Giờ",
    "Trạng thái",
    "Số vé đã bán",
    "Thao tác",
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(showTimes.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = showTimes.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (isoDateStr) => {
    if (!isoDateStr) return "";
    const [year, month, day] = isoDateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
      <table className="w-full text-left">
        <thead>
          <tr className="text-sm text-gray-500 border-b">
            {columnNames.map((col) => (
              <th key={col} className="py-2">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentItems.map((show) => (
            <tr
              key={show.id}
              className="border-b text-sm text-gray-700 hover:bg-gray-50"
            >
              <td className="py-3">{show.title}</td>
              <td>{show.room}</td>
              <td>{show.date}</td>
              <td>{show.time}</td>
              <td>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    show.status === "Sắp chiếu"
                      ? "bg-blue-100 text-blue-600"
                      : show.status === "Đang chiếu"
                      ? "bg-green-100 text-green-600"
                      : show.status === "Đã chiếu"
                      ? "bg-gray-200 text-gray-600"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {show.status}
                </span>
              </td>
              <td>
                {show.tickets["sold"]}/{show.tickets["total"]}
              </td>
              <td>
                <span className="flex gap-2">
                  <span
                    className="hover:cursor-pointer"
                    onClick={() => {
                      setOpen(true);
                      changeEntry(["Chỉnh sửa xuất chiếu", "Edit"]);
                      setInfoShowTime(show);
                    }}
                  >
                    <FaEdit />
                  </span>
                  <span
                    className="hover:cursor-pointer"
                    onClick={() => handleDelete(show.id)}
                  >
                    <MdDeleteForever size={16} />
                  </span>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm">
        <span>
          Trang {currentPage} / {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Trước
          </button>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
};

export default TabelShowTime;
