import { useState } from "react";
import { IoTicketOutline } from "react-icons/io5";
import { GrSchedulePlay } from "react-icons/gr";
const TopRevenue = () => {
  // Call api
  const topMovies = [
    {
      title: "Avengers: Endgame",
      tickets: 1245,
      shows: 25,
      revenue: 24250000,
    },
    {
      title: "Joker",
      tickets: 890,
      shows: 20,
      revenue: 18700000,
    },
    {
      title: "Parasite",
      tickets: 658,
      shows: 18,
      revenue: 14125000,
    },
    {
      title: "The Batman",
      tickets: 542,
      shows: 15,
      revenue: 10840000,
    },
    {
      title: "Dune",
      tickets: 450,
      shows: 12,
      revenue: 9350000,
    },
  ];

  const buttons = ["Hôm nay", "Tuần này", "Tháng này"];
  const [focus, setFocus] = useState(0);
  return (
    <div className="bg-white p-5 shadow-md rounded-lg mb-5">
      <div className="flex justify-between mb-4">
        <h3 className="font-semibold">Top phim có doanh thu cao nhất</h3>
        <div className="space-x-2">
          {buttons.map((value, idx) => (
            <button
              key={idx}
              className={
                focus === idx
                  ? "button"
                  : "button  !bg-white !text-black border-2"
              }
              onClick={() => setFocus(idx)}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <div>
        {topMovies.map((movie, idx) => (
          <div key={`movie-${idx}`} className="flex justify-between items-center border-b pb-3 pt-3">
            <div className="flex gap-6 items-center">
              <span
                className={
                  "w-10 rounded-full p-2 text-center font-bold " +
                  (idx === 0
                    ? "bg-yellow-300"
                    : idx === 1
                    ? "bg-gray-400"
                    : idx === 2
                    ? "bg-yellow-600"
                    : "bg-gray-100")
                }
              >
                {idx + 1}
              </span>
              <div>
                <span className="font-bold">{movie.title}</span>
                <div className="flex space-x-2 text-sm text-gray-400">
                  <div className="flex gap-2 items-center">
                    <IoTicketOutline />
                    <span>{movie.tickets} vé</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <GrSchedulePlay />
                    <span>{movie.shows} xuất</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <span className="font-semibold text-green-500">
                {movie.revenue.toLocaleString()} đ
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopRevenue;
