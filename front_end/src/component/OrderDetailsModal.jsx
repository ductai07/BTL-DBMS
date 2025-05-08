import { IoClose } from "react-icons/io5";
import { formatCurrency } from "../utils/formatUtils";

const OrderDetailsModal = ({
  isOpen,
  onClose,
  orderDetails,
  loading
}) => {
  if (!isOpen) return null;

  // Format datetime string to a readable format
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return dateTimeString;
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes} - ${day}/${month}/${year}`;
  };

  // Status color mapping
  const orderStatusColor = {
    "Đã thanh toán": "bg-green-100 text-green-800 border-green-200",
    "Chưa thanh toán": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "Đã hủy": "bg-red-100 text-red-800 border-red-200"
  };

  if (loading || !orderDetails) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
        <div className="bg-white rounded-lg w-[700px] max-w-[95%] max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center border-b sticky top-0 bg-white px-5 py-3 z-10">
            <h3 className="font-semibold text-lg">Chi tiết đơn hàng</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <IoClose size={24} />
            </button>
          </div>
          <div className="p-5 flex justify-center items-center h-32">
            {loading ? (
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            ) : (
              <p className="text-gray-500">Không tìm thấy thông tin đơn hàng</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const invoice = orderDetails.invoice;
  const products = orderDetails.products || [];
  const tickets = orderDetails.tickets || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white rounded-lg w-[700px] max-w-[95%] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b sticky top-0 bg-white px-5 py-3 z-10">
          <h3 className="font-semibold text-lg">Chi tiết đơn hàng</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <IoClose size={24} />
          </button>
        </div>
        
        <div className="p-5">
          {/* Order Header */}
          <div className="flex flex-col md:flex-row justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Hóa đơn #{invoice.id}</h2>
              <p className="text-sm text-gray-600 mt-1">{formatDateTime(invoice.createDate)}</p>
            </div>
            <div className="mt-2 md:mt-0">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${orderStatusColor[invoice.status] || 'bg-gray-100 text-gray-800'}`}>
                {invoice.status}
              </span>
            </div>
          </div>
          
          {/* Customer Info */}
          <div className="bg-gray-50 rounded-md p-4 mb-6">
            <h4 className="font-medium text-gray-700 mb-2">Thông tin khách hàng</h4>
            {invoice.Customer ? (
              <div>
                <p className="text-gray-800">{invoice.Customer.fullName}</p>
                <p className="text-gray-600 text-sm mt-1">{invoice.Customer.phoneNumber}</p>
                {invoice.Customer.email && (
                  <p className="text-gray-600 text-sm mt-1">{invoice.Customer.email}</p>
                )}
              </div>
            ) : (
              <p className="text-gray-600">Khách hàng vãng lai</p>
            )}
            
            {invoice.note && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-sm text-gray-600">Ghi chú: {invoice.note}</p>
              </div>
            )}
            
            <div className="flex items-center mt-2 pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-600">Phương thức thanh toán:</span>
              <span className="ml-2 text-sm font-medium">{invoice.paymentMethod || "Chưa thanh toán"}</span>
            </div>
          </div>

          {/* Tickets */}
          {tickets.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-3">Vé</h4>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-xs text-gray-700 border-b">
                      <th className="px-4 py-2 text-left">Phim</th>
                      <th className="px-4 py-2 text-center">Rạp - Phòng</th>
                      <th className="px-4 py-2 text-center">Suất chiếu</th>
                      <th className="px-4 py-2 text-center">Ghế</th>
                      <th className="px-4 py-2 text-right">Giá vé</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket, index) => (
                      <tr key={index} className="border-b last:border-b-0">
                        <td className="px-4 py-3 text-left">
                          {ticket.ShowTime?.Movie?.title || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {ticket.ShowTime?.Room?.Cinema?.name || "N/A"} - {ticket.ShowTime?.Room?.name || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {ticket.ShowTime ? (
                            <div>
                              <div>{formatDateTime(ticket.ShowTime.showDate).split(" - ")[1]}</div>
                              <div className="text-xs text-gray-500">{ticket.ShowTime.startTime?.substring(0, 5)}</div>
                            </div>
                          ) : "N/A"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {ticket.Seat?.position || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(ticket.price || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Products */}
          {products.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-3">Sản phẩm</h4>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-xs text-gray-700 border-b">
                      <th className="px-4 py-2 text-left">Sản phẩm</th>
                      <th className="px-4 py-2 text-center">Đơn giá</th>
                      <th className="px-4 py-2 text-center">SL</th>
                      <th className="px-4 py-2 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product, index) => (
                      <tr key={index} className="border-b last:border-b-0">
                        <td className="px-4 py-3 text-left">
                          {product.Product?.name || "Sản phẩm không xác định"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {formatCurrency(product.purchasePrice || 0)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {product.quantity || 0}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency((product.quantity || 0) * (product.purchasePrice || 0))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-md p-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Tổng tiền sản phẩm:</span>
              <span className="font-medium">
                {formatCurrency(products.reduce((sum, p) => sum + (p.purchasePrice || 0) * (p.quantity || 0), 0))}
              </span>
            </div>
            
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Tổng tiền vé:</span>
              <span className="font-medium">
                {formatCurrency(tickets.reduce((sum, t) => sum + (t.price || 0), 0))}
              </span>
            </div>
            
            {invoice.Discount && (
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Giảm giá:</span>
                <span className="font-medium text-red-600">
                  - {formatCurrency(invoice.totalDiscount || 0)}
                </span>
              </div>
            )}
            
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-medium">Tổng thanh toán:</span>
              <span className="font-bold text-green-600">{formatCurrency(invoice.totalAmount || 0)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;