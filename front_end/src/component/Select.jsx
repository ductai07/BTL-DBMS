const Select = ({ options }) => {
  return (
    <select className="h-7 w-44 rounded-md border border-solid border-gray-400 text-sm font-medium px-2">
      {options.map((opt) => (
        <option className="flex items-center" key={opt.key} value={opt.key}>
          {opt.value}
        </option>
      ))}
    </select>
  );
};

export default Select;
