const Select = ({ options, defaultValue, setDefault, keyStorage, queryRef, keySearch }) => {
  const handleChange = (e) => {
    const selectedValue = e.target.value;
    setDefault(selectedValue);
    
    // Store selection in localStorage if key is provided
    if (keyStorage) {
      localStorage.setItem(keyStorage, selectedValue);
    }
    
    // Update query parameters if needed
    if (queryRef && keySearch) {
      // Find the selected option to get its key
      const selectedOption = options.find(opt => opt.value === selectedValue);
      queryRef.current[keySearch] = selectedOption ? selectedOption.key : '';
    }
  };
  
  return (
    <select
      className="h-10 w-44 rounded-md border border-solid border-gray-300 text-sm font-medium px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      value={defaultValue}
      onChange={handleChange}
    >
      {options.map((opt) => (
        <option className="flex items-center" key={opt.key} value={opt.value}>
          {opt.value}
        </option>
      ))}
    </select>
  );
};

export default Select;
