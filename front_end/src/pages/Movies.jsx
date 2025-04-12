import Header from "../component/Header";
import Select from "../component/Select";
import { FaPlus } from "react-icons/fa";
import Table from "../component/Table";

const Movies = () => {
  const Genres = [
    {
      key: "all",
      value: "All Genres",
    },
    {
      key: "action",
      value: "Action",
    },
    {
      key: "comedy",
      value: "Comedy",
    },
    {
      key: "drama",
      value: "Drama",
    },
    {
      key: "sci-fi",
      value: "Sci-Fi",
    },
    {
      key: "horror",
      value: "Horror",
    },
    {
      key: "romance",
      value: "Romance",
    },
    {
      key: "documentary",
      value: "Documentary",
    },
  ];
  const filmStatuses = [
    { key: "all", value: "All Status" },
    { key: "coming_soon", value: "Coming Soon" },
    { key: "now_showing", value: "Now Showing" },
    { key: "ended", value: "Ended" },
    { key: "paused", value: "Paused" },
    { key: "cancelled", value: "Cancelled" },
  ];
  const columnNames = ["Movie", "Duration", "genre", "Status", "Actions"];

  return (
    <div className="w-[100%] h-[100vh]  bg-neutral-100  p-5 overflow-auto">
      <Header title={"Movie Management"} />
      <div>
        <div className="flex justify-between">
          <div className="flex gap-2">
            <Select options={Genres} />
            <Select options={filmStatuses} />
          </div>
          <button className="button flex items-center gap-1">
            <FaPlus />
            Add movie
          </button>
        </div>
        <Table />
      </div>
    </div>
  );
};

export default Movies;
