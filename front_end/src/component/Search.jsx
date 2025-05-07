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
  );
};

export default Search;
