// Sửa dòng import để thêm useRef
import { useState, useEffect, useRef } from "react";
import Header from "../component/Header";
import Search from "../component/Search";
import { FaPlus } from "react-icons/fa";
import TableOrders from "../component/TableOrders";
import AddOrderModal from "../component/AddOrderModal";
import OrderDetailsModal from "../component/OrderDetailsModal";
import Select from "../component/Select";
import { formatCurrency } from "../utils/formatUtils";
import { API_ENDPOINTS } from "../config/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    total: 0
  });

  // Fetch orders from the database
  // Thêm state để lưu trữ các tham số tìm kiếm
  const queryRef = useRef({});
  
  // Thêm hàm xử lý khi thay đổi trạng thái
  const handleStatusChange = (status) => {
    setStatusFilter(status);
    // Đặt lại trang về 1 khi thay đổi bộ lọc
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    // Gọi fetchOrders ngay lập tức
    setTimeout(() => fetchOrders(), 0);
  };
  
  // Trong hàm fetchOrders, sửa phần tìm kiếm
  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = `${API_ENDPOINTS.ORDERS}?Page=${pagination.currentPage}&Limit=${pagination.pageSize}`;
      
      // Sử dụng queryRef để lấy các tham số tìm kiếm
      if (queryRef.current.status && queryRef.current.status !== "all") {
        url += `&status=${encodeURIComponent(queryRef.current.status)}`;
      }
      
      if (queryRef.current.SearchKey && queryRef.current.SearchValue) {
        url += `&SearchKey=${encodeURIComponent(queryRef.current.SearchKey)}&SearchValue=${encodeURIComponent(queryRef.current.SearchValue)}`;
      }
      
      console.log("Fetching orders from:", url);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Xóa dòng này vì đã khai báo data ở dưới
      // const data = await response.json();
      // console.log("Search response:", data);
      
      const data = await response.json();
      console.log("Received orders data:", data);
      
      // Format data for the component
      const formattedOrders = (data.data || []).map(invoice => ({
        id: invoice.id,
        date: formatDate(invoice.createDate),
        customer: formatCustomer(invoice.Customer, invoice.customer_id, invoice.note),
        total: invoice.totalAmount,
        status: invoice.status,
        products: (invoice.ProductUsages?.length || 0),
        // Keep original data for reference
        originalData: invoice
      }));
      
      setOrders(formattedOrders);
      setFilteredOrders(formattedOrders);
      setPagination({
        currentPage: data.pagination?.currentPage || 1,
        totalPages: data.pagination?.totalPages || 1,
        pageSize: data.pagination?.pageSize || 10,
        total: data.pagination?.total || 0
      });
      setError(null);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Không thể tải dữ liệu đơn hàng. Vui lòng thử lại sau.");
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchOrders();
  }, [pagination.currentPage, searchTerm]); // Loại bỏ statusFilter khỏi dependencies

  // Format date function (YYYY-MM-DD to DD/MM/YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  // Format customer information with better fallback
  const formatCustomer = (customer, customerId, note) => {
    if (customer && customer.fullName) {
      return `${customer.fullName}${customer.phoneNumber ? ` (${customer.phoneNumber})` : ''}`;
    } else if (customerId) {
      return `Khách hàng #${customerId}`;
    } else if (note && note.includes("Customer:")) {
      return note.replace("Customer:", "").trim();
    } else {
      return "Khách vãng lai";
    }
  };

  // Fetch order details when opening the details modal
  const fetchOrderDetails = async (orderId) => {
    setLoading(true);
    try {
      console.log("Fetching order details for ID:", orderId);
      const response = await fetch(`http://localhost:3000/invoice/detail/${orderId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Received order details:", data);
      
      setOrderDetails(data.data);
    } catch (err) {
      console.error("Error fetching order details:", err);
      alert("Không thể tải chi tiết đơn hàng. Vui lòng thử lại sau.");
      setOrderDetails(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle opening order details
  const handleOpenOrderDetails = async (orderId) => {
    setSelectedOrderId(orderId);
    await fetchOrderDetails(orderId);
    setIsDetailsModalOpen(true);
  };

  // Handle order creation
  const handleCreateOrder = async () => {
    try {
      await fetchOrders();
      alert("Đơn hàng đã được tạo thành công!");
    } catch (err) {
      console.error("Error after creating order:", err);
    }
  };

  // Handle order deletion
  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này không?")) {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/invoice/delete/${orderId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        // Re-fetch orders
        await fetchOrders();
        alert("Xóa đơn hàng thành công!");
      } catch (err) {
        console.error("Error deleting order:", err);
        alert(`Không thể xóa đơn hàng: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setLoading(true);
      
      // If updating to "Đã thanh toán" and current status is "Chưa thanh toán",
      // call the payment endpoint
      const order = orders.find(o => o.id === orderId);
      
      if (newStatus === "Đã thanh toán" && order.status === "Chưa thanh toán") {
        const response = await fetch(`http://localhost:3000/invoice/payment/${orderId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ paymentMethod: 'Cash' })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
      } else {
        // For other status changes, we would need a dedicated endpoint
        // This should be implemented in the backend
        throw new Error("Chỉ hỗ trợ chuyển trạng thái sang 'Đã thanh toán'");
      }
      
      // Re-fetch orders
      await fetchOrders();
      alert("Cập nhật trạng thái đơn hàng thành công!");
    } catch (err) {
      console.error("Error updating order status:", err);
      alert(`Không thể cập nhật trạng thái đơn hàng: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Status options - Chuyển sang định dạng cũ (key/value)
// Trong component Orders

// Đã có định dạng đúng cho statusOptions
const statusOptions = [
  { key: "all", value: "Tất cả trạng thái" },
  { key: "Chưa thanh toán", value: "Chưa thanh toán" },
  { key: "Đã thanh toán", value: "Đã thanh toán" },
  { key: "Đã hủy", value: "Đã hủy" }
];

// Xóa đoạn JSX <Select> ở đây

return (
  <div className="p-6 bg-gray-100 min-h-screen">
    <Header title="Quản lý đơn hàng" />
    
    {/* Controls */}
    <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Search 
          placeholder="Tìm kiếm theo tên khách hàng..." 
          setSearch={setSearchTerm}
          search={searchTerm}
          queryRef={queryRef}
          keySearch="$Customer.fullName$" 
        />
        
        <Select 
          options={statusOptions}
          value={statusFilter}
          onChange={handleStatusChange}
          keySearch="status"
          queryRef={queryRef}
        />
        
          <button
            onClick={() => {
              // Đặt lại các state
              setSearchTerm("");
              setStatusFilter("all");
              setPagination(prev => ({ ...prev, currentPage: 1 }));
              
              // Đặt lại queryRef
              queryRef.current = {};
              
              // Gọi fetchOrders ngay lập tức
              setTimeout(() => fetchOrders(), 0);
            }}
            className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md border border-blue-600"
          >
            Đặt lại
          </button>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FaPlus /> Tạo đơn hàng
        </button>
      </div>
      
      {/* Content */}
      {loading && filteredOrders.length === 0 ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white p-8 rounded-lg text-center shadow-sm">
          <p className="text-gray-500">Không tìm thấy đơn hàng nào.</p>
        </div>
      ) : (
        <>
          <TableOrders
            orders={filteredOrders}
            onOpenDetails={handleOpenOrderDetails}
            onUpdateStatus={handleUpdateOrderStatus}
            onDelete={handleDeleteOrder}
          />
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
                  disabled={pagination.currentPage === 1}
                  className={`px-3 py-1 rounded ${pagination.currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                >
                  Trước
                </button>
                
                <div className="flex items-center gap-1">
                  {[...Array(pagination.totalPages)].map((_, i) => {
                    // Show max 5 page numbers with ellipsis
                    if (
                      pagination.totalPages <= 5 ||
                      i + 1 === 1 ||
                      i + 1 === pagination.totalPages ||
                      (i + 1 >= pagination.currentPage - 1 && i + 1 <= pagination.currentPage + 1)
                    ) {
                      return (
                        <button
                          key={i}
                          onClick={() => setPagination(prev => ({ ...prev, currentPage: i + 1 }))}
                          className={`w-8 h-8 flex items-center justify-center rounded ${
                            pagination.currentPage === i + 1
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                          }`}
                        >
                          {i + 1}
                        </button>
                      );
                    } else if (
                      (i === 1 && pagination.currentPage > 3) ||
                      (i === pagination.totalPages - 2 && pagination.currentPage < pagination.totalPages - 2)
                    ) {
                      return <span key={i}>...</span>;
                    }
                    return null;
                  })}
                </div>
                
                <button
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(pagination.totalPages, prev.currentPage + 1) }))}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className={`px-3 py-1 rounded ${pagination.currentPage === pagination.totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                >
                  Tiếp
                </button>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Order Creation Modal */}
      <AddOrderModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateOrder}
      />
      
      {/* Order Details Modal */}
      <OrderDetailsModal 
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        orderDetails={orderDetails}
        loading={loading}
      />
    </div>
  );
};

export default Orders;