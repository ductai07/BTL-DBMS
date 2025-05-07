const Select = ({
  options,
  defaultValue,
  setDefault,
  keyStorage,
  queryRef,
  keySearch,
  // cinemaId,
}) => {
  const handleChange = (e) => {
    setDefault(e.target.value);
    // localStorage.setItem(keyStorage, e.target.value);
    if (e.target.value === "Tất cả" || e.target.value === "All") {
      queryRef.current.SearchKey = keySearch;
      queryRef.current.SearchValue = "";
    } else if (keySearch !== "cinemaId") {
      queryRef.current.SearchKey = keySearch;
      queryRef.current.SearchValue = e.target.value;
    } else {
      const selectedIndex = e.target.selectedIndex;
      const selectedOption = e.target.options[selectedIndex];
      const id = selectedOption.dataset.key;
      queryRef.current.cinemaId = id;
    }
  };
  return (
    <select
      className="h-7 w-44 rounded-md border border-solid border-gray-400 text-sm font-medium px-2"
      value={defaultValue}
      onChange={(e) => {
        handleChange(e);
      }}
    >
      {options.map((opt) => (
        <option
          className="flex items-center"
          data-key={opt.key}
          key={opt.key}
          value={opt.value}
        >
          {opt.value}
        </option>
      ))}
    </select>
  );
};

export default Select;
