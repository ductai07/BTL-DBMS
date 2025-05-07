import React from 'react';
import { FaEye, FaTrash } from 'react-icons/fa';
import { formatCurrency } from '../utils/formatUtils';

const TableOrders = ({ orders, onOpenDetails, onUpdateStatus, onDelete }) => {
  // Get status class for styling
  const getStatusClass = (status) => {
    switch (status) {
      case 'Đã thanh toán':
        return 'bg-green-100 text-green-800';
      case 'Đang xử lý':
        return 'bg-yellow-100 text-yellow-800';
      case 'Đã hủy':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mã đơn hàng
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ngày
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Khách hàng
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tổng tiền
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sản phẩm
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                #{order.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {order.date}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {order.customer}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatCurrency(order.total || 0)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}`}>
                  {order.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {order.products}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onOpenDetails(order.id)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Xem chi tiết"
                  >
                    <FaEye />
                  </button>
                  
                  {order.status !== 'Đã hủy' && (
                    <select
                      className="text-xs border rounded px-1"
                      value={order.status}
                      onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                    >
                      <option value="Đang xử lý">Đang xử lý</option>
                      <option value="Đã thanh toán">Đã thanh toán</option>
                      <option value="Đã hủy">Đã hủy</option>
                    </select>
                  )}
                  
                  <button
                    onClick={() => onDelete(order.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Xóa đơn hàng"
                  >
                    <FaTrash />
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