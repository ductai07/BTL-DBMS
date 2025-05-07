import Header from "../component/Header";
import Select from "../component/Select";
import { FaPlus } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import AddRoom from "../component/AddRoom";
import TableRooms from "../component/TableRooms";
import Search from "../component/Search";
import { ca, ro } from "date-fns/locale";

const Rooms = () => {
  // Call api lay data
  const [rooms, setRooms] = useState([]);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const queryRef = useRef({
    SearchKey: "",
    SearchValue: "",
    SortKey: "",
    SortValue: "",
    Page: "",
    Limit: "",
    cinemaId: "",
  });
  useEffect(() => {
    const Fetch = async () => {
      const response = await fetch("http://localhost:3000/room");
      const data = await response.json();
      setRooms(data.data);
      console.log(data.data);
      setPagination(data.pagination);
    };
    Fetch();
  }, []);

  // call api de update data
  const handleAddRoom = async (newRoom) => {
    const updateRooms = [
      newRoom,
      ...rooms.filter((room) => room.id != newRoom.id),
    ];
    setRooms(updateRooms);
    // name, type, seatCount, status, cinema_id
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
    const updateRooms = [room, ...rooms.filter((item) => item.id != room.id)];
    setRooms(updateRooms);
    // name, type, seatCount, status, cinema_id
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
        console.log("Xóa phòng thành công!");
        const updateRooms = rooms.filter((room) => room.id != roomId);
        setRooms(updateRooms);
      })
      .catch((error) => {
        console.error("Lỗi mạng hoặc server:", error.message);
        alert("Lỗi mạng hoặc server: " + error.message);
      });
  };

  // Khong lien quan
  const Cinemas = [
    { key: "", value: "Tất cả" },
    { key: 1, value: "Galaxy Nguyễn Du" },
    { key: 3, value: "BHD Star Vincom Thảo Điền" },
    { key: 2, value: "CGV Crescent Mall" },
  ];

  const roomsTypes = [
    { key: "all", value: "All Room Types" },
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
    () => localStorage.getItem("keyCinemas") || Cinemas[0].value
  );
  const [defaultRoomTypes, setDefaultRoomTypes] = useState(
    () => localStorage.getItem("keyRoomTypes") || roomsTypes[0].value
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const entry = useRef({
    title: "",
    action: "",
  });
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

  const [search, setSearch] = useState("");
  // name, type, seatCount, status, cinema_id
  const handleSearch = async () => {
    queryRef.current.Page = currentPage;
    const queryString = new URLSearchParams(queryRef.current).toString();
    const response = await fetch(`http://localhost:3000/room?${queryString}`);
    const data = await response.json();
    setRooms(data.data);
    setPagination(data.pagination);
  };
  useEffect(() => {
    console.log("dc", queryRef.current.SearchKey);
    console.log("dc", queryRef.current.SearchValue);
    handleSearch();
  }, [currentPage, search, defaultCinemas, defaultRoomTypes]);
  const handleReset = () => {
    setSearch("");
    setDefaultCinemas(Cinemas[0].value);
    setDefaultRoomTypes(roomsTypes[0].value);
    setCurrentPage(1);
  };

  return (
    <div className="w-[100%] h-[100vh]  bg-neutral-100  p-5 overflow-auto">
      <Header title={"Cinema Management"} />
      <div>
        <div className="flex justify-between mb-6  bg-white p-5 shadow-md rounded-xl">
          <div>
            <div className="flex gap-2 mb-4">
              <div>
                <div className="font-medium pb-4">Mã phòng</div>
                <Search
                  placeholder={"Nhập tên phòng"}
                  setSearch={setSearch}
                  search={search}
                  keySearch={"name"}
                  queryRef={queryRef}
                />
              </div>
              <div>
                <div className="font-medium pb-4">Rạp</div>
                <Select
                  options={Cinemas}
                  defaultValue={defaultCinemas}
                  setDefault={setDefaultCinemas}
                  keyStorage={"keyCinemas"}
                  queryRef={queryRef}
                  keySearch={"cinemaId"}
                />
              </div>
              <div>
                <div className="font-medium pb-4">Loại phòng</div>
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
              <div
                className="button !bg-white !text-black border border-black flex items-center justify-center hover:cursor-pointer"
                onClick={handleReset}
              >
                Đặt lại
              </div>
              {/* <div
                className="button flex items-center justify-center hover:cursor-pointer"
                onClick={handleSearch}
              >
                Tìm kiếm
              </div> */}
            </div>
          </div>

          <button
            className="button flex items-center gap-1"
            onClick={() => {
              setIsModalOpen(true);
              changeEntry(["Add room", "Add"]);
            }}
          >
            <FaPlus />
            Add Room
          </button>
        </div>
        <div>
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
