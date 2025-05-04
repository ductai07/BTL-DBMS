const Search = ({ placeholder, setSearch, search }) => {
  return (
    <input
      className="h-7 w-44 rounded-md border border-solid border-gray-400 text-sm font-medium px-2"
      type="text"
      onChange={(e) => setSearch(e.target.value)}
      value={search}
      placeholder={placeholder}
    />
  );
};

export default Search;
