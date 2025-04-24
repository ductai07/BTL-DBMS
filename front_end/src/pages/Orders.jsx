import Header from "../component/Header";
import Select from "../component/Select";
import { FaPlus, FaSearch, FaFilter } from "react-icons/fa";
import { useEffect, useState, useRef } from "react";
import TableOrders from "../component/TableOrders";
import AddOrderModal from "../component/AddOrderModal";
import OrderDetailsModal from "../component/OrderDetailsModal";
import { formatCurrency } from "../utils/formatUtils";

const Orders = () => {
  // Sample data - would normally come from an API
  let [data, setData] = useState([
    {
      id: 1,
      orderNumber: "ORD-2025-001",
      customerName: "Nguyễn Văn A",
      orderDate: "2025-04-24T19:30:00",
      totalAmount: 275000,
      status: "Completed",
      items: [
        { id: 1, name: "Ticket: The Dark Knight (Room A1, Seat A12)", price: 120000, quantity: 1 },
        { id: 2, name: "Bắp rang bơ lớn", price: 65000, quantity: 1 },
        { id: 3, name: "Coca Cola ly lớn", price: 35000, quantity: 2 }
      ],
      paymentMethod: "Credit Card"
    },
    {
      id: 2,
      orderNumber: "ORD-2025-002",
      customerName: "Trần Thị B",
      orderDate: "2025-04-24T20:15:00",
      totalAmount: 150000,
      status: "Processing",
      items: [
        { id: 1, name: "Ticket: Inception (Room B2, Seat C5)", price: 150000, quantity: 1 }
      ],
      paymentMethod: "Cash"
    },
    {
      id: 3,
      orderNumber: "ORD-2025-003",
      customerName: "Lê Văn C",
      orderDate: "2025-04-25T10:45:00",
      totalAmount: 370000,
      status: "Completed",
      items: [
        { id: 1, name: "Ticket: Interstellar (Room A2, Seat D8)", price: 120000, quantity: 2 },
        { id: 2, name: "Combo Couple", price: 130000, quantity: 1 }
      ],
      paymentMethod: "Banking App"
    },
    {
      id: 4,
      orderNumber: "ORD-2025-004",
      customerName: "Phạm Thị D",
      orderDate: "2025-04-25T13:20:00",
      totalAmount: 185000,
      status: "Cancelled",
      items: [
        { id: 1, name: "Ticket: The Dark Knight (Room A1, Seat B5)", price: 120000, quantity: 1 },
        { id: 2, name: "Bắp rang bơ lớn", price: 65000, quantity: 1 }
      ],
      paymentMethod: "Credit Card"
    },
    {
      id: 5,
      orderNumber: "ORD-2025-005",
      customerName: "Hoàng Văn E",
      orderDate: "2025-04-25T14:10:00",
      totalAmount: 220000,
      status: "Processing",
      items: [
        { id: 1, name: "Combo Family", price: 220000, quantity: 1 }
      ],
      paymentMethod: "Cash"
    }
  ]);
  
  // API calls for data management
  const handleDelete = (orderId) => {
    setDelete(!Delete);
    const updateData = data.filter(({ id }) => id != orderId);
    setData(updateData);
    filterOrders(updateData);
  };

  const handleAddOrder = (newOrder) => {
    let updatedOrders = [
      newOrder,
      ...data.filter((order) => order.id != newOrder.id),
    ];
    setData(updatedOrders);
    filterOrders(updatedOrders);
  };

  const handleUpdateStatus = (id, newStatus) => {
    const updatedData = data.map(order => 
      order.id === id ? {...order, status: newStatus} : order
    );
    setData(updatedData);
    filterOrders(updatedData);
  };

  // Table configuration
  const columnNames = ["Order #", "Customer", "Date", "Amount", "Status", "Payment", "Actions"];
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const orderStatuses = [
    { key: "all", value: "All Status" },
    { key: "completed", value: "Completed" },
    { key: "processing", value: "Processing" },
    { key: "cancelled", value: "Cancelled" }
  ];
  
  const paymentMethods = [
    { key: "all", value: "All Payments" },
    { key: "cash", value: "Cash" },
    { key: "credit_card", value: "Credit Card" },
    { key: "banking_app", value: "Banking App" }
  ];

  const [defaultOrderStatus, setDefaultOrderStatus] = useState(() => {
    return localStorage.getItem("keyOrderStatus") || orderStatuses[0].value;
  });

  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState(() => {
    return localStorage.getItem("keyPaymentMethod") || paymentMethods[0].value;
  });

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filterOrders = (dataToFilter) => {
    let filtered = dataToFilter;

    // Filter by status
    if (defaultOrderStatus !== orderStatuses[0].value) {
      filtered = filtered.filter((order) => {
        return order.status === defaultOrderStatus;
      });
    }

    // Filter by payment method
    if (defaultPaymentMethod !== paymentMethods[0].value) {
      filtered = filtered.filter((order) => {
        return order.paymentMethod === defaultPaymentMethod;
      });
    }

    // Filter by date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59); // Set to end of day
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.orderDate);
        return orderDate >= start && orderDate <= end;
      });
    }

    // Filter by search term
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((order) => {
        return order.orderNumber.toLowerCase().includes(term) || 
               order.customerName.toLowerCase().includes(term);
      });
    }

    setOrders(filtered);
  };

  // Calculate statistics
  const totalOrders = data.length;
  const completedOrders = data.filter(order => order.status === "Completed").length;
  const totalRevenue = data.reduce((sum, order) => 
    order.status !== "Cancelled" ? sum + order.totalAmount : sum, 0
  );
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  useEffect(() => {
    filterOrders(data);
  }, [defaultOrderStatus, defaultPaymentMethod, searchTerm, startDate, endDate]);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Selected order for details
  const [selectedOrder, setSelectedOrder] = useState(null);

  // View order details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const [orderInfo, setOrderInfo] = useState({
    orderNumber: "",
    customerName: "",
    orderDate: new Date().toISOString(),
    totalAmount: "",
    status: "",
    items: [],
    paymentMethod: "",
    id: Date.now(),
  });
  
  const entry = useRef({});
  const changeEntry = (value) => {
    entry.current = {
      title: value[0],
      action: value[1],
    };
  };

  const [Delete, setDelete] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  return (
    <div className="w-[100%] h-[100vh] bg-neutral-100 p-5 overflow-auto">
      <Header title={"Order Management"} />
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
          <p className="text-2xl font-semibold">{totalOrders}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Completed Orders</h3>
          <p className="text-2xl font-semibold text-green-600">{completedOrders}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Average Order Value</h3>
          <p className="text-2xl font-semibold text-blue-600">{formatCurrency(averageOrderValue)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="text-2xl font-semibold text-green-600">{formatCurrency(totalRevenue)}</p>
        </div>
      </div>
      
      <div>
        {/* Filters and actions */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-64"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <Select
              options={orderStatuses}
              defaultValue={defaultOrderStatus}
              setDefault={setDefaultOrderStatus}
              keyStorage={"keyOrderStatus"}
            />
            <Select
              options={paymentMethods}
              defaultValue={defaultPaymentMethod}
              setDefault={setDefaultPaymentMethod}
              keyStorage={"keyPaymentMethod"}
            />
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-1 border border-gray-300 bg-white px-4 py-2 rounded-md hover:bg-gray-50"
            >
              <FaFilter />
              Date Filter
            </button>
          </div>
          <button
            className="button flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            onClick={() => {
              setIsAddModalOpen(true);
              changeEntry(["Create new order", "Create"]);
            }}
          >
            <FaPlus />
            New order
          </button>
        </div>

        {/* Date filter */}
        {showFilter && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by Date Range</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button 
                onClick={() => { 
                  setStartDate(""); 
                  setEndDate("");
                }}
                className="text-sm text-gray-600 hover:text-red-600"
              >
                Clear Dates
              </button>
            </div>
          </div>
        )}
        
        {/* Orders list display */}
        {!orders.length ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/4076/4076432.png" 
              alt="No orders" 
              className="w-24 h-24 mx-auto opacity-50"
            />
            <p className="text-center font-semibold text-xl mt-4 text-gray-700">
              Không có đơn hàng nào được tìm thấy!
            </p>
            <p className="text-gray-500 mt-2">
              Thử thay đổi bộ lọc hoặc tạo đơn hàng mới
            </p>
          </div>
        ) : (
          <TableOrders
            columnNames={columnNames}
            orders={orders}
            onStatusChange={handleUpdateStatus}
            onViewDetails={viewOrderDetails}
            handleDelete={handleDelete}
            setOpen={setIsAddModalOpen}
            setOrderInfo={setOrderInfo}
            changeEntry={changeEntry}
          />
        )}
      </div>
      
      <AddOrderModal
        title={entry.current.title}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddOrder={handleAddOrder}
        info={orderInfo}
        setInfo={setOrderInfo}
        Entry={entry.current.action}
      />

      <OrderDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        order={selectedOrder}
      />
    </div>
  );
};

export default Orders;