import { useState } from "react";
import Header from "../component/Header";
import Search from "../component/Search";
import Select from "../component/Select";
import Schedule from "../component/Schedule";

const Showtime = () => {
  // { key: "all", value: "All Room Types" },
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
  return (
    <div className="w-[100%] h-[100vh]  bg-neutral-100  p-5 overflow-auto">
      <Header title={"Showtime"} />
      <div>
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
        <div>
          <div>Từ nay</div>
          <Schedule />
        </div>
      </div>
    </div>
  );
};

export default Showtime;
