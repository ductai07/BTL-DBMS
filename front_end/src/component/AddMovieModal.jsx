// AddMovieModal.jsx
import React, { useState } from "react";

export default function AddMovieModal({ isOpen, onClose, onAddMovie }) {
  const [movie, setMovie] = useState({
    title: "",
    duration: "",
    genre: "",
    status: "Now Showing",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMovie({ ...movie, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddMovie(movie);
    setMovie({ title: "", duration: "", genre: "", status: "Now Showing" });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-96">
        <h2 className="text-xl font-bold mb-4">Add New Movie</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
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
          <input
            type="text"
            name="genre"
            placeholder="Genre"
            value={movie.genre}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
          <select
            name="status"
            value={movie.status}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option>Now Showing</option>
            <option>Coming Soon</option>
          </select>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
