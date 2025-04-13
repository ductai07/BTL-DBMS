const Select = ({ options, defaultValue, setDefault, keyStorage }) => {
  const handleChange = (e) => {
    console.log(e.target.value);
    setDefault(e.target.value);
    localStorage.setItem(keyStorage, e.target.value);
    console.log("locl", localStorage.getItem(keyStorage));
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
        <option className="flex items-center" key={opt.key} value={opt.value}>
          {opt.value}
        </option>
      ))}
    </select>
  );
};

export default Select;
