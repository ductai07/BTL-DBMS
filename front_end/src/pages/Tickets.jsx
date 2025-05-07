import { useState, useEffect } from "react";
import Header from "../component/Header";
import Select from "../component/Select";
import { FaPlus } from "react-icons/fa";
import TableTickets from "../component/TableTickets";
import AddTicketModal from "../component/AddTicketModal";
import Search from "../component/Search";
import { formatCurrency } from "../utils/formatUtils";

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
  
  // Options for filters
  const [movieOptions, setMovieOptions] = useState([{ key: "all", value: "Tất cả phim" }]);
  const [dateOptions, setDateOptions] = useState([{ key: "all", value: "Tất cả ngày" }]);
  
  const statusOptions = [
    { key: "all", value: "Tất cả trạng thái" },
    { key: "used", value: "Đã sử dụng" },
    { key: "unused", value: "Chưa sử dụng" },
    { key: "canceled", value: "Đã hủy" }
  ];

  // Fetch tickets from the API
  const fetchTickets = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:3000/ticket?Page=${pagination.currentPage}&Limit=${pagination.pageSize}`;
      
      // Add filters if not "all"
      if (movieFilter !== "all") {
        url += `&movie_id=${movieFilter}`;
      }
      
      if (dateFilter !== "all") {
        url += `&date=${dateFilter}`;
      }
      
      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`;
      }
      
      if (searchTerm) {
        url += `&SearchKey=customerName&SearchValue=${encodeURIComponent(searchTerm)}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform data for the table component
      const formattedTickets = (data.data || []).map(ticket => ({
        id: ticket.id,
        customer: ticket.Customer ? ticket.Customer.name : "Walk-in",
        movie: ticket.Showtime?.Movie?.title || "Unknown",
        date: formatDate(ticket.Showtime?.showDate),
        time: ticket.Showtime?.startTime?.substring(0, 5) || "",
        room: ticket.Showtime?.Room?.name || "Unknown",
        seat: ticket.Seat?.position || "Unknown",
        price: ticket.price,
        status: ticket.status || "Unknown",
        // Keep original data for reference
        originalData: ticket
      }));
      
      setTickets(formattedTickets);
      setFilteredTickets(formattedTickets);
      setPagination({
        currentPage: data.pagination?.currentPage || 1,
        totalPages: data.pagination?.totalPages || 1,
        pageSize: data.pagination?.pageSize || 20,
        total: data.pagination?.total || 0
      });
      setError(null);
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
      const response = await fetch('http://localhost:3000/movie');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      const options = [
        { key: "all", value: "Tất cả phim" },
        ...(data.data || []).map(movie => ({
          key: movie.id.toString(),
          value: movie.title
        }))
      ];
      
      setMovieOptions(options);
    } catch (err) {
      console.error("Error fetching movies:", err);
      // Keep default options if fetch fails
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
        }))
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
  }, [pagination.currentPage, movieFilter, dateFilter, statusFilter]);

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
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      // Re-fetch tickets
      fetchTickets();
      setIsModalOpen(false);
      alert("Thêm vé thành công!");
    } catch (err) {
      console.error("Error adding ticket:", err);
      alert(`Không thể thêm vé: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setMovieFilter("all");
    setDateFilter("all");
    setStatusFilter("all");
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Header title="Quản lý vé" />
      
      {/* Controls */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Search 
            placeholder="Tìm kiếm theo khách hàng, phim..." 
            setSearch={setSearchTerm}
            search={searchTerm}
          />
          
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
          
          <Select 
            options={statusOptions}
            value={statusFilter}
            onChange={(value) => handleFilterChange('status', value)}
          />
          
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
            columnNames={["ID", "Phim", "Rạp", "Phòng", "Ghế", "Ngày", "Giờ", "Giá", "Trạng thái", "Thao tác"]}
            tickets={filteredTickets}
            setOpen={setIsModalOpen}
            setInfoTicket={() => {}} // Add proper implementation if needed
            changeEntry={() => {}} // Add proper implementation if needed
            handleDelete={handleDeleteTicket}
            formatCurrency={formatCurrency}
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
        onAddTicket={handleAddTicket}
      />
    </div>
  );
};

export default Tickets;