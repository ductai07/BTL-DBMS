import Header from "../component/Header";
import Select from "../component/Select";
import { FaPlus } from "react-icons/fa";
import { useRef, useState, useEffect } from "react";
import AddRoom from "../component/AddRoom";
import TableRooms from "../component/TableRooms";
import Search from "../component/Search";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null);
  const [modalEntry, setModalEntry] = useState(["Add Room", "Add"]);
  const [cinemaFilter, setCinemaFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [cinemas, setCinemas] = useState([]);

  // Columns for the rooms table
  const columnNames = ["Room Name", "Cinema", "Capacity", "Type", "Actions"];

  // Fetch cinemas from the API
  const fetchCinemas = async () => {
    try {
      const response = await fetch('http://localhost:3000/cinema');
      
      if (!response.ok) {
        throw new Error('Failed to fetch cinemas');
      }
      
      const data = await response.json();
      
      // Format for dropdown
      const cinemaOptions = [
        { key: "all", value: "All Cinemas" },
        ...(data.data || []).map(cinema => ({
          key: cinema.id.toString(),
          value: cinema.name
        }))
      ];
      
      setCinemas(cinemaOptions);
    } catch (error) {
      console.error('Error fetching cinemas:', error);
      setCinemas([{ key: "all", value: "All Cinemas" }]);
    }
  };

  // Fetch rooms from the API
  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/room');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform data to match the expected format
      const formattedRooms = (data.data || []).map(room => ({
        id: room.id,
        roomName: room.name,
        cinema: room.Cinema ? room.Cinema.name : "Unknown",
        cinema_id: room.cinema_id,
        capacity: room.seatCount || 0,
        type: room.type || "Standard",
        status: room.status || "Active",
        // Keep the original data for reference if needed
        originalData: room
      }));
      
      setRooms(formattedRooms);
      filterRooms(formattedRooms, cinemaFilter, searchText);
      setError(null);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setError("Failed to load rooms. Please try again later.");
      setRooms([]);
      setFilteredRooms([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchCinemas();
    fetchRooms();
  }, []);

  // Filter rooms based on cinema and search text
  const filterRooms = (roomsData, cinema, search) => {
    let filtered = roomsData;
    
    // Filter by cinema
    if (cinema && cinema !== "all") {
      filtered = filtered.filter(room => 
        room.cinema_id === parseInt(cinema) || 
        room.cinema_id === cinema
      );
    }
    
    // Filter by search text
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(room => 
        room.roomName.toLowerCase().includes(searchLower) ||
        room.cinema.toLowerCase().includes(searchLower) ||
        room.type.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredRooms(filtered);
  };

  // Handle cinema filter change
  const handleCinemaChange = (value) => {
    setCinemaFilter(value);
    filterRooms(rooms, value, searchText);
  };

  // Handle search text change
  const handleSearchChange = (value) => {
    setSearchText(value);
    filterRooms(rooms, cinemaFilter, value);
  };

  // Handle adding or editing a room
  const handleAddRoom = async (roomData) => {
    try {
      setLoading(true);
      let response;
      
      if (roomData.id) {
        // Edit existing room
        response = await fetch(`http://localhost:3000/room/edit/${roomData.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: roomData.roomName,
            cinema_id: roomData.cinema_id,
            type: roomData.type,
            status: roomData.status || 'Active'
          })
        });
      } else {
        // Add new room
        response = await fetch('http://localhost:3000/room/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: roomData.roomName,
            cinema_id: roomData.cinema_id,
            type: roomData.type,
            status: 'Active'
          })
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      // Re-fetch rooms after successful operation
      await fetchRooms();
      setIsModalOpen(false);
      alert(roomData.id ? "Room updated successfully!" : "Room added successfully!");
    } catch (err) {
      console.error("Error saving room:", err);
      alert(`Failed to save room: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle room deletion
  const handleDelete = async (roomId) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/room/delete/${roomId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        // Re-fetch rooms after successful deletion
        await fetchRooms();
        alert("Room deleted successfully!");
      } catch (err) {
        console.error("Error deleting room:", err);
        alert(`Failed to delete room: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="w-[100%] h-[100vh] bg-neutral-100 p-5 overflow-auto">
      <Header title="Room Management" />
      
      {/* Controls */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <Search 
            onSearch={handleSearchChange} 
            placeholder="Search rooms..." 
          />
          <Select 
            options={cinemas}
            value={cinemaFilter}
            onChange={handleCinemaChange}
          />
        </div>
        
        <button
          onClick={() => {
            setRoomInfo(null);
            setModalEntry(["Add Room", "Add"]);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FaPlus /> Add Room
        </button>
      </div>
      
      {/* Room Content */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="bg-white p-8 rounded-lg text-center shadow-sm">
          <p className="text-gray-500">No rooms found. Please add a new room or change your filters.</p>
        </div>
      ) : (
        <TableRooms
          columnNames={columnNames}
          rooms={filteredRooms}
          setOpen={setIsModalOpen}
          setInfoRoom={setRoomInfo}
          changeEntry={setModalEntry}
          handleDelete={handleDelete}
        />
      )}
      
      {/* Room Modal */}
      <AddRoom
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddRoom}
        title={modalEntry[0]}
        buttonText={modalEntry[1]}
        roomInfo={roomInfo}
        cinemas={cinemas.filter(cinema => cinema.key !== "all")}
      />
    </div>
  );
};

export default Rooms;
