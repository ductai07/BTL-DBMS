// AddMovieModal.jsx
import React, { useEffect, useRef, useState } from "react";

export default function AddMovieModal({
  title,
  isOpen,
  onClose,
  onAddMovie,
  onUpdateMovie,
  Entry = "Add",
  info,
  setInfo,
}) {
  const [movie, setMovie] = useState({
    title: "",
    duration: "",
    genre: "",
    status: "",
    id: Date.now(),
  });

  useEffect(() => {
    setMovie(info);
  }, [info]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setMovie({ ...movie, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    Entry === "Add" ? onAddMovie(movie) : onUpdateMovie(movie);
    setMovie({
      title: "",
      duration: "",
      genre: "",
      status: "",
      id: Date.now(),
    });
    closeWindow();
  };
  const closeWindow = () => {
    setInfo({
      title: "",
      duration: "",
      genre: "",
      status: "",
      id: Date.now(),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      onClick={() => {
        closeWindow();
      }}
    >
      <div
        className="bg-white p-6 rounded-xl shadow-xl w-96"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            autoFocus
            type="text"
            name="title"
            placeholder="Title"
            value={movie.title}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="number"
            name="duration"
            placeholder="Duration (min)"
            value={movie.duration}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />

          <select
            name="genre"
            value={movie.genre}
            className="w-full border p-2 rounded"
            onChange={handleChange}
            required
          >
            <option value="">-- Chọn thể loại--</option>
            <option value="Action">Action</option>
            <option value="Comedy">Comedy</option>
            <option value="Drama">Drama</option>
            <option value="Sci-Fi">Sci-Fi</option>
            <option value="Horror">Horror</option>
            <option value="Romance">Romance</option>
            <option value="Documentary">Documentary</option>
          </select>
          <select
            name="status"
            value={movie.status}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">-- Chọn trạng thái--</option>
            <option value="Đang chiếu">Đang chiếu</option>
            <option value="Sắp chiếu">Sắp chiếu</option>
            <option value="Stopped Showing">Ngừng chiếu</option>
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
              {Entry}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
