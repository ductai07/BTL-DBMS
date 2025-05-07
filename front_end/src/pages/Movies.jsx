import Header from "../component/Header";
import Select from "../component/Select";
import { FaPlus } from "react-icons/fa";
import TableMovie from "../component/TableMovie";
import { useState, useRef, useEffect } from "react";
import AddMovieModal from "../component/AddMovieModal";
import Search from "../component/Search";

const Movies = () => {
  // Call api lay data
  let [data, setData] = useState([]);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    const Fetch = async () => {
      const response = await fetch("http://localhost:3000/movie");
      const data = await response.json();
      setData(data.data);
      setPagination(data.pagination);
      setCurrentPage(data.pagination.currentPage);
      console.log(data.data);
    };
    Fetch();
  }, []);
  // call api de upadate data
  const handleDelete = async (idMovie) => {
    setDelete(!Delete);
    const updateData = data.filter(({ id }) => id != idMovie);
    setData(updateData);
    // Xóa phim: http://localhost:3000/movie/delete/:id
    try {
      const response = await fetch(
        `http://localhost:3000/movie/delete/${idMovie}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleUpdateMovie = async (editMovie) => {
    let updatedMovies = [
      editMovie,
      ...data.filter((movie) => editMovie.id != movie.id),
    ];
    setData(updatedMovies);
    try {
      const response = await fetch(
        `http://localhost:3000/movie/edit/${editMovie.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editMovie),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Update successful:", data);
    } catch (error) {
      console.error("Error updating movie:", error);
    }
  };

  const handleAddMovie = async (newMovie) => {
    let updatedMovies = [
      newMovie,
      ...data.filter((movie) => movie.id != newMovie.id),
    ];
    setData(updatedMovies);

    // http://localhost:3000/movie/add
    try {
      const response = await fetch("http://localhost:3000/movie/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMovie),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const queryRef = useRef({
    SearchKey: "",
    SearchValue: "",
    SortKey: "",
    SortValue: "",
    Page: "",
    Limit: 10,
  });

  const handleSearch = () => {
    queryRef.current.SearchKey = "title";
    queryRef.current.SearchValue = search;
    queryRef.current.Page = currentPage;
    const queryString = new URLSearchParams(queryRef.current).toString();
    fetch(`http://localhost:3000/movie?${queryString}`)
      .then((response) => response.json())
      .then((data) => {
        setData(data.data);
        setPagination(data.pagination);
      });
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
  // ['Đang chiếu', 'Sắp chiếu', 'Ngừng chiếu'];
  const filmStatuses = [
    { key: "", value: "Tất cả" },
    { key: "coming_soon", value: "Sắp chiếu" },
    { key: "now_showing", value: "Đang chiếu" },
    { key: "ended", value: "Ngừng chiếu" },
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
  const [search, setSearch] = useState("");

  const handleReset = () => {
    setSearch("");
    setDefaultFilmStatus(filmStatuses[0].value);
    setDefaultGenres(Genres[0].value);
    setCurrentPage(1);
  };

  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    handleSearch();
  }, [currentPage, search]);

  return (
    <div className="w-[100%] h-[100vh]  bg-neutral-100  p-5 overflow-auto">
      <Header title={"Movie Management"} />
      <div>
        <div className="flex justify-between mb-6 bg-white p-5 shadow-md rounded-xl">
          <div>
            <div className="flex gap-2 mb-3">
              <div>
                <div className="font-medium pb-4">Tên phim</div>
                <Search
                  placeholder={"Nhập tên phim"}
                  setSearch={setSearch}
                  search={search}
                />
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
              <div
                className="button !bg-white !text-black border border-black flex items-center justify-center hover:cursor-pointer"
                onClick={handleReset}
              >
                Đặt lại
              </div>
              <div
                className="button flex items-center justify-center hover:cursor-pointer"
                onClick={handleSearch}
              >
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
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={pagination.totalPages}
          />
        )}
      </div>
      <AddMovieModal
        title={entry.current.title}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddMovie={handleAddMovie}
        onUpdateMovie={handleUpdateMovie}
        info={infoFilm}
        setInfo={setInfoFilm}
        Entry={entry.current.action}
      />
    </div>
  );
};

export default Movies;
