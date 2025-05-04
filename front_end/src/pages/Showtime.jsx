import { useState } from "react";
import Header from "../component/Header";
import Search from "../component/Search";
import Select from "../component/Select";
import Schedule from "../component/Schedule";
import { FaPlus } from "react-icons/fa";

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
          <button className="button flex items-center gap-1">
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
          <div
            className="button flex items-center justify-center hover:cursor-pointer"
            handleSearch
          >
            Tìm kiếm
          </div>
        </div>
      </div>
    </div>
  );
};

export default Showtime;
