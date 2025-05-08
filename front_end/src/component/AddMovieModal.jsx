import React, { useEffect, useState } from "react";

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
    id: Date.now(),
    title: "",
    genre: "",
    duration: "",
    releaseDate: "",
    poster: "",
    trailer: "",
    description: "",
    ageRating: "",
    status: "",
    director: "",
    mainActor: "",
    language: "",
  });

  useEffect(() => {
    setMovie(
      info || {
        id: Date.now(),
        title: "",
        genre: "",
        duration: "",
        releaseDate: "",
        poster: "",
        trailer: "",
        description: "",
        ageRating: "",
        status: "",
        director: "",
        mainActor: "",
        language: "",
      }
    );
  }, [info]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMovie((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    Entry === "Add" ? onAddMovie(movie) : onUpdateMovie(movie);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    onClose();
    setInfo({});
    setMovie({
      id: Date.now(),
      title: "",
      genre: "",
      duration: "",
      releaseDate: "",
      poster: "",
      trailer: "",
      description: "",
      ageRating: "",
      status: "",
      director: "",
      mainActor: "",
      language: "",
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      onClick={resetForm}
    >
      <div
        className="bg-white p-6 rounded-xl shadow-xl w-[600px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">{title}</h2>
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
            type="date"
            name="releaseDate"
            value={movie.releaseDate}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            name="poster"
            placeholder="Poster URL"
            value={movie.poster}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            name="trailer"
            placeholder="Trailer URL"
            value={movie.trailer}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={movie.description}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            rows={3}
          />
          <input
            type="text"
            name="ageRating"
            placeholder="Age Rating (e.g. PG-13)"
            value={movie.ageRating}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            name="director"
            placeholder="Director"
            value={movie.director}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            name="mainActor"
            placeholder="Main Actor"
            value={movie.mainActor}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            name="language"
            placeholder="Language"
            value={movie.language}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <select
            name="genre"
            value={movie.genre}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">-- Chọn thể loại --</option>
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
            <option value="">-- Chọn trạng thái --</option>
            <option value="Đang chiếu">Đang chiếu</option>
            <option value="Sắp chiếu">Sắp chiếu</option>
            <option value="Stopped Showing">Ngừng chiếu</option>
          </select>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={resetForm}
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
