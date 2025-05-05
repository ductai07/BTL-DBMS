import React, { useState } from "react";

const AddShowTimeModal = ({
  onClose,
  onSave,
  entry,
  formData,
  setFormData,
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[500px] shadow-lg">
        <h2 className="text-lg font-bold mb-4">{entry.current.title}</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tên phim</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              placeholder="Ví dụ: Avengers: Endgame"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Phòng chiếu
            </label>
            <select
              name="room"
              value={formData.room}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Chọn phòng</option>
              <option value="Phòng 1">Phòng 1</option>
              <option value="Phòng 2">Phòng 2</option>
              <option value="Phòng 3">Phòng 3</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ngày chiếu</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Giờ bắt đầu
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Giờ kết thúc
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Trạng thái</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="Sắp chiếu">Sắp chiếu</option>
              <option value="Đang chiếu">Đang chiếu</option>
              <option value="Đã chiếu">Đã chiếu</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tổng số vé</label>
            <input
              type="number"
              name="totalTickets"
              value={formData.totalTickets}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              min={0}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleSubmit}
          >
            {entry.current.action}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddShowTimeModal;
