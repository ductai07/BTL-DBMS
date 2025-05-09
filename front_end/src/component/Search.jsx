import { FaSearch } from "react-icons/fa";
import { useEffect, useState } from "react";

const Search = ({ placeholder, setSearch, search, queryRef, keySearch = "title" }) => {
  const [localSearch, setLocalSearch] = useState(search || "");
  
  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(localSearch);
    }, 500); // 500ms delay
    
    return () => clearTimeout(timer);
  }, [localSearch, setSearch]);
  
  const handleChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
    
    // Update query ref if available
    if (queryRef && queryRef.current) {
      if (value.trim() === "") {
        // Clear search parameters if empty
        queryRef.current.SearchKey = "";
        queryRef.current.SearchValue = "";
      } else {
        // Set search parameters
        queryRef.current.SearchKey = keySearch;
        queryRef.current.SearchValue = value;
      }
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
        value={localSearch}
        placeholder={placeholder}
      />
    </div>
  );
};

export default Search;
