import Header from "../component/Header";
import Select from "../component/Select";
import { FaPlus } from "react-icons/fa";
import TableRooms from "../component/TableRooms";
import { useEffect, useState } from "react";

const Rooms = () => {
  // Call api lay data
  const [rooms, setRooms] = useState([
    {
      id: 1,
      roomName: "Screen 1",
      cinema: "Cinema City Downtown",
      capacity: 180,
      type: "Standard",
    },
    {
      id: 2,
      roomName: "VIP Room A",
      cinema: "Megaplex Central",
      capacity: 60,
      type: "VIP",
    },
    {
      id: 3,
      roomName: "IMAX Theater",
      cinema: "Star Cinema Mall",
      capacity: 300,
      type: "IMAX",
    },
    {
      id: 4,
      roomName: "Screen 2",
      cinema: "Cinema City Downtown",
      capacity: 150,
      type: "Standard",
    },
    {
      id: 5,
      roomName: "VIP Room B",
      cinema: "Megaplex Central",
      capacity: 50,
      type: "VIP",
    },
    {
      id: 6,
      roomName: "IMAX Theater 2",
      cinema: "Star Cinema Mall",
      capacity: 320,
      type: "IMAX",
    },
    {
      id: 7,
      roomName: "Screen 3",
      cinema: "Cinema City Downtown",
      capacity: 170,
      type: "Standard",
    },
    {
      id: 8,
      roomName: "Deluxe Room",
      cinema: "Luxury Cinemas",
      capacity: 100,
      type: "VIP",
    },
    {
      id: 9,
      roomName: "Screen 4",
      cinema: "Downtown Cinemas",
      capacity: 160,
      type: "Standard",
    },
    {
      id: 10,
      roomName: "Private Room",
      cinema: "Megaplex Central",
      capacity: 40,
      type: "VIP",
    },
    {
      id: 11,
      roomName: "IMAX Hall",
      cinema: "Star Cinema Mall",
      capacity: 310,
      type: "IMAX",
    },
    {
      id: 12,
      roomName: "Screen 5",
      cinema: "Cinema City North",
      capacity: 140,
      type: "Standard",
    },
    {
      id: 13,
      roomName: "VIP Lounge",
      cinema: "Cinema City Downtown",
      capacity: 65,
      type: "VIP",
    },
    {
      id: 14,
      roomName: "IMAX Galaxy",
      cinema: "Galaxy Cineplex",
      capacity: 350,
      type: "IMAX",
    },
    {
      id: 15,
      roomName: "Screen 6",
      cinema: "Megaplex Central",
      capacity: 155,
      type: "Standard",
    },
  ]);
  // Khong lien quan
  const Cinemas = [
    { key: "all", value: "All Cinemas" },
    { key: "cinema city downtown", value: "Cinema City Downtown" },
    { key: "megaplex central", value: "Megaplex Central" },
    { key: "star cinema mall", value: "Star Cinema Mall" },
    { key: "luxury cinemas", value: "Luxury Cinemas" },
    { key: "downtown cinemas", value: "Downtown Cinemas" },
    { key: "cinema city north", value: "Cinema City North" },
    { key: "galaxy cineplex", value: "Galaxy Cineplex" },
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

  const columnNames = ["Room Name", "Cinema", "Capacity", "Type", "Action"];

  const [defaultCinemas, setDefaultCinemas] = useState(
    () => localStorage.getItem("keyCinemas") || Cinemas[0].value
  );
  const [defaultRoomTypes, setDefaultRoomTypes] = useState(
    () => localStorage.getItem("keyRoomTypes") || rooms[0].value
  );

  const [listFilterRooms, setListFilterRooms] = useState([]);

  const filterRooms = (data) => {
    let filted = data;
    if (defaultCinemas != Cinemas[0].value) {
      filted = filted.filter((room) => room.cinema === defaultCinemas);
    }
    if (defaultRoomTypes != roomsTypes[0].value) {
      filted = filted.filter((room) => room.type === defaultRoomTypes);
    }

    setListFilterRooms(filted);
  };

  useEffect(() => {
    filterRooms(rooms);
  }, [defaultCinemas, defaultRoomTypes]);

  return (
    <div className="w-[100%] h-[100vh]  bg-neutral-100  p-5 overflow-auto">
      <Header title={"Cinema Management"} />
      <div>
        <div className="flex justify-between mb-6">
          <div className="flex gap-2">
            <Select
              options={Cinemas}
              defaultValue={defaultCinemas}
              setDefault={setDefaultCinemas}
              keyStorage={"keyCinemas"}
            />
            <Select
              options={roomsTypes}
              defaultValue={defaultRoomTypes}
              setDefault={setDefaultRoomTypes}
              keyStorage={"keyRoomTypes"}
            />
          </div>
          <button className="button flex items-center gap-1">
            <FaPlus />
            Add Room
          </button>
        </div>
        <div>
          <TableRooms columnNames={columnNames} rooms={listFilterRooms} />
        </div>
      </div>
    </div>
  );
};

export default Rooms;
