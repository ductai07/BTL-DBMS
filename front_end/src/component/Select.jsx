import React, { useState, useEffect, useRef } from "react";
import { IoChevronDown } from "react-icons/io5";

export const Select = ({
  // Support both new and old interfaces
  options = [],
  selected,
  setSelected,
  value,
  onChange,
  placeholder = "Select an option",
  size = "md", // sm, md, lg
  keyStorage,
  keySearch,
  queryRef,
  defaultValue,
  setDefault,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Define size classes
  const sizeClasses = {
    sm: "py-1 px-3 text-sm",
    md: "py-2 px-4 text-base",
    lg: "py-3 px-5 text-lg",
  };

  // Check if options are in old format (objects with key/value) or new format (simple values)
  const isOldFormat =
    options.length > 0 &&
    typeof options[0] === "object" &&
    options[0].hasOwnProperty("value");

  // Handle change for old interface
  const handleChangeOld = (option) => {
    if (onChange) {
      onChange(option.key);
    }

    if (setDefault) {
      setDefault(option.value);
    }

    // Handle localStorage if needed
    if (localStorage && keyStorage) {
      localStorage.setItem(keyStorage, option.value);
    }

    // Handle query ref if needed
    if (queryRef && keySearch) {
      if (option.key === "all" || option.key === "") {
        queryRef.current[keySearch] = "";
      } else {
        queryRef.current[keySearch] = option.key;
      }
      
      if (keySearch === "status") {
        queryRef.current.SearchKey = "status";
        queryRef.current.SearchValue = option.key; // Sửa: dùng option.key thay vì option.value
      }
    }

    setIsOpen(false);
  };

  // Handle change for new interface
  const handleChangeNew = (optionValue) => {
    if (setSelected) {
      setSelected(optionValue);
    }
    setIsOpen(false);
  };

  // For old interface, render a standard dropdown
  if (isOldFormat) {
    // Find the currently selected option based on value first, then defaultValue
    const currentOption =
      options.find((opt) => opt.key === value) ||
      options.find((opt) => opt.value === defaultValue) ||
      options[0];

    return (
      <div className="relative" ref={selectRef}>
        <button
          type="button"
          className={`flex items-center justify-between w-full rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${sizeClasses[size]}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <span className="truncate">
            {currentOption?.value || placeholder}
          </span>
          <IoChevronDown
            className={`ml-2 transition-transform duration-200 ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg max-h-60 overflow-auto">
            <ul className="py-1">
              {options.map((option, index) => (
                <li
                  key={index}
                  className={`cursor-pointer px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 ${
                    currentOption?.value === option.value
                      ? "bg-blue-50 text-blue-600"
                      : ""
                  }`}
                  onClick={() => handleChangeOld(option)}
                >
                  {option.value}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // For new interface, render new dropdown style
  return (
    <div className="relative" ref={selectRef}>
      <button
        type="button"
        className={`flex items-center justify-between w-full rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${sizeClasses[size]}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="truncate">{selected || placeholder}</span>
        <IoChevronDown
          className={`ml-2 transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg max-h-60 overflow-auto">
          <ul className="py-1">
            {options.map((option, index) => (
              <li
                key={index}
                className={`cursor-pointer px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 ${
                  selected === option ? "bg-blue-50 text-blue-600" : ""
                }`}
                onClick={() => handleChangeNew(option)}
              >
                {option}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Select;
