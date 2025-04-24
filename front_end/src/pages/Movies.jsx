import Header from "../component/Header";
import Select from "../component/Select";
import { FaPlus } from "react-icons/fa";
import TableMovie from "../component/Movies/TableMovie";
import { useEffect, useState, useRef } from "react";
import AddMovieModal from "../component/Movies/AddMovieModal";
import Search from "../component/Search";

const Movies = () => {
  // Call api lay data
  let [data, setData] = useState([
    {
      id: 1,
      title: "The Dark Knight",
      duration: 152,
      genre: "Action",
      status: "Now Showing",
    },
    {
      id: 2,
      title: "Inception",
      duration: 148,
      genre: "Sci-Fi",
      status: "Coming Soon",
    },
    {
      id: 3,
      title: "Interstellar",
      duration: 169,
      genre: "Adventure",
      status: "Now Showing",
    },
  ]);
  // call api de upadate data
  const handleDelete = (idMovie) => {
    setDelete(!Delete);
    const updateData = data.filter(({ id }) => id != idMovie);
    setData(updateData);
  };

  const handleAddMovie = (newMovie) => {
    let updatedMovies = [
      newMovie,
      ...data.filter((movie) => movie.id != newMovie.id),
    ];
    setData(updatedMovies);
  };

  // Khong lien quan
  const columnNames = ["Movie", "Duration", "Genre", "Status", "Actions"];
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

  const [defaultGenres, setDefaultGenres] = useState(() => {
    return localStorage.getItem("keyGenres") || Genres[0].value;
  });

  const [defaultFilmStatus, setDefaultFilmStatus] = useState(() => {
    return localStorage.getItem("keyStatus") || filmStatuses[0].value;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [infoFilm, setInfoFilm] = useState({
    title: "",
    duration: "",
    genre: "",
    status: "",
    id: Date.now(),
  });
  const entry = useRef({});
  const changeEntry = (value) => {
    entry.current = {
      title: value[0],
      action: value[1],
    };
  };

  const [Delete, setDelete] = useState(false);

  return (
    <div className="w-[100%] h-[100vh]  bg-neutral-100  p-5 overflow-auto">
      <Header title={"Movie Management"} />
      <div>
        <div className="flex justify-between mb-6 bg-white p-5 shadow-md rounded-xl">
          <div>
            <div className="flex gap-2 mb-3">
              <div>
                <div className="font-medium pb-4">Tên phim</div>
                <Search placeholder={"Nhập tên phim"} />
              </div>
              <div>
                <div className="font-medium pb-4">Trạng thái</div>
                <Select
                  options={Genres}
                  defaultValue={defaultGenres}
                  setDefault={setDefaultGenres}
                  keyStorage={"keyGenres"}
                />
              </div>
              <div>
                <div className="font-medium pb-4">Thể loại</div>
                <Select
                  options={filmStatuses}
                  defaultValue={defaultFilmStatus}
                  setDefault={setDefaultFilmStatus}
                  keyStorage={"keyStatus"}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="button !bg-white !text-black border border-black flex items-center justify-center hover:cursor-pointer">
                Đặt lại
              </div>
              <div className="button flex items-center justify-center hover:cursor-pointer">
                Tìm kiếm
              </div>
            </div>
          </div>
          <button
            className="button flex items-center gap-1"
            onClick={() => {
              setIsModalOpen(true);
              changeEntry(["Add new movie", "Add"]);
            }}
          >
            <FaPlus />
            Add movie
          </button>
        </div>
        {!data.length ? (
          <p className="text-center font-semibold text-xl">
            Không có bộ phim nào được tìm thấy!!!
          </p>
        ) : (
          <TableMovie
            columnNames={columnNames}
            movies={data}
            setOpen={setIsModalOpen}
            setInfoFilm={setInfoFilm}
            changeEntry={changeEntry}
            handleDelete={handleDelete}
          />
        )}
      </div>
      <AddMovieModal
        title={entry.current.title}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddMovie={handleAddMovie}
        info={infoFilm}
        setInfo={setInfoFilm}
        Entry={entry.current.action}
      />
    </div>
  );
};

export default Movies;
