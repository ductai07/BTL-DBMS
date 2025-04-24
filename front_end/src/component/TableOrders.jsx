import { BiSolidPencil } from "react-icons/bi";
import { MdDelete, MdRemoveRedEye } from "react-icons/md";
import { formatCurrency } from "../utils/formatUtils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const TableOrders = ({
  columnNames,
  orders,
  onStatusChange,
  onViewDetails,
  handleDelete,
  setOpen,
  setOrderInfo,
  changeEntry,
}) => {
  const orderStatusColor = {
    "Completed": "bg-green-100 text-green-800",
    "Processing": "bg-blue-100 text-blue-800",
    "Cancelled": "bg-red-100 text-red-800"
  };

  // Format datetime string to a readable format
  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return format(date, "HH:mm - dd/MM/yyyy", { locale: vi });
  };

  // Handle status change
  const handleStatusChange = (orderId, newStatus) => {
    onStatusChange(orderId, newStatus);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
      <table className="w-full table-auto">
        <thead>
          <tr className="text-sm font-medium text-gray-700 border-b border-gray-200 bg-gray-50">
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
          {orders.map((order) => (
            <tr
              key={order.id}
              className="text-sm text-gray-700 border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-4 text-center font-medium">
                {order.orderNumber}
              </td>
              <td className="px-4 py-4 text-left">
                {order.customerName}
              </td>
              <td className="px-4 py-4 text-center">
                {formatDateTime(order.orderDate)}
              </td>
              <td className="px-4 py-4 text-center font-medium text-green-700">
                {formatCurrency(order.totalAmount)}
              </td>
              <td className="px-4 py-4 text-center">
                <div className="inline-block relative">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className={`${orderStatusColor[order.status]} cursor-pointer appearance-none border-none rounded-full px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300 min-w-[100px] text-center`}
                  >
                    <option value="Processing">Processing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-center">
                {order.paymentMethod}
              </td>
              <td className="px-4 py-4 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <button
                    title="View Details"
                    className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                    onClick={() => onViewDetails(order)}
                  >
                    <MdRemoveRedEye />
                  </button>
                  <button
                    title="Edit Order"
                    className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                    onClick={() => {
                      changeEntry(["Edit order", "Edit"]);
                      setOrderInfo(order);
                      setOpen(true);
                    }}
                  >
                    <BiSolidPencil />
                  </button>
                  <button
                    title="Delete Order"
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    onClick={() => {
                      handleDelete(order.id);
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

export default TableOrders;