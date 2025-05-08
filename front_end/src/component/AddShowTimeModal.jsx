import React, { useState, useEffect } from "react";

const AddShowTimeModal = ({
  title = "Add new showtime",
  isOpen,
  onClose,
  onAddShowtime,
  info,
  setInfo,
<<<<<<< HEAD
  Entry = "Add"
=======
  Entry = "Add",
>>>>>>> 626958eeea26f3e633d93420202198f4651be05c
}) => {
  const [formData, setFormData] = useState({
    id: "",
    movieId: "",
    roomId: "",
    showDate: "",
    startTime: "",
    price: "",
<<<<<<< HEAD
    status: "Sắp chiếu"
=======
    status: "Sắp chiếu",
>>>>>>> 626958eeea26f3e633d93420202198f4651be05c
  });

  const [movies, setMovies] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
<<<<<<< HEAD
  
=======

>>>>>>> 626958eeea26f3e633d93420202198f4651be05c
  // Fetch movies and rooms when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchMovies();
      fetchRooms();
<<<<<<< HEAD
      
=======

>>>>>>> 626958eeea26f3e633d93420202198f4651be05c
      // If editing an existing showtime
      if (info && info.id) {
        setFormData({
          id: info.id,
          movieId: info.movie_id || "",
          roomId: info.room_id || "",
          showDate: info.showDate || "",
          startTime: info.startTime ? info.startTime.substring(0, 5) : "",
          price: info.price || "",
<<<<<<< HEAD
          status: info.status || "Sắp chiếu"
=======
          status: info.status || "Sắp chiếu",
>>>>>>> 626958eeea26f3e633d93420202198f4651be05c
        });
      } else {
        // Reset form for new showtime
        setFormData({
          id: "",
          movieId: "",
          roomId: "",
          showDate: "",
          startTime: "",
          price: "",
<<<<<<< HEAD
          status: "Sắp chiếu"
=======
          status: "Sắp chiếu",
>>>>>>> 626958eeea26f3e633d93420202198f4651be05c
        });
      }
    }
  }, [isOpen, info]);
<<<<<<< HEAD
  
=======

>>>>>>> 626958eeea26f3e633d93420202198f4651be05c
  // Fetch available movies
  const fetchMovies = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/movie");
      if (!response.ok) throw new Error("Failed to fetch movies");
      const data = await response.json();
      setMovies(data.data || []);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  };
<<<<<<< HEAD
  
=======

>>>>>>> 626958eeea26f3e633d93420202198f4651be05c
  // Fetch available rooms
  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/room");
      if (!response.ok) throw new Error("Failed to fetch rooms");
      const data = await response.json();
      setRooms(data.data || []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // Validate form data
<<<<<<< HEAD
    if (!formData.movieId || !formData.roomId || !formData.showDate || !formData.startTime) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }
    
=======
    if (
      !formData.movieId ||
      !formData.roomId ||
      !formData.showDate ||
      !formData.startTime
    ) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

>>>>>>> 626958eeea26f3e633d93420202198f4651be05c
    onAddShowtime(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[500px] shadow-lg">
        <h2 className="text-lg font-bold mb-4">{title}</h2>

        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Movie selection */}
            <div>
              <label className="block text-sm font-medium mb-1">Phim</label>
              <select
                name="movieId"
                value={formData.movieId}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value="">Chọn phim</option>
<<<<<<< HEAD
                {movies.map(movie => (
=======
                {movies.map((movie) => (
>>>>>>> 626958eeea26f3e633d93420202198f4651be05c
                  <option key={movie.id} value={movie.id}>
                    {movie.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Room selection */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Phòng chiếu
              </label>
              <select
                name="roomId"
                value={formData.roomId}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value="">Chọn phòng</option>
<<<<<<< HEAD
                {rooms.map(room => (
=======
                {rooms.map((room) => (
>>>>>>> 626958eeea26f3e633d93420202198f4651be05c
                  <option key={room.id} value={room.id}>
                    {room.name} - {room.Cinema?.name || "Unknown"}
                  </option>
                ))}
              </select>
            </div>

            {/* Date selection */}
            <div>
<<<<<<< HEAD
              <label className="block text-sm font-medium mb-1">Ngày chiếu</label>
=======
              <label className="block text-sm font-medium mb-1">
                Ngày chiếu
              </label>
>>>>>>> 626958eeea26f3e633d93420202198f4651be05c
              <input
                type="date"
                name="showDate"
                value={formData.showDate}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              />
            </div>

            {/* Time and price */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  Giờ bắt đầu
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  Giá vé (VND)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="VD: 80000"
                  min="0"
                  step="1000"
                />
              </div>
            </div>

            {/* Status selection */}
            <div>
<<<<<<< HEAD
              <label className="block text-sm font-medium mb-1">Trạng thái</label>
=======
              <label className="block text-sm font-medium mb-1">
                Trạng thái
              </label>
>>>>>>> 626958eeea26f3e633d93420202198f4651be05c
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="Sắp chiếu">Sắp chiếu</option>
                <option value="Đang chiếu">Đang chiếu</option>
                <option value="Đã chiếu">Đã chiếu</option>
              </select>
            </div>
          </div>
        )}

        {/* Modal actions */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleSubmit}
            disabled={loading}
          >
            {Entry}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddShowTimeModal;
