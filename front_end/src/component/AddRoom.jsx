import { useEffect, useState } from "react";

const AddRoom = ({
  title,
  isOpen,
  onClose,
  onAddRoom,
  entry,
  infoRoom,
  setInfoRoom,
}) => {
  const [room, setRoom] = useState({
    roomName: "",
    cinema: "",
    capacity: "",
    type: "",
    id: Date.now(),
  });
  useEffect(() => {
    setRoom(infoRoom);
  }, [infoRoom]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddRoom(room);
    handleCloseWindow();
  };

  const handleCloseWindow = () => {
    onClose();
    setInfoRoom({
      roomName: "",
      cinema: "",
      capacity: "",
      type: "",
      id: Date.now(),
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoom({ ...room, [name]: value });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      onClick={() => onClose()}
    >
      <div
        className="bg-white p-6 rounded-xl shadow-xl w-96"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            autoFocus
            className="w-full border p-2 rounded"
            type="text"
            placeholder="Name room"
            required
            value={room.roomName}
            onChange={handleChange}
            name="roomName"
          />
          <input
            className="w-full border p-2 rounded"
            type="number"
            placeholder="Capacity"
            required
            value={room.capacity}
            onChange={handleChange}
            name="capacity"
          />
          <select
            value={room.cinema}
            className="w-full border p-2 rounded"
            onChange={handleChange}
            name="cinema"
            required
          >
            <option value="">--Chọn Cinema--</option>
            <option value="Cinema City Downtown">Cinema City Downtown</option>
            <option value="Megaplex Central">Megaplex Central</option>
            <option value="Star Cinema Mall">Star Cinema Mall</option>
            <option value="Luxury Cinemas">Luxury Cinemas</option>
            <option value="Downtown Cinemas">Downtown Cinemas</option>
            <option value="Galaxy Cineplex">Galaxy Cineplex</option>
            <option value="Cinema City North">Cinema City North</option>
          </select>
          <select
            value={room.type}
            required
            className="w-full border p-2 rounded"
            onChange={handleChange}
            name="type"
          >
            <option value="">--Chọn loại phòng--</option>
            <option value="Standard">Standard</option>
            <option value="Vip">Vip</option>
            <option value="IMAX">IMAX</option>
          </select>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-24 px-3 py-1 bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-24 px-3 py-1 bg-blue-600 text-white rounded"
            >
              {entry}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRoom;
