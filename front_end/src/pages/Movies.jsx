import Header from "../component/Header";
import Select from "../component/Select";
import { FaPlus } from "react-icons/fa";
import TableMovie from "../component/TableMovie";
import { useEffect, useState } from "react";
import AddMovieModal from "../component/AddMovieModal";

const Movies = () => {
  const data = [
    {
      id: 1,
      title: "The Dark Knight",
      duration: "152 min",
      genre: "Action",
      status: "Now Showing",
    },
    {
      id: 2,
      title: "Inception",
      duration: "148 min",
      genre: "Sci-Fi",
      status: "Coming Soon",
    },
    {
      id: 3,
      title: "Interstellar",
      duration: "169 min",
      genre: "Adventure",
      status: "Now Showing",
    },
  ];
  const columnNames = ["Movie", "Duration", "Genre", "Status", "Actions"];
  const [movies, setMovies] = useState([]);
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
    return localStorage.getItem(Genres[0].value) || Genres[0].value;
  });

  const [defaultFilmStatus, setDefaultFilmStatus] = useState(() => {
    return localStorage.getItem(filmStatuses[0].value) || filmStatuses[0].value;
  });

  useEffect(() => {
    filterMovies();
  }, [defaultGenres, defaultFilmStatus]);

  const filterMovies = () => {
    let filtered = data;

    if (defaultGenres !== Genres[0].value) {
      filtered = filtered.filter((movie) => movie.genre === defaultGenres);
    }

    if (defaultFilmStatus !== filmStatuses[0].value) {
      filtered = filtered.filter((movie) => movie.status === defaultFilmStatus);
    }

    setMovies(filtered);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddMovie = (newMovie) => {
    setMovies([...movies, newMovie]);
  };

  return (
    <div className="w-[100%] h-[100vh]  bg-neutral-100  p-5 overflow-auto">
      <Header title={"Movie Management"} />
      <div>
        <div className="flex justify-between mb-6">
          <div className="flex gap-2">
            <Select
              options={Genres}
              defaultValue={defaultGenres}
              setDefault={setDefaultGenres}
            />
            <Select
              options={filmStatuses}
              defaultValue={defaultFilmStatus}
              setDefault={setDefaultFilmStatus}
            />
          </div>
          <button
            className="button flex items-center gap-1"
            onClick={() => setIsModalOpen(true)}
          >
            <FaPlus />
            Add movie
          </button>
        </div>
        <TableMovie columnNames={columnNames} movies={movies} />
      </div>
      <AddMovieModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddMovie={handleAddMovie}
      />
    </div>
  );
};

export default Movies;
