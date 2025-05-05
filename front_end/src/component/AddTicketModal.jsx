import { useEffect } from "react";
import { IoClose } from "react-icons/io5";

const AddTicketModal = ({
  title,
  isOpen,
  onClose,
  onAddTicket,
  info,
  setInfo,
  Entry,
}) => {
  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setInfo({
        movieTitle: "",
        roomName: "",
        seatNumber: "",
        showDate: "",
        showTime: "",
        price: "",
        status: "",
        id: Date.now(),
      });
    }
  }, [isOpen, setInfo]);

  const handleChange = (e) => {
    setInfo({ ...info, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddTicket({
      ...info,
      id: info.id || Date.now(),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-[500px] max-w-[95%]">
        <div className="flex justify-between items-center border-b px-5 py-3">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoClose size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Movie
              </label>
              <select
                name="movieTitle"
                value={info.movieTitle}
                onChange={handleChange}
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="">Select Movie</option>
                <option value="The Dark Knight">The Dark Knight</option>
                <option value="Inception">Inception</option>
                <option value="Interstellar">Interstellar</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Room
              </label>
              <select
                name="roomName"
                value={info.roomName}
                onChange={handleChange}
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="">Select Room</option>
                <option value="Room A1">Room A1</option>
                <option value="Room A2">Room A2</option>
                <option value="Room B1">Room B1</option>
                <option value="Room B2">Room B2</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Seat
              </label>
              <input
                type="text"
                name="seatNumber"
                value={info.seatNumber}
                onChange={handleChange}
                placeholder="e.g. A12"
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Date
              </label>
              <input
                type="date"
                name="showDate"
                value={info.showDate}
                onChange={handleChange}
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Time
              </label>
              <input
                type="time"
                name="showTime"
                value={info.showTime}
                onChange={handleChange}
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Price (VND)
              </label>
              <input
                type="number"
                name="price"
                value={info.price}
                onChange={handleChange}
                placeholder="e.g. 120000"
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Status
              </label>
              <select
                name="status"
                value={info.status}
                onChange={handleChange}
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="">Select Status</option>
                <option value="Booked">Booked</option>
                <option value="Paid">Paid</option>
                <option value="Canceled">Canceled</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              {Entry}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTicketModal;
