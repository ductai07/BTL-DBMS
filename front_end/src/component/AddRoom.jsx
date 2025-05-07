import { useEffect, useState } from "react";

const AddRoom = ({
  title,
  isOpen,
  onClose,
  onAddRoom,
  onEditRoom,
  entry,
  infoRoom,
  setInfoRoom,
}) => {
  const [room, setRoom] = useState({
    name: "",
    Cinema: {
      id: "",
      name: "",
      address: "",
    },
    seatCount: "",
    type: "",
    status: "", // ✅ Thêm trường status
    id: Date.now(),
  });

  useEffect(() => {
    setRoom(infoRoom);
  }, [infoRoom]);

  const handleSubmit = (e) => {
    e.preventDefault();
    entry === "Add" ? onAddRoom(room) : onEditRoom(room);
    handleCloseWindow();
  };

  const handleCloseWindow = () => {
    onClose();
    setInfoRoom({
      name: "",
      Cinema: {
        id: "",
        name: "",
        address: "",
      },
      seatCount: "",
      type: "",
      status: "", // ✅ Thêm lại trong reset state
      id: Date.now(),
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "Cinema") {
      const selectedCinema = cinemaOptions.find(
        (cinema) => cinema.name === value
      );
      setRoom((prevRoom) => ({
        ...prevRoom,
        Cinema: selectedCinema,
      }));
    } else {
      setRoom((prevRoom) => ({
        ...prevRoom,
        [name]: value,
      }));
    }
  };

  const cinemaOptions = [
    { id: 1, name: "Galaxy Nguyễn Du" },
    { id: 2, name: "BHD Star Vincom Thảo Điền" },
    { id: 3, name: "Star Cinema Mall" },
    { id: 4, name: "CGV Crescent Mall" },
  ];

  const roomTypeOptions = [
    { id: "standard", name: "Standard" },
    { id: "vip", name: "Vip" },
    { id: "imax", name: "IMAX" },
  ];

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
            value={room.name}
            onChange={handleChange}
            name="name"
          />
          <input
            className="w-full border p-2 rounded"
            type="number"
            placeholder="Capacity"
            required
            value={room.seatCount}
            onChange={handleChange}
            name="seatCount"
          />
          <select
            value={room.Cinema.name}
            className="w-full border p-2 rounded"
            onChange={handleChange}
            name="Cinema"
            required
          >
            <option value="">--Chọn Cinema--</option>
            {cinemaOptions.map((cinema) => (
              <option key={cinema.id} value={cinema.name}>
                {cinema.name}
              </option>
            ))}
          </select>

          <select
            value={room.type}
            required
            className="w-full border p-2 rounded"
            onChange={handleChange}
            name="type"
          >
            <option value="">--Chọn loại phòng--</option>
            {roomTypeOptions.map((type) => (
              <option key={type.id} value={type.name}>
                {type.name}
              </option>
            ))}
          </select>

          {/* ✅ Select cho status */}
          <select
            value={room.status}
            required
            className="w-full border p-2 rounded"
            onChange={handleChange}
            name="status"
          >
            <option value="">--Chọn trạng thái--</option>
            <option value="Hoạt động">Hoạt động</option>
            <option value="Inactive">Inactive</option>
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
