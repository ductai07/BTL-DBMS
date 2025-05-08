<<<<<<< HEAD
import { FaSearch } from "react-icons/fa";

const Search = ({ placeholder, setSearch, search, queryRef, keySearch = "title" }) => {
  const handleChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (queryRef) {
      queryRef.current.SearchKey = keySearch;
      queryRef.current.SearchValue = value;
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FaSearch className="h-4 w-4 text-gray-400" />
      </div>
      <input
        className="h-10 w-64 rounded-md border border-solid border-gray-300 text-sm font-medium pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        type="text"
        onChange={handleChange}
        value={search}
        placeholder={placeholder}
      />
    </div>
=======
const Search = ({ placeholder, setSearch, search, keySearch, queryRef }) => {
  const handleChange = (e) => {
    setSearch(e.target.value);
    queryRef.current.SearchKey = keySearch;
    queryRef.current.SearchValue = e.target.value;
  };
  return (
    <input
      className="h-7 w-44 rounded-md border border-solid border-gray-400 text-sm font-medium px-2"
      type="text"
      onChange={(e) => handleChange(e)}
      value={search}
      placeholder={placeholder}
    />
>>>>>>> 626958eeea26f3e633d93420202198f4651be05c
  );
};

export default Search;
