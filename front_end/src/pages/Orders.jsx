import { useState, useEffect, useRef } from "react";
import Header from "../component/Header";
import Search from "../component/Search";
import { FaPlus } from "react-icons/fa";
import TableOrders from "../component/TableOrders";
import AddOrderModal from "../component/AddOrderModal";
import OrderDetailsModal from "../component/OrderDetailsModal";
import Select from "../component/Select";
import Pagination from "../component/Pagination";
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
    pageSize: 5, // Set limit to 5
    total: 0
  });

  const queryRef = useRef({});

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    setTimeout(() => fetchOrders(), 0);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = `${API_ENDPOINTS.ORDERS}?Page=${pagination.currentPage}&Limit=${pagination.pageSize}`;
      if (queryRef.current.status && queryRef.current.status !== "all") {
        url += `&status=${encodeURIComponent(queryRef.current.status)}`;
      }
      if (queryRef.current.SearchKey && queryRef.current.SearchValue) {
        url += `&SearchKey=${encodeURIComponent(queryRef.current.SearchKey)}&SearchValue=${encodeURIComponent(queryRef.current.SearchValue)}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const formattedOrders = (data.data || []).map(invoice => ({
        id: invoice.id,
        date: formatDate(invoice.createDate),
        customer: formatCustomer(invoice.Customer, invoice.customer_id, invoice.note),
        total: invoice.totalAmount,
        status: invoice.status,
        products: (invoice.ProductUsages?.length || 0),
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
      setError("Không thể tải dữ liệu đơn hàng. Vui lòng thử lại sau.");
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [pagination.currentPage, searchTerm]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const formatCustomer = (customer, customerId, note) => {
    if (customer && customer.fullName) {
      return `${customer.fullName}${customer.phoneNumber ? ` (${customer.phoneNumber})` : ''}`;
    } else if (customerId) {
      return `Khách hàng #${customerId}`;
    } else if (note?.includes("Customer:")) {
      return note.replace("Customer:", "").trim();
    } else {
      return "Khách vãng lai";
    }
  };

  const fetchOrderDetails = async (orderId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/invoice/detail/${orderId}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setOrderDetails(data.data);
    } catch (err) {
      alert("Không thể tải chi tiết đơn hàng. Vui lòng thử lại sau.");
      setOrderDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenOrderDetails = async (orderId) => {
    setSelectedOrderId(orderId);
    await fetchOrderDetails(orderId);
    setIsDetailsModalOpen(true);
  };

  const handleCreateOrder = async () => {
    try {
      await fetchOrders();
      alert("Đơn hàng đã được tạo thành công!");
    } catch (err) {
      console.error("Error after creating order:", err);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này không?")) {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/invoice/delete/${orderId}`, { method: 'DELETE' });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        await fetchOrders();
        alert("Xóa đơn hàng thành công!");
      } catch (err) {
        alert(`Không thể xóa đơn hàng: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setLoading(true);
      const order = orders.find(o => o.id === orderId);
      if (newStatus === "Đã thanh toán" && order.status === "Chưa thanh toán") {
        const response = await fetch(`http://localhost:3000/invoice/payment/${orderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentMethod: 'Cash' })
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
      } else {
        throw new Error("Chỉ hỗ trợ chuyển trạng thái sang 'Đã thanh toán'");
      }
      await fetchOrders();
      alert("Cập nhật trạng thái đơn hàng thành công!");
    } catch (err) {
      alert(`Không thể cập nhật trạng thái đơn hàng: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    queryRef.current = { ...queryRef.current, page: newPage };
    // Remove fetchOrders() here
  };

  const statusOptions = [
    { key: "all", value: "Tất cả trạng thái" },
    { key: "Chưa thanh toán", value: "Chưa thanh toán" },
    { key: "Đã thanh toán", value: "Đã thanh toán" },
    { key: "Đã hủy", value: "Đã hủy" }
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Header title="Quản lý đơn hàng" />
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
              setSearchTerm("");
              setStatusFilter("all");
              setPagination(prev => ({ ...prev, currentPage: 1 }));
              queryRef.current = {};
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

          {pagination.totalPages > 1 && (
            <Pagination 
              pagination={pagination} 
              onPageChange={handlePageChange} 
            />
          )}
        </>
      )}

      <AddOrderModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateOrder}
      />
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
