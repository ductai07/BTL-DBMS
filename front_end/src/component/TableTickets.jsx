import { BiSolidPencil } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import { formatCurrency } from "../utils/formatUtils";

const TableTickets = ({
  columnNames,
  tickets,
  setOpen,
  setTicketInfo,
  changeEntry,
  handleDelete,
}) => {
  const ticketStatusColor = {
    "Booked": "bg-blue-100 text-blue-800",
    "Paid": "bg-green-100 text-green-800",
    "Canceled": "bg-red-100 text-red-800"
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="w-full table-auto">
        <thead>
          <tr className="text-sm font-medium text-gray-700 border-b border-gray-200">
            {columnNames.map((name, index) => (
              <th
                key={index}
                className="px-4 py-4 text-center"
              >
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              className="text-sm text-gray-700 border-b border-gray-200 hover:bg-gray-50"
            >
              <td className="px-4 py-4 text-center">{ticket.movieTitle}</td>
              <td className="px-4 py-4 text-center">{ticket.roomName}</td>
              <td className="px-4 py-4 text-center">{ticket.seatNumber}</td>
              <td className="px-4 py-4 text-center">{ticket.showDate}</td>
              <td className="px-4 py-4 text-center">{ticket.showTime}</td>
              <td className="px-4 py-4 text-center">{formatCurrency(ticket.price)}</td>
              <td className="px-4 py-4 text-center">
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${ticketStatusColor[ticket.status]}`}>
                  {ticket.status}
                </span>
              </td>
              <td className="px-4 py-4 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <button
                    className="p-1 text-gray-500 hover:text-blue-500"
                    onClick={() => {
                      changeEntry(["Edit ticket", "Edit"]);
                      setTicketInfo(ticket);
                      setOpen(true);
                    }}
                  >
                    <BiSolidPencil />
                  </button>
                  <button
                    className="p-1 text-gray-500 hover:text-red-500"
                    onClick={() => {
                      handleDelete(ticket.id);
                    }}
                  >
                    <MdDelete />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableTickets;