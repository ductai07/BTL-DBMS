import { IoClose } from "react-icons/io5";
import { formatCurrency } from "../utils/formatUtils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const OrderDetailsModal = ({
  isOpen,
  onClose,
  order
}) => {
  if (!isOpen || !order) return null;

  // Format datetime string to a readable format
  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return format(date, "HH:mm - dd/MM/yyyy", { locale: vi });
  };

  // Status color mapping
  const orderStatusColor = {
    "Completed": "bg-green-100 text-green-800 border-green-200",
    "Processing": "bg-blue-100 text-blue-800 border-blue-200",
    "Cancelled": "bg-red-100 text-red-800 border-red-200"
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white rounded-lg w-[700px] max-w-[95%] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b sticky top-0 bg-white px-5 py-3 z-10">
          <h3 className="font-semibold text-lg">Order Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <IoClose size={24} />
          </button>
        </div>
        
        <div className="p-5">
          {/* Order Header */}
          <div className="flex flex-col md:flex-row justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{order.orderNumber}</h2>
              <p className="text-sm text-gray-600 mt-1">{formatDateTime(order.orderDate)}</p>
            </div>
            <div className="mt-2 md:mt-0">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${orderStatusColor[order.status]}`}>
                {order.status}
              </span>
            </div>
          </div>
          
          {/* Customer Info */}
          <div className="bg-gray-50 rounded-md p-4 mb-6">
            <h4 className="font-medium text-gray-700 mb-2">Customer Information</h4>
            <p className="text-gray-800">{order.customerName}</p>
            <div className="flex items-center mt-2">
              <span className="text-sm text-gray-600">Payment Method:</span>
              <span className="ml-2 text-sm font-medium">{order.paymentMethod}</span>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-700 mb-3">Order Items</h4>
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-xs text-gray-700 border-b">
                    <th className="px-4 py-2 text-left">Item</th>
                    <th className="px-4 py-2 text-center">Price</th>
                    <th className="px-4 py-2 text-center">Qty</th>
                    <th className="px-4 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={index} className="border-b last:border-b-0">
                      <td className="px-4 py-3 text-left">{item.name}</td>
                      <td className="px-4 py-3 text-center">{formatCurrency(item.price)}</td>
                      <td className="px-4 py-3 text-center">{item.quantity}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="3" className="px-4 py-3 text-right font-medium">Total:</td>
                    <td className="px-4 py-3 text-right font-bold text-green-700">
                      {formatCurrency(order.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;