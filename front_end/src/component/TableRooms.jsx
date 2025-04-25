import { FaEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";

const TableRooms = ({
  columnNames,
  rooms,
  setOpen,
  setInfoRoom,
  changeEntry,
  handleDelelte,
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
              <td className="py-3">{room.roomName}</td>
              <td>{room.cinema}</td>
              <td>{room.capacity}</td>
              <td>{room.type}</td>
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
                    onClick={() => handleDelelte(room.id)}
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

export default TableRooms;
