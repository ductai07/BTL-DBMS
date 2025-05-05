import { useRef, useState } from "react";
import Header from "../component/Header";
import Search from "../component/Search";
import Select from "../component/Select";
import Schedule from "../component/Schedule";
import { FaPlus } from "react-icons/fa";
import TableTickets from "../component/TableTickets";
import TabelShowTime from "../component/TabelShowTime";
import AddShowTimeModal from "../component/AddShowTimeModal";

const Showtime = () => {
  const roomOptions = [
    { key: "all", value: "--Tất cả phòng--" },
    { key: "room1", value: "Phòng 1" },
    { key: "room2", value: "Phòng 2" },
    { key: "room3", value: "Phòng 3" },
    { ley: "VIP", value: "Phòng VIP" },
  ];
  const [showTimeRoom, setShowTimeRoom] = useState(() => {
    return localStorage.getItem("showTimeRoom") || roomOptions[0].value;
  });

  const statusOptions = [
    { key: "all", value: "--Tất cả trạng thái" },
    { key: "coming", value: "Sắp chiếu" },
    { key: "shown", value: "Đang chiếu" },
    { key: "showned", value: "Đã chiếu" },
  ];

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const handleReset = () => {
    setEndDate("");
    setStartDate("");
    setShowTimeRoom(roomOptions[0].value);
  };

  // ====================
  const showTimes = [
    {
      id: 1,
      title: "Avengers: Endgame",
      room: "Phòng 1",
      date: "06/04/2025",
      time: "19:30 - 22:30",
      format: "IMAX 3D",
      status: "Sắp chiếu",
      tickets: { sold: 45, total: 150 },
    },
    {
      id: 2,
      title: "Joker",
      room: "Phòng 2",
      date: "05/04/2025",
      time: "18:00 - 20:00",
      format: "2D",
      status: "Đang chiếu",
      tickets: { sold: 120, total: 120 },
    },
    {
      id: 3,
      title: "Parasite",
      room: "Phòng VIP",
      date: "04/04/2025",
      time: "14:00 - 16:30",
      format: "2D",
      status: "Đã chiếu",
      tickets: { sold: 80, total: 80 },
    },
    {
      id: 4,
      title: "The Batman",
      room: "Phòng 3",
      date: "05/04/2025",
      time: "20:30 - 23:15",
      format: "4DX",
      status: "Sắp chiếu",
      tickets: { sold: 35, total: 100 },
    },
    {
      id: 5,
      title: "Inception",
      room: "Phòng 4",
      date: "07/04/2025",
      time: "21:00 - 23:45",
      format: "IMAX 2D",
      status: "Sắp chiếu",
      tickets: { sold: 60, total: 120 },
    },
    {
      id: 6,
      title: "Interstellar",
      room: "Phòng 5",
      date: "03/04/2025",
      time: "17:00 - 20:00",
      format: "4DX",
      status: "Đã chiếu",
      tickets: { sold: 100, total: 100 },
    },
    {
      id: 7,
      title: "Oppenheimer",
      room: "Phòng 6",
      date: "06/04/2025",
      time: "15:30 - 18:30",
      format: "3D",
      status: "Đang chiếu",
      tickets: { sold: 90, total: 100 },
    },
    {
      id: 8,
      title: "Dune: Part Two",
      room: "Phòng VIP",
      date: "08/04/2025",
      time: "19:00 - 21:45",
      format: "IMAX 3D",
      status: "Sắp chiếu",
      tickets: { sold: 30, total: 80 },
    },
    {
      id: 9,
      title: "Avengers: Endgame",
      room: "Phòng 1",
      date: "06/04/2025",
      time: "19:30 - 22:30",
      format: "IMAX 3D",
      status: "Sắp chiếu",
      tickets: { sold: 45, total: 150 },
    },
    {
      id: 10,
      title: "Joker",
      room: "Phòng 2",
      date: "05/04/2025",
      time: "18:00 - 20:00",
      format: "2D",
      status: "Đang chiếu",
      tickets: { sold: 120, total: 120 },
    },
    {
      id: 11,
      title: "Parasite",
      room: "Phòng VIP",
      date: "04/04/2025",
      time: "14:00 - 16:30",
      format: "2D",
      status: "Đã chiếu",
      tickets: { sold: 80, total: 80 },
    },
    {
      id: 12,
      title: "The Batman",
      room: "Phòng 3",
      date: "05/04/2025",
      time: "20:30 - 23:15",
      format: "4DX",
      status: "Sắp chiếu",
      tickets: { sold: 35, total: 100 },
    },
    {
      id: 13,
      title: "Inception",
      room: "Phòng 4",
      date: "07/04/2025",
      time: "21:00 - 23:45",
      format: "IMAX 2D",
      status: "Sắp chiếu",
      tickets: { sold: 60, total: 120 },
    },
    {
      id: 14,
      title: "Interstellar",
      room: "Phòng 5",
      date: "03/04/2025",
      time: "17:00 - 20:00",
      format: "4DX",
      status: "Đã chiếu",
      tickets: { sold: 100, total: 100 },
    },
    {
      id: 15,
      title: "Oppenheimer",
      room: "Phòng 6",
      date: "06/04/2025",
      time: "15:30 - 18:30",
      format: "3D",
      status: "Đang chiếu",
      tickets: { sold: 90, total: 100 },
    },
    {
      id: 16,
      title: "Dune: Part Two",
      room: "Phòng VIP",
      date: "08/04/2025",
      time: "19:00 - 21:45",
      format: "IMAX 3D",
      status: "Sắp chiếu",
      tickets: { sold: 30, total: 80 },
    },
  ];

  const [formData, setFormData] = useState({
    title: "",
    room: "",
    date: "",
    startTime: "",
    endTime: "",
    status: "Sắp chiếu",
    totalTickets: 0,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const entry = useRef({});
  const changeEntry = (value) => {
    entry.current = {
      title: value[0],
      action: value[1],
    };
  };
  const onClose = () => {
    setIsModalOpen(false);
  };
  return (
    <div className="w-[100%] h-[100vh]  bg-neutral-100  p-5 overflow-auto">
      <Header title={"Showtime"} />
      <div className="mb-6  bg-white p-5 shadow-md rounded-xl">
        <div className="flex gap-2 pb-4 justify-between">
          <div className="flex gap-2">
            <div>
              <div>Tên phim</div>
              <Search placeholder={"Nhập tên phim"} />
            </div>
            <div>
              <div>Phòng chiếu</div>
              <Select
                options={roomOptions}
                defaultValue={showTimeRoom}
                setDefault={setShowTimeRoom}
                keyStorage={"showTimeRoom"}
              />
            </div>
            <div>
              <div>Trạng thái</div>
              <Select
                options={statusOptions}
                defaultValue={showTimeRoom}
                setDefault={setShowTimeRoom}
                keyStorage={"showTimeRoom"}
              />
            </div>
          </div>
          <button
            className="button flex items-center gap-1"
            onClick={() => {
              setIsModalOpen(true);
              changeEntry(["Thêm lịch chiếu", "Add"]);
            }}
          >
            <FaPlus />
            Showtime
          </button>
        </div>
        <div className="flex gap-2 pb-4">
          <div>
            <span>Từ ngày</span>
            <Schedule date={startDate} setDate={setStartDate} />
          </div>
          <div>
            <span>Đến ngày</span>
            <Schedule date={endDate} setDate={setEndDate} />
          </div>
        </div>
        <div className="flex gap-2 pb-4">
          <div
            className="button !bg-white !text-black border border-black flex items-center justify-center hover:cursor-pointer"
            onClick={handleReset}
          >
            Đặt lại
          </div>
          <div className="button flex items-center justify-center hover:cursor-pointer">
            Tìm kiếm
          </div>
        </div>
      </div>
      <TabelShowTime
        showTimes={showTimes}
        setOpen={setIsModalOpen}
        setInfoShowTime={setFormData}
        changeEntry={changeEntry}
        // handleDelete={}
      />
      {isModalOpen ? (
        <AddShowTimeModal
          entry={entry}
          onClose={onClose}
          formData={formData}
          setFormData={setFormData}
          // onSave={}
        />
      ) : null}
    </div>
  );
};

export default Showtime;
