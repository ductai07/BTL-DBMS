import { BsPencil } from "react-icons/bs";
import { MdOutlineDelete } from "react-icons/md";
import { FaEye, FaBan, FaReceipt, FaUnlink } from "react-icons/fa";

const TableTickets = ({ 
  tickets = [], // Provide a default empty array
  setOpen, 
  setInfoTicket, 
  changeEntry, 
  handleDelete,
  formatCurrency,
  onViewDetails,
  onCancelTicket,
  onAssignToInvoice,
  onRemoveFromInvoice
}) => {
  // Function to format date (YYYY-MM-DD to DD/MM/YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  // Function to get status badge color class
  const getStatusColor = (status) => {
    switch (status) {
      case 'used':
        return 'bg-green-100 text-green-800';
      case 'unused':
        return 'bg-blue-100 text-blue-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to get formatted status text
  const getStatusText = (status) => {
    switch (status) {
      case 'used':
        return 'Đã sử dụng';
      case 'unused':
        return 'Chưa sử dụng';
      case 'canceled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-md">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider">Phim</th>
            <th className="px-6 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider">Phòng/Ghế</th>
            <th className="px-6 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider">Ngày chiếu</th>
            <th className="px-6 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider">Giờ chiếu</th>
            <th className="px-6 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider">Giá vé</th>
            {/* <th className="px-6 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th> */}
            <th className="px-6 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {!Array.isArray(tickets) || tickets.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
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
                  {ticket.movieTitle || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ticket.roomName} / {ticket.seatPosition}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(ticket.showDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ticket.showTime || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(ticket.price)}
                </td>
                {/* <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                    {getStatusText(ticket.status)}
                  </span>
                </td> */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                  {/* View details button */}
                  <button
                    className="text-blue-600 hover:text-blue-900"
                    title="Xem chi tiết"
                    onClick={() => onViewDetails && onViewDetails(ticket.id)}
                  >
                    <FaEye size={16} />
                  </button>

                  {/* Cancel ticket button - only show for unused tickets */}
                  {ticket.status === 'unused' && (
                    <button
                      className="text-red-600 hover:text-red-900"
                      title="Hủy vé"
                      onClick={() => onCancelTicket && onCancelTicket(ticket.id)}
                    >
                      <FaBan size={16} />
                    </button>
                  )}

                  {/* Assign to invoice button - only show for tickets not in an invoice */}
                  {!ticket.invoice_id && ticket.status !== 'canceled' && (
                    <button
                      className="text-green-600 hover:text-green-900"
                      title="Thêm vào hóa đơn"
                      onClick={() => {
                        const invoiceId = prompt("Nhập ID hóa đơn:");
                        if (invoiceId && onAssignToInvoice) {
                          onAssignToInvoice(ticket.id, invoiceId);
                        }
                      }}
                    >
                      <FaReceipt size={16} />
                    </button>
                  )}

                  {/* Remove from invoice button - only show if ticket is in an invoice */}
                  {ticket.invoice_id && (
                    <button
                      className="text-orange-600 hover:text-orange-900"
                      title="Xóa khỏi hóa đơn"
                      onClick={() => onRemoveFromInvoice && onRemoveFromInvoice(ticket.invoice_id, ticket.id)}
                    >
                      <FaUnlink size={16} />
                    </button>
                  )}

                  {/* Delete button - only show for tickets that can be deleted */}
                  {ticket.status !== 'used' && (
                    <button
                      className="text-red-600 hover:text-red-900"
                      title="Xóa vé"
                      onClick={() => handleDelete(ticket.id)}
                    >
                      <MdOutlineDelete size={18} />
                    </button>
                  )}
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
