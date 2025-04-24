const Search = ({ placeholder }) => {
  return (
    <input
      className="h-7 w-44 rounded-md border border-solid border-gray-400 text-sm font-medium px-2"
      type="text"
      placeholder={placeholder}
    />
  );
};

export default Search;
