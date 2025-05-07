// AddMovieModal.jsx
import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { FaUpload } from "react-icons/fa";

export default function AddMovieModal({
  title,
  isOpen,
  onClose,
  // Accept both naming conventions to ensure backward compatibility
  onAddMovie,
  onSave,
  Entry = "Add",
  info,
  movie, // Accept movie prop
  setInfo,
}) {
  // Use either movie or info prop, with movie taking precedence
  const initialData = movie || info;
  
  const [movieData, setMovieData] = useState({
    title: "",
    duration: "",
    genre: "",
    status: "",
    director: "",
    releaseDate: "",
    poster: "",
    trailer: "",
    description: "",
    ageRating: "",
    mainActor: "",
    language: "",
    id: Date.now(),
    posterFile: null, // New field for the actual file object
  });
  const [posterPreview, setPosterPreview] = useState(null);

  useEffect(() => {
    if (initialData && isOpen) {
      setMovieData({
        ...initialData,
        releaseDate: initialData.releaseDate ? formatDateForInput(initialData.releaseDate) : "",
        posterFile: null
      });
      // Set preview if a poster URL exists
      if (initialData.poster) {
        setPosterPreview(initialData.poster);
      } else {
        setPosterPreview(null);
      }
    } else if (!isOpen) {
      setPosterPreview(null);
    }
  }, [initialData, isOpen]);

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      // Handle both date objects and strings
      const date = typeof dateString === 'object' 
        ? dateString 
        : new Date(dateString);
      
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMovieData({ ...movieData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Store the file in state
      setMovieData({ ...movieData, posterFile: file });
      
      // Create and set preview URL
      const previewUrl = URL.createObjectURL(file);
      setPosterPreview(previewUrl);
      
      // Clear the URL input since we're using a file now
      setMovieData(prev => ({ ...prev, poster: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Use either onSave or onAddMovie function
    const saveFunction = onSave || onAddMovie;
    if (saveFunction) {
      saveFunction(movieData);
    }
    resetForm();
  };

  const resetForm = () => {
    setMovieData({
      title: "",
      duration: "",
      genre: "",
      status: "",
      director: "",
      releaseDate: "",
      poster: "",
      trailer: "",
      description: "",
      ageRating: "",
      mainActor: "",
      language: "",
      id: Date.now(),
      posterFile: null,
    });
    setPosterPreview(null);
  };

  const closeWindow = () => {
    // Only call setInfo if it exists
    if (setInfo) {
      setInfo({
        title: "",
        duration: "",
        genre: "",
        status: "",
        director: "",
        releaseDate: "",
        poster: "",
        trailer: "",
        description: "",
        ageRating: "",
        mainActor: "",
        language: "",
        id: "",
        posterFile: null,
      });
    }
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 overflow-y-auto"
      onClick={closeWindow}
    >
      <div
        className="bg-white p-6 rounded-xl shadow-xl w-[600px] max-h-[90vh] overflow-y-auto my-8"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={closeWindow} className="text-gray-500 hover:text-gray-700">
            <IoClose size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề phim
              </label>
              <input
                autoFocus
                type="text"
                name="title"
                placeholder="Nhập tiêu đề phim"
                value={movieData.title || ""}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời lượng (phút)
              </label>
              <input
                type="number"
                name="duration"
                placeholder="VD: 120"
                value={movieData.duration || ""}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                min="1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày công chiếu
              </label>
              <input
                type="date"
                name="releaseDate"
                value={movieData.releaseDate || ""}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thể loại
              </label>
              <select
                name="genre"
                value={movieData.genre || ""}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <option value="Animation">Animation</option>
                <option value="Adventure">Adventure</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Thriller">Thriller</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                name="status"
                value={movieData.status || ""}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">-- Chọn trạng thái--</option>
                <option>Now Showing</option>
                <option>Coming Soon</option>
                <option>Ended</option>
              </select>
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đạo diễn
              </label>
              <input
                type="text"
                name="director"
                placeholder="Nhập tên đạo diễn"
                value={movieData.director || ""}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diễn viên chính
              </label>
              <input
                type="text"
                name="mainActor"
                placeholder="Nhập tên diễn viên chính"
                value={movieData.mainActor || ""}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngôn ngữ
              </label>
              <input
                type="text"
                name="language"
                placeholder="VD: Tiếng Anh, Tiếng Việt"
                value={movieData.language || ""}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giới hạn tuổi
              </label>
              <select
                name="ageRating"
                value={movieData.ageRating || ""}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Chọn giới hạn tuổi --</option>
                <option value="P">P - Phim dành cho mọi đối tượng</option>
                <option value="C13">C13 - Phim cấm khán giả dưới 13 tuổi</option>
                <option value="C16">C16 - Phim cấm khán giả dưới 16 tuổi</option>
                <option value="C18">C18 - Phim cấm khán giả dưới 18 tuổi</option>
              </select>
            </div>
          </div>
          
          {/* Poster Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Poster Phim
            </label>
            
            <div className="grid grid-cols-2 gap-4">
              {/* File Upload */}
              <div>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FaUpload className="w-8 h-8 text-gray-500 mb-1" />
                    <p className="text-xs text-gray-500">Tải lên hình ảnh</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="mt-1 text-xs text-gray-500">Định dạng: JPG, PNG. Kích thước tối đa: 2MB</p>
              </div>
              
              {/* URL Input and Preview */}
              <div>
                {posterPreview ? (
                  <div className="h-32 relative">
                    <img 
                      src={posterPreview} 
                      alt="Preview" 
                      className="h-full w-full object-contain rounded border"
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        setPosterPreview(null);
                        setMovieData({...movieData, poster: "", posterFile: null});
                      }}
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm"
                    >
                      <IoClose size={16} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      name="poster"
                      placeholder="Hoặc nhập URL hình ảnh"
                      value={movieData.poster || ""}
                      onChange={handleChange}
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL Trailer
            </label>
            <input
              type="text"
              name="trailer"
              placeholder="Nhập đường dẫn trailer (Youtube)"
              value={movieData.trailer || ""}
              onChange={handleChange}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả phim
            </label>
            <textarea
              name="description"
              placeholder="Nhập mô tả phim"
              value={movieData.description || ""}
              onChange={handleChange}
              rows="3"
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeWindow}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {Entry}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
