import { useState, useEffect } from "react";
import Header from "../component/Header";
import Select from "../component/Select";
import { FaPlus, FaEye, FaBan, FaReceipt, FaTrash } from "react-icons/fa";
import TableTickets from "../component/TableTickets";
import AddTicketModal from "../component/AddTicketModal";
import Search from "../component/Search";
import { formatCurrency } from "../utils/formatUtils";

// Ticket Details Modal Component
const TicketDetailsModal = ({ isOpen, onClose, ticket, formatDate, formatCurrency }) => {
  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden">
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h3 className="text-xl font-semibold text-gray-900">Chi tiết vé #{ticket.id}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Ticket Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-lg mb-4 text-gray-700">Thông tin vé</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã vé:</span>
                  <span className="font-medium">{ticket.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày đặt:</span>
                  <span>{formatDate(ticket.bookingDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Giá vé:</span>
                  <span>{formatCurrency(ticket.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className={`font-medium ${
                    ticket.status === 'canceled' ? 'text-red-600' : 
                    ticket.status === 'used' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {ticket.status === 'canceled' ? 'Đã hủy' : 
                     ticket.status === 'used' ? 'Đã sử dụng' : 'Chưa sử dụng'}
                  </span>
                </div>
                {ticket.qrCode && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã QR:</span>
                    <span className="font-mono text-sm">{ticket.qrCode}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-lg mb-4 text-gray-700">Thông tin phim</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Phim:</span>
                  <span>{ticket.movieTitle || "Không có thông tin"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rạp:</span>
                  <span>{ticket.cinemaName || "Không có thông tin"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phòng:</span>
                  <span>{ticket.roomName || "Không có thông tin"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ghế:</span>
                  <span className="font-medium">{ticket.seatPosition || "Không có thông tin"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày chiếu:</span>
                  <span>{formatDate(ticket.showDate) || "Không có thông tin"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Giờ chiếu:</span>
                  <span>{ticket.showTime || "Không có thông tin"}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="font-medium text-lg mb-4 text-gray-700">Thông tin hóa đơn</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Mã hóa đơn:</span>
                <span>{ticket.invoice_id || "Chưa gắn với hóa đơn"}</span>
              </div>
              {ticket.originalData?.Invoice && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái hóa đơn:</span>
                    <span className={`font-medium ${
                      ticket.originalData.Invoice.status === 'paid' ? 'text-green-600' : 
                      ticket.originalData.Invoice.status === 'canceled' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {ticket.originalData.Invoice.status === 'paid' ? 'Đã thanh toán' : 
                       ticket.originalData.Invoice.status === 'canceled' ? 'Đã hủy' : 'Chưa thanh toán'}
                    </span>
                  </div>
                  {ticket.originalData.Invoice.Customer && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Khách hàng:</span>
                      <span>{ticket.originalData.Invoice.Customer.fullName}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="border-t px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 20,
    total: 0
  });
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [movieFilter, setMovieFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all"); // Thêm state cho timeFilter
  
  // Options for filters
  const [movieOptions, setMovieOptions] = useState([{ key: "all", value: "Tất cả phim" }]);
  const [dateOptions, setDateOptions] = useState([{ key: "all", value: "Tất cả ngày" }]);
  const [timeOptions, setTimeOptions] = useState([  // Thêm options cho timeFilter
    { key: "all", value: "Tất cả giờ" },
    { key: "morning", value: "Sáng (trước 12h)" },
    { key: "afternoon", value: "Chiều (12h-18h)" },
    { key: "evening", value: "Tối (sau 18h)" }
  ]);
  
  const statusOptions = [
    { key: "all", value: "Tất cả trạng thái" },
    { key: "used", value: "Đã sử dụng" },
    { key: "unused", value: "Chưa sử dụng" },
    { key: "canceled", value: "Đã hủy" }
  ];

  // State for ticket details modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Function to handle entry mode changes (for edit/add modals)
  const [entryMode, setEntryMode] = useState(["Thêm vé", "Lưu"]);
  
  // Change entry mode function (used when opening modal in different modes)
  const changeEntry = (newMode) => {
    setEntryMode(newMode);
  };

  // Fetch tickets from the API
  const fetchTickets = async () => {
    setLoading(true);
    try {
      // Use the main ticket endpoint instead of the simple one for more comprehensive data
      let url = `http://localhost:3000/ticket?Page=${pagination.currentPage}&Limit=${pagination.pageSize}`;
      
      // Add filters if not "all"
      if (movieFilter !== "all") {
        url += `&movieId=${movieFilter}`;
      }
      
      if (dateFilter !== "all") {
        url += `&date=${dateFilter}`;
      }
      
      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`;
      }
      
      if (timeFilter !== "all") {
        url += `&timeRange=${timeFilter}`;
      }
      
      if (searchTerm) {
        url += `&SearchKey=customerName&SearchValue=${encodeURIComponent(searchTerm)}`;
      }
      
      console.log("Fetching tickets from:", url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Ticket data received:", data);
      
      // Transform data for the table component with more useful information
      const formattedTickets = (data.data || []).map(ticket => ({
        id: ticket.id,
        bookingDate: ticket.bookingDate,
        price: ticket.price,
        qrCode: ticket.qrCode,
        showtime_id: ticket.showtimeId || ticket.showtime_id,
        seat_id: ticket.seatId || ticket.seat_id,
        invoice_id: ticket.invoiceId || ticket.invoice_id,
        status: ticket.status,
        // Additional info for display if available
        movieTitle: ticket.movieTitle || "Unknown",
        cinemaName: ticket.cinemaName || "Unknown",
        roomName: ticket.roomName || "Unknown",
        seatPosition: ticket.seatNumber || "Unknown",
        showDate: ticket.showDate,
        showTime: ticket.showTime,
        // Keep original data for reference
        originalData: ticket
      }));
      
      console.log("Formatted tickets:", formattedTickets);
      
      setTickets(formattedTickets);
      setFilteredTickets(formattedTickets);
      setPagination({
        currentPage: data.pagination?.currentPage || 1,
        totalPages: data.pagination?.totalPages || 1,
        pageSize: pagination.pageSize,
        total: data.pagination?.total || 0
      });
      setError(null);
      
      // Hiển thị thông báo nếu không có kết quả
      if (formattedTickets.length === 0) {
        setError("Không tìm thấy vé nào phù hợp với bộ lọc. Vui lòng thử lại với bộ lọc khác.");
      }
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError("Không thể tải dữ liệu vé. Vui lòng thử lại sau.");
      setTickets([]);
      setFilteredTickets([]);
    } finally {
      setLoading(false);
    }
  };

  // Format date (YYYY-MM-DD to DD/MM/YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  // Fetch movies for filter dropdown
  const fetchMovies = async () => {
    try {
      // Lấy danh sách lịch chiếu để biết phim nào đang có lịch
      const showtimeResponse = await fetch('http://localhost:3000/showtime');
      if (!showtimeResponse.ok) throw new Error(`HTTP error! status: ${showtimeResponse.status}`);
      
      const showtimeData = await showtimeResponse.json();
      
      // Tạo set các ID phim có lịch chiếu
      const movieIdsWithShowtimes = new Set();
      (showtimeData.data || []).forEach(showtime => {
        if (showtime.movieId || showtime.movie_id) {
          movieIdsWithShowtimes.add((showtime.movieId || showtime.movie_id).toString());
        }
      });
      
      // Lấy thông tin chi tiết về phim
      const movieResponse = await fetch('http://localhost:3000/movie');
      if (!movieResponse.ok) throw new Error(`HTTP error! status: ${movieResponse.status}`);
      
      const movieData = await movieResponse.json();
      
      // Lọc chỉ các phim có lịch chiếu
      const filteredMovies = (movieData.data || []).filter(movie => 
        movieIdsWithShowtimes.has(movie.id.toString())
      );
      
      const options = [
        { key: "all", value: "Tất cả phim" },
        ...filteredMovies.map(movie => ({
          key: movie.id.toString(),
          value: movie.title
        })).sort((a, b) => {
          if (a.key === "all") return -1;
          if (b.key === "all") return 1;
          return a.value.localeCompare(b.value);
        })
      ];
      
      setMovieOptions(options);
    } catch (err) {
      console.error("Error fetching movies:", err);
      // Giữ tùy chọn mặc định nếu fetch thất bại
    }
  };

  // Fetch unique dates from tickets for filter
  const fetchDates = async () => {
    try {
      const response = await fetch('http://localhost:3000/showtime/dates');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      const options = [
        { key: "all", value: "Tất cả ngày" },
        ...(data.data || []).map(date => ({
          key: date,
          value: formatDate(date)
        })).sort((a, b) => {
          // Sắp xếp ngày theo thứ tự tăng dần
          if (a.key === "all") return -1;
          if (b.key === "all") return 1;
          return new Date(a.key) - new Date(b.key);
        })
      ];
      
      setDateOptions(options);
    } catch (err) {
      console.error("Error fetching dates:", err);
      // Keep default options if fetch fails
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchMovies();
    fetchDates();
  }, []);

  // Fetch tickets when filters or pagination changes
  useEffect(() => {
    fetchTickets();
  }, [pagination.currentPage, movieFilter, dateFilter, statusFilter, timeFilter]);

  // Handle search with debounce
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (tickets.length > 0) {
        if (!searchTerm) {
          setFilteredTickets(tickets);
        } else {
          const lowerSearch = searchTerm.toLowerCase();
          const filtered = tickets.filter(ticket => {
            return (
              (ticket.customer && ticket.customer.toLowerCase().includes(lowerSearch)) ||
              (ticket.movie && ticket.movie.toLowerCase().includes(lowerSearch)) ||
              (ticket.seat && ticket.seat.toLowerCase().includes(lowerSearch))
            );
          });
          setFilteredTickets(filtered);
        }
      }
    }, 300);
    
    return () => clearTimeout(delaySearch);
  }, [searchTerm, tickets]);

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    switch (filterName) {
      case 'movie':
        setMovieFilter(value);
        break;
      case 'date':
        setDateFilter(value);
        break;
      case 'status':
        setStatusFilter(value);
        break;
      case 'time':
        setTimeFilter(value);
        break;
      default:
        break;
    }
    
    // Reset to page 1 when filters change
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };

  // Handle ticket deletion
  const handleDeleteTicket = async (ticketId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa vé này không?")) {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/ticket/delete/${ticketId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        // Re-fetch tickets
        fetchTickets();
        alert("Xóa vé thành công!");
      } catch (err) {
        console.error("Error deleting ticket:", err);
        alert(`Không thể xóa vé: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle adding a new ticket
  const handleAddTicket = async (ticketData) => {
    console.log("Adding ticket with data:", ticketData);
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/ticket/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ticketData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error response:", errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      // Re-fetch tickets
      fetchTickets();
      setIsModalOpen(false);
      alert("Thêm vé thành công!");
    } catch (err) {
      console.error("Error adding ticket:", err);
      alert(`Không thể thêm vé: ${err.message || 'Lỗi không xác định'}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch ticket details
  const fetchTicketDetails = async (ticketId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/ticket/detail/${ticketId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Return formatted ticket data for the modal
      const ticket = data.data;
      return {
        id: ticket.id,
        bookingDate: ticket.bookingDate,
        price: ticket.price,
        qrCode: ticket.qrCode,
        showtime_id: ticket.showtime_id,
        seat_id: ticket.seat_id,
        invoice_id: ticket.invoice_id,
        status: ticket.status || 'unused',
        movieTitle: ticket.ShowTime?.Movie?.title,
        cinemaName: ticket.ShowTime?.Room?.Cinema?.name,
        roomName: ticket.ShowTime?.Room?.name,
        seatPosition: ticket.Seat?.position,
        showDate: ticket.ShowTime?.showDate,
        showTime: ticket.ShowTime?.startTime,
        originalData: ticket
      };
    } catch (err) {
      console.error("Error fetching ticket details:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Handle viewing ticket details
  const handleViewTicketDetails = async (ticketId) => {
    try {
      const ticketDetails = await fetchTicketDetails(ticketId);
      setSelectedTicket(ticketDetails);
      setIsDetailsModalOpen(true);
    } catch (err) {
      alert("Không thể tải thông tin chi tiết vé. Vui lòng thử lại sau.");
    }
  };

  // Handle ticket cancellation
  const handleCancelTicket = async (ticketId) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy vé này không?")) {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/ticket/cancel/${ticketId}`, {
          method: 'PATCH',
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        // Re-fetch tickets
        fetchTickets();
        alert("Hủy vé thành công!");
      } catch (err) {
        console.error("Error cancelling ticket:", err);
        alert(`Không thể hủy vé: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle ticket assignment to invoice
  const handleAssignTicketToInvoice = async (ticketId, invoiceId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/invoice/${invoiceId}/ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ticketId })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      // Re-fetch tickets
      fetchTickets();
      alert("Đã thêm vé vào hóa đơn thành công!");
    } catch (err) {
      console.error("Error assigning ticket to invoice:", err);
      alert(`Không thể thêm vé vào hóa đơn: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle removing ticket from invoice
  const handleRemoveTicketFromInvoice = async (invoiceId, ticketId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa vé này khỏi hóa đơn không?")) {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/invoice/${invoiceId}/ticket/${ticketId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        // Re-fetch tickets
        fetchTickets();
        alert("Đã xóa vé khỏi hóa đơn thành công!");
      } catch (err) {
        console.error("Error removing ticket from invoice:", err);
        alert(`Không thể xóa vé khỏi hóa đơn: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setMovieFilter("all");
    setDateFilter("all");
    setStatusFilter("all");
    setTimeFilter("all"); // Reset timeFilter
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  return (
    <div className="p-6">
      <Header title="Quản lý vé" />
      
      {/* Controls */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Remover este componente Search */}
          
          <Select 
            options={movieOptions}
            value={movieFilter}
            onChange={(value) => handleFilterChange('movie', value)}
          />
          
          <Select 
            options={dateOptions}
            value={dateFilter}
            onChange={(value) => handleFilterChange('date', value)}
          />
          
          {/* <Select 
            options={timeOptions}
            value={timeFilter}
            onChange={(value) => handleFilterChange('time', value)}
          /> */}
          
          {/* <Select 
            options={statusOptions}
            value={statusFilter}
            onChange={(value) => handleFilterChange('status', value)}
          /> */}
          
          <button
            onClick={handleResetFilters}
            className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md border border-blue-600"
          >
            Đặt lại
          </button>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FaPlus /> Thêm vé
        </button>
      </div>
      
      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="bg-white p-8 rounded-lg text-center shadow-sm">
          <p className="text-gray-500">Không tìm thấy vé nào.</p>
        </div>
      ) : (
        <>
          <TableTickets
            tickets={filteredTickets}
            setOpen={setIsModalOpen}
            setInfoTicket={setSelectedTicket}
            changeEntry={changeEntry}
            handleDelete={handleDeleteTicket}
            formatCurrency={formatCurrency}
            onViewDetails={handleViewTicketDetails}
            onCancelTicket={handleCancelTicket}
            onAssignToInvoice={handleAssignTicketToInvoice}
            onRemoveFromInvoice={handleRemoveTicketFromInvoice}
          />
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, pagination.currentPage - 1))}
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
                          onClick={() => handlePageChange(i + 1)}
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
                  onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
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
      
      {/* Ticket Addition Modal */}
      <AddTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddTicket={handleAddTicket}  // Đổi từ onSave thành onAddTicket để khớp với AddTicketModal.jsx
      />

      {/* Ticket Details Modal */}
      <TicketDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        ticket={selectedTicket}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};

export default Tickets;