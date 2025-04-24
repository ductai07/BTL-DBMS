import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Showtime = () => {
  const [selectedDate, setSelectedDate] = useState(new Date("2024-04-10"));

  const handleClear = () => {
    setSelectedDate(null);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <div className="p-4">
      <DatePicker
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        inline
        highlightDates={[new Date("2024-04-10")]}
        openToDate={new Date("2024-04-10")}
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
      />

      <div className="mt-4 flex justify-between">
        <button onClick={handleClear} className="text-blue-600 hover:underline">
          Clear
        </button>

        <button onClick={handleToday} className="text-blue-600 hover:underline">
          Today
        </button>
      </div>
    </div>
  );
};

export default Showtime;
