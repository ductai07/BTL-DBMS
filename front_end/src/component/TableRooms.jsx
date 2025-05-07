import { useState } from "react";
import { FaEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";

const TableRooms = ({
  columnNames,
  rooms,
  setOpen,
  setInfoRoom,
  changeEntry,
  handleDelete,
  currentPage,
  setCurrentPage,
  totalPages,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold mb-4">Rooms</h3>
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
          {rooms.map((room) => (
            <tr
              key={room.id}
              className="border-b text-sm text-gray-700 hover:bg-gray-50"
            >
              <td className="py-3">{room.name}</td>
              <td>{room.Cinema.name}</td>
              <td>{room.seatCount}</td>
              <td>{room.type}</td>
              <td>{room.status}</td>
              <td>
                <span className="flex gap-2">
                  <span
                    className="hover:cursor-pointer"
                    onClick={() => {
                      setOpen(true);
                      setInfoRoom(room);
                      changeEntry(["Edit room", "Edit"]);
                    }}
                  >
                    <FaEdit />
                  </span>
                  <span
                    className="hover:cursor-pointer"
                    onClick={() => handleDelete(room.id)}
                  >
                    <MdDeleteForever size={16} />
                  </span>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
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

export default TableRooms;
