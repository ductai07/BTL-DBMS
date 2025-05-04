const Schedule = ({ date, setDate }) => {
  return (
    <div>
      <input
        className="h-7 w-44 rounded-md border border-solid border-gray-400 text-sm font-medium px-2 hover:cursor-pointer"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
    </div>
  );
};

export default Schedule;
