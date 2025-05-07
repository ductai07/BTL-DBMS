import { BsPencil } from "react-icons/bs";
import { MdOutlineDelete } from "react-icons/md";

const TableTickets = ({ 
  columnNames, 
  tickets = [], // Provide a default empty array
  setOpen, 
  setInfoTicket, 
  changeEntry, 
  handleDelete,
  formatCurrency
}) => {
  // Status styling
  const getStatusStyle = (status) => {
    switch(status) {
      case "Đã bán":
        return "bg-green-100 text-green-800";
      case "Còn trống":
        return "bg-blue-100 text-blue-800";
      case "Đã đặt trước":
        return "bg-yellow-100 text-yellow-800";
      case "Đã hủy":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-md">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b">
          <tr>
            {Array.isArray(columnNames) && columnNames.map((name, index) => (
              <th key={index} className="px-6 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider">
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {!Array.isArray(tickets) || tickets.length === 0 ? (
            <tr>
              <td colSpan={columnNames?.length || 1} className="px-6 py-4 text-center text-gray-500">
                Không có dữ liệu vé
              </td>
            </tr>
          ) : (
            tickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {ticket.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ticket.movie}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ticket.cinema}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ticket.room}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ticket.seat}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ticket.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ticket.time}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(ticket.price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-3">
                  <button
                    className="text-blue-600 hover:text-blue-900"
                    onClick={() => {
                      setInfoTicket(ticket.originalData);
                      changeEntry(["Chỉnh sửa vé", "Lưu"]);
                      setOpen(true);
                    }}
                  >
                    <BsPencil size={18} />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900"
                    onClick={() => handleDelete(ticket.id)}
                  >
                    <MdOutlineDelete size={20} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TableTickets;
