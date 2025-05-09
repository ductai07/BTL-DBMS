import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";

const AddTicketModal = ({
  isOpen,
  onClose,
  onAddTicket  // Đổi từ onSave thành onAddTicket
}) => {
  const [movies, setMovies] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [seats, setSeats] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [selectedMovie, setSelectedMovie] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedShowtime, setSelectedShowtime] = useState("");
  const [selectedSeat, setSelectedSeat] = useState("");
  const [price, setPrice] = useState("");
  const [customerId, setCustomerId] = useState("");
  // Xóa state status

  // Fetch movies when modal is opened
  useEffect(() => {
    if (isOpen) {
      fetchMovies();
      // Reset form
      setSelectedMovie("");
      setSelectedRoom("");
      setSelectedShowtime("");
      setSelectedSeat("");
      setPrice("");
      setCustomerId("");
      // Xóa reset status
    }
  }, [isOpen]);

  // Fetch rooms when a movie is selected
  useEffect(() => {
    if (selectedMovie) {
      fetchShowtimes(selectedMovie);
    } else {
      setShowtimes([]);
      setSelectedShowtime("");
    }
  }, [selectedMovie]);

  // Fetch seats when a room and showtime are selected
  useEffect(() => {
    if (selectedShowtime) {
      fetchSeats(selectedShowtime);
    } else {
      setSeats([]);
      setSelectedSeat("");
    }
  }, [selectedShowtime]);

  // Update price when seat is selected
  useEffect(() => {
    if (selectedSeat) {
      const seat = seats.find(s => s.id === parseInt(selectedSeat));
      if (seat) {
        setPrice(seat.price);
      }
    } else {
      setPrice("");
    }
  }, [selectedSeat, seats]);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/movie?status=Đang chiếu');
      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }
      const data = await response.json();
      setMovies(data.data || []);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShowtimes = async (movieId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/showtime?movieId=${movieId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch showtimes');
      }
      const data = await response.json();
      setShowtimes(data.data || []);
      
      // Extract unique rooms from showtimes
      if (data.data && data.data.length > 0) {
        const uniqueRooms = [...new Map(data.data.map(item => 
          [item.Room.id, item.Room]
        )).values()];
        setRooms(uniqueRooms);
      } else {
        setRooms([]);
      }
    } catch (error) {
      console.error('Error fetching showtimes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSeats = async (showtimeId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/showtime/${showtimeId}/seats`);
      if (!response.ok) {
        throw new Error('Failed to fetch seats');
      }
      const data = await response.json();
      // Filter only available seats (not booked)
      const availableSeats = (data.data?.seats || []).filter(seat => !seat.isBooked);
      setSeats(availableSeats);
    } catch (error) {
      console.error('Error fetching seats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedShowtime || !selectedSeat) {
      alert("Please select all required fields");
      return;
    }
    
    const newTicket = {
      showtime_id: parseInt(selectedShowtime),
      seat_id: parseInt(selectedSeat),
      price: parseFloat(price),
      bookingDate: new Date().toISOString().split('T')[0],
      // Xóa trường status
      // Add customer ID if provided, otherwise it will be handled by the backend
      ...(customerId && { customer_id: parseInt(customerId) })
    };
    
    onAddTicket(newTicket);  // Đổi từ onSave thành onAddTicket
  };

  if (!isOpen) return null;

  // Format date for display (YYYY-MM-DD to DD/MM/YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  };

  // Format time (HH:MM:SS to HH:MM)
  const formatTime = (timeString) => {
    if (!timeString) return "";
    return timeString.substring(0, 5);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-[500px] max-w-[95%]">
        <div className="flex justify-between items-center border-b px-5 py-3">
          <h3 className="font-semibold text-lg">Thêm vé mới</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoClose size={24} />
          </button>
        </div>
        
        {loading ? (
          <div className="p-5 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5">
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Phim
                </label>
                <select
                  value={selectedMovie}
                  onChange={(e) => setSelectedMovie(parseInt(e.target.value) || "")}
                  className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                >
                  <option value="">Chọn phim</option>
                  {movies.map((movie) => (
                    <option key={movie.id} value={movie.id}>
                      {movie.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Lịch chiếu
                </label>
                <select
                  value={selectedShowtime}
                  onChange={(e) => setSelectedShowtime(e.target.value)}
                  className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                  disabled={!selectedMovie}
                >
                  <option value="">Chọn lịch chiếu</option>
                  {showtimes.map((showtime) => (
                    <option key={showtime.id} value={showtime.id}>
                      {`${formatDate(showtime.showDate)} - ${formatTime(showtime.startTime)} - ${showtime.Room.name}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Ghế
                </label>
                <select
                  value={selectedSeat}
                  onChange={(e) => setSelectedSeat(e.target.value)}
                  className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                  disabled={!selectedShowtime}
                >
                  <option value="">Chọn ghế</option>
                  {seats.map((seat) => (
                    <option key={seat.id} value={seat.id}>
                      {`${seat.position} - ${seat.type} - ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(seat.price)}`}
                    </option>
                  ))}
                </select>
                {seats.length === 0 && selectedShowtime && (
                  <p className="mt-1 text-xs text-red-500">Không còn ghế trống cho lịch chiếu này</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Giá vé (VND)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 120000"
                  className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Mã khách hàng (không bắt buộc)
                </label>
                <input
                  type="number"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  placeholder="Nhập mã khách hàng nếu có"
                  className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              
              {/* Xóa trường select cho status */}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 mr-2"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Thêm vé
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddTicketModal;
