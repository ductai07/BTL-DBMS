import { FaEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";

const TableMovie = ({
  columnNames,
  movies,
  setOpen,
  setInfoFilm,
  changeEntry,
  handleDelete,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
      <table className="w-full text-left">
        <thead>
          <tr className="text-sm text-gray-500 border-b">
            {columnNames.map((col) => (
              <th key={col} className="py-2">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {movies.map((movie) => (
            <tr
              key={movie.id}
              className="border-b text-sm text-gray-700 hover:bg-gray-50"
            >
              <td className="py-3">{movie.title}</td>
              <td>{movie.duration}</td>
              <td>{movie.genre}</td>
              <td>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    movie.status === "Now Showing"
                      ? "bg-gray-200  text-green-600"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {movie.status}
                </span>
              </td>
              <td>
                <span className="flex gap-2">
                  <span
                    className="hover:cursor-pointer"
                    onClick={() => {
                      setOpen(true);
                      changeEntry(["Edit movie", "Edit"]);
                      setInfoFilm(movie);
                    }}
                  >
                    <FaEdit />
                  </span>
                  <span
                    className="hover:cursor-pointer"
                    onClick={() => handleDelete(movie.id)}
                  >
                    <MdDeleteForever size={16} />
                  </span>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableMovie;
