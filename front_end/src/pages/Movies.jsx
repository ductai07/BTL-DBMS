import { useState, useEffect } from "react";
import Header from "../component/Header";
import Search from "../component/Search";
import { FaPlus } from "react-icons/fa";
import TableMovie from "../component/TableMovie";
import AddMovieModal from "../component/AddMovieModal";

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 20,  // Display 20 movies per page
    total: 0
  });

  // Function to fetch movies
  const fetchMovies = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:3000/movie?Page=${pagination.currentPage}&Limit=${pagination.pageSize}`;
      
      // Add search parameter if search term exists
      if (search) {
        url += `&SearchKey=title&SearchValue=${encodeURIComponent(search)}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Format the data for our component
      const formattedMovies = (data.data || []).map(movie => ({
        id: movie.id,
        poster: movie.poster || "https://via.placeholder.com/300x450?text=No+Image",
        title: movie.title || "Không có tên",
        director: movie.director || "Chưa cập nhật",
        duration: movie.duration || 0,
        genre: movie.genre || "Chưa phân loại",
        releaseDate: formatDate(movie.releaseDate),
        status: movie.status || "Không xác định",
        // Keep original data for reference
        originalData: movie
      }));
      
      setMovies(formattedMovies);
      setFilteredMovies(formattedMovies);
      setPagination({
        currentPage: parseInt(data.pagination?.currentPage) || 1,
        totalPages: parseInt(data.pagination?.totalPages) || 1,
        pageSize: pagination.pageSize,
        total: parseInt(data.pagination?.total) || 0
      });
      setError(null);
    } catch (err) {
      console.error("Error fetching movies:", err);
      setError("Không thể tải dữ liệu phim. Vui lòng thử lại sau.");
      setMovies([]);
      setFilteredMovies([]);
    } finally {
      setLoading(false);
    }
  };

  // Format date function (YYYY-MM-DD to DD/MM/YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  // Initial data load
  useEffect(() => {
    fetchMovies();
  }, [pagination.currentPage]);

  // Handle search with debounce
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      // When search changes, reset to page 1 and fetch
      setPagination(prev => ({ ...prev, currentPage: 1 }));
      fetchMovies();
    }, 500);
    
    return () => clearTimeout(delaySearch);
  }, [search]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages || newPage === pagination.currentPage) {
      return;
    }
    
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
    
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle adding a new movie
  const handleAddMovie = async (movieData) => {
    try {
      setLoading(true);
      const formData = new FormData();
      
      // Add all movie data to formData
      for (const key in movieData) {
        if (key !== 'posterFile' && key !== 'id') {
          formData.append(key, movieData[key] !== null ? movieData[key] : '');
        }
      }
      
      // Add poster file if exists
      if (movieData.posterFile) {
        formData.append('poster', movieData.posterFile);
      }

      const url = movieData.id
        ? `http://localhost:3000/movie/edit/${movieData.id}`
        : 'http://localhost:3000/movie/add';
      
      const method = movieData.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      // Re-fetch movies
      fetchMovies();
      setIsModalOpen(false);
      setEditingMovie(null);
      alert(movieData.id ? "Cập nhật phim thành công!" : "Thêm phim thành công!");
    } catch (err) {
      console.error("Error saving movie:", err);
      alert(`Không thể lưu phim: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a movie
  const handleDeleteMovie = async (movieId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phim này không?")) {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/movie/delete/${movieId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        // Re-fetch movies
        fetchMovies();
        alert("Xóa phim thành công!");
      } catch (err) {
        console.error("Error deleting movie:", err);
        alert(`Không thể xóa phim: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle editing a movie
  const handleEditMovie = (movie) => {
    setEditingMovie(movie);
    setIsModalOpen(true);
  };

  // Handle refreshing the data
  const handleRefresh = () => {
    fetchMovies();
  };

  // Generate page numbers for pagination
  const renderPaginationNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (pagination.totalPages <= maxVisiblePages) {
      // Show all pages if there aren't many
      for (let i = 1; i <= pagination.totalPages; i++) {
        pages.push(renderPageButton(i));
      }
    } else {
      // Always show first page
      pages.push(renderPageButton(1));
      
      // Show dots if not starting from page 2
      if (pagination.currentPage > 3) {
        pages.push(<span key="dots-1" className="px-2">...</span>);
      }
      
      // Calculate start and end of middle section
      const start = Math.max(2, pagination.currentPage - 1);
      const end = Math.min(pagination.totalPages - 1, pagination.currentPage + 1);
      
      // Show middle pages
      for (let i = start; i <= end; i++) {
        pages.push(renderPageButton(i));
      }
      
      // Show dots if not ending at second-to-last page
      if (pagination.currentPage < pagination.totalPages - 2) {
        pages.push(<span key="dots-2" className="px-2">...</span>);
      }
      
      // Always show last page
      pages.push(renderPageButton(pagination.totalPages));
    }
    
    return pages;
  };
  
  // Render a single page button
  const renderPageButton = (pageNumber) => (
    <button
      key={pageNumber}
      onClick={() => handlePageChange(pageNumber)}
      className={`w-8 h-8 flex items-center justify-center rounded mx-1 ${
        pagination.currentPage === pageNumber
          ? 'bg-blue-600 text-white'
          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
      }`}
    >
      {pageNumber}
    </button>
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Header title="Quản lý phim" />
      
      {/* Controls */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex gap-4 items-center">
          <Search 
            placeholder="Tìm kiếm phim..." 
            setSearch={setSearch}
            search={search}
          />
          
          <button 
            onClick={handleRefresh} 
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-clockwise" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/>
              <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"/>
            </svg>
            Làm mới
          </button>
        </div>
        
        <button
          onClick={() => {
            setEditingMovie(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FaPlus /> Thêm phim
        </button>
      </div>
      
      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500">Đang tải dữ liệu...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Lỗi! </strong>
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={handleRefresh}
            className="bg-red-200 hover:bg-red-300 text-red-800 px-3 py-1 rounded mt-2"
          >
            Thử lại
          </button>
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="bg-white p-8 rounded-lg text-center shadow-sm">
          <p className="text-gray-500 mb-4">Không tìm thấy phim nào.</p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-lg transition-colors"
            >
              Xóa tìm kiếm
            </button>
          )}
        </div>
      ) : (
        <>
          <TableMovie
            columnNames={["Tên phim", "Thời lượng", "Thể loại", "Trạng thái", "Thao tác"]}
            movies={filteredMovies}
            setOpen={setIsModalOpen}
            setInfoFilm={setEditingMovie}
            changeEntry={() => {}} 
            handleDelete={handleDeleteMovie}
          />
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className={`px-3 py-1 rounded ${pagination.currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                >
                  Trước
                </button>
                
                <div className="flex items-center">
                  {renderPaginationNumbers()}
                </div>
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className={`px-3 py-1 rounded ${pagination.currentPage === pagination.totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                >
                  Tiếp
                </button>
              </div>
            </div>
          )}
        </>
      )}
      
      <div className="mt-4 text-center text-sm text-gray-500">
        {!loading && !error && pagination.total > 0 && (
          <p>Hiển thị {filteredMovies.length} trên tổng số {pagination.total} phim</p>
        )}
      </div>
      
      {/* Movie Modal */}
      <AddMovieModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMovie(null);
        }}
        onSave={handleAddMovie}
        movie={editingMovie}
      />
    </div>
  );
};

export default Movies;
