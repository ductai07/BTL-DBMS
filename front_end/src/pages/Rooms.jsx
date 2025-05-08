import Header from "../component/Header";
import Select from "../component/Select";
import { FaPlus } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import AddRoom from "../component/AddRoom";
import TableRooms from "../component/TableRooms";
import Search from "../component/Search";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [cinemaOptions, setCinemaOptions] = useState([
    { key: "", value: "Tất cả" },
  ]);
  const queryRef = useRef({
    SearchKey: "",
    SearchValue: "",
    SortKey: "",
    SortValue: "",
    Page: "",
    Limit: 10,
    cinemaId: "",
    type: "",
  });

  // Fetch cinema options
  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const response = await fetch("http://localhost:3000/cinema");
        if (!response.ok) {
          throw new Error("Failed to fetch cinemas");
        }
        const data = await response.json();

        // Format data for dropdown
        const options = [
          { key: "", value: "Tất cả" },
          ...(data.data || []).map((cinema) => ({
            key: cinema.id,
            value: cinema.name,
          })),
        ];

        setCinemaOptions(options);
      } catch (error) {
        console.error("Error fetching cinemas:", error);
      }
    };

    fetchCinemas();
  }, []);

  // Fetch initial room data
  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:3000/room");
        const data = await response.json();
        setRooms(data.data);
        setPagination(data.pagination);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleAddRoom = async (newRoom) => {
    const updateRooms = [
      newRoom,
      ...rooms.filter((room) => room.id !== newRoom.id),
    ];
    setRooms(updateRooms);

    const room = {
      name: newRoom.name,
      type: newRoom.type,
      seatCount: newRoom.seatCount,
      status: newRoom.status,
      cinema_id: newRoom.Cinema.id,
    };

    try {
      const response = await fetch("http://localhost:3000/room/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(room),
      });
      if (!response.ok) {
        const data = await response.json();
        console.error("Error:", data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleEditRoom = async (room) => {
    const updateRooms = [room, ...rooms.filter((item) => item.id !== room.id)];
    setRooms(updateRooms);

    const newRoom = {
      name: room.name,
      type: room.type,
      seatCount: room.seatCount,
      status: room.status,
      cinema_id: room.Cinema.id,
    };

    try {
      const response = await fetch(
        `http://localhost:3000/room/edit/${room.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newRoom),
        }
      );
      if (!response.ok) {
        const data = await response.json();
        console.error("Error:", data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDelete = (roomId) => {
    fetch(`http://localhost:3000/room/delete/${roomId}`, {
      method: "DELETE",
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error deleting room:", errorData.message);
          alert("Lỗi: " + errorData.message);
          return;
        }
        const updateRooms = rooms.filter((room) => room.id !== roomId);
        setRooms(updateRooms);
      })
      .catch((error) => {
        console.error("Lỗi mạng hoặc server:", error.message);
        alert("Lỗi mạng hoặc server: " + error.message);
      });
  };

  // Khong lien quan
  const roomsTypes = [
    { key: "all", value: "Tất cả" },
    { key: "standard", value: "Standard" },
    { key: "vip", value: "VIP" },
    { key: "imax", value: "IMAX" },
    { key: "deluxe", value: "Deluxe" },
    { key: "private", value: "Private" },
    { key: "lounge", value: "Lounge" },
    { key: "premium", value: "Premium" },
  ];

  const columnNames = [
    "Room Name",
    "Cinema",
    "Capacity",
    "Type",
    "Status",
    "Action",
  ];

  const [defaultCinemas, setDefaultCinemas] = useState(
    () => localStorage.getItem("keyCinemas") || cinemaOptions[0].value
  );
  const [defaultRoomTypes, setDefaultRoomTypes] = useState(
    () => localStorage.getItem("keyRoomTypes") || roomsTypes[0].value
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const entry = useRef({ title: "", action: "" });

  const changeEntry = (newEntry) => {
    entry.current = {
      title: newEntry[0],
      action: newEntry[1],
    };
  };

  const [infoRoom, setInfoRoom] = useState({
    name: "",
    Cinema: {
      id: "",
      name: "",
      address: "",
    },
    seatCount: "",
    type: "",
    id: Date.now(),
  });

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      queryRef.current.Page = currentPage;
      const queryString = new URLSearchParams(queryRef.current).toString();
      console.log("Searching with query:", queryString);
      const response = await fetch(`http://localhost:3000/room?${queryString}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRooms(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error searching rooms:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [currentPage, search, defaultCinemas, defaultRoomTypes]);

  const handleReset = () => {
    // Reset all search parameters
    queryRef.current = {
      SearchKey: "",
      SearchValue: "",
      SortKey: "",
      SortValue: "",
      Page: 1,
      Limit: 10,
      cinemaId: "",
      type: "",
    };

    setSearch("");
    setDefaultCinemas(cinemaOptions[0].value);
    setDefaultRoomTypes(roomsTypes[0].value);
    setCurrentPage(1);

    // Trigger a new search with reset parameters
    handleSearch();
  };

  return (
    <div className="w-[100%] h-[100vh]  bg-neutral-100  p-5 overflow-auto">
      <Header title={"Cinema Management"} />
      <div>
        <div className="flex justify-between mb-6 bg-white p-6 shadow-md rounded-xl">
          <div className="w-full">
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex-grow max-w-md">
                <div className="font-medium pb-2">Tìm kiếm phòng</div>
                <Search
                  placeholder={"Nhập tên phòng cần tìm..."}
                  setSearch={setSearch}
                  search={search}
                  keySearch={"name"}
                  queryRef={queryRef}
                />
              </div>
              <div>
                <div className="font-medium pb-2">Rạp chiếu phim</div>
                <Select
                  options={cinemaOptions}
                  defaultValue={defaultCinemas}
                  setDefault={setDefaultCinemas}
                  keyStorage={"keyCinemas"}
                  queryRef={queryRef}
                  keySearch={"cinemaId"}
                />
              </div>
              <div>
                <div className="font-medium pb-2">Loại phòng</div>
                <Select
                  options={roomsTypes}
                  defaultValue={defaultRoomTypes}
                  setDefault={setDefaultRoomTypes}
                  keyStorage={"keyRoomTypes"}
                  queryRef={queryRef}
                  keySearch={"type"}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 rounded-md border border-gray-500 text-gray-700 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center"
                onClick={handleReset}
              >
                Đặt lại bộ lọc
              </button>
            </div>
          </div>
          <div className="flex items-start">
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition-colors duration-200 text-white rounded-md flex items-center gap-2"
              onClick={() => {
                setIsModalOpen(true);
                changeEntry(["Thêm phòng mới", "Add"]);
              }}
            >
              <FaPlus />
              Thêm phòng
            </button>
          </div>
        </div>
        <div>
          {isLoading ? (
            <div className="bg-white p-8 rounded-lg shadow-md flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : rooms.length === 0 ? (
            <div className="bg-white p-8 rounded-lg text-center shadow-md">
              <p className="text-gray-500">
                Không tìm thấy phòng nào phù hợp với tìm kiếm.
              </p>
              <button
                onClick={handleReset}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Xem tất cả phòng
              </button>
            </div>
          ) : (
            <TableRooms
              columnNames={columnNames}
              rooms={rooms}
              setOpen={setIsModalOpen}
              setInfoRoom={setInfoRoom}
              changeEntry={changeEntry}
              handleDelete={handleDelete}
              setCurrentPage={setCurrentPage}
              currentPage={currentPage}
              totalPages={pagination?.totalPages}
            />
          )}
        </div>
      </div>

      <AddRoom
        title={entry.current.title}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddRoom={handleAddRoom}
        onEditRoom={handleEditRoom}
        entry={entry.current.action}
        infoRoom={infoRoom}
        setInfoRoom={setInfoRoom}
      />
    </div>
  );
};

export default Rooms;
