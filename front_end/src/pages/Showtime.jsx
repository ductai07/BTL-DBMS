import { useState, useEffect, useRef } from "react";
import Header from "../component/Header";
import Select from "../component/Select";
import { FaPlus } from "react-icons/fa";
import TabelShowTime from "../component/TabelShowTime";
import AddShowTimeModal from "../component/AddShowTimeModal";

const Showtime = () => {
  const [showtimes, setShowtimes] = useState([]);
  const [filteredShowtimes, setFilteredShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [infoShowTime, setInfoShowTime] = useState({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 5,
    total: 0,
  });

  // Filters
  const [movieFilter, setMovieFilter] = useState("all");
  const [cinemaFilter, setCinemaFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Options for filters
  const [movieOptions, setMovieOptions] = useState([
    { key: "all", value: "Tất cả phim" },
  ]);
  const [cinemaOptions, setCinemaOptions] = useState([
    { key: "all", value: "Tất cả rạp" },
  ]);
  const [dateOptions, setDateOptions] = useState([
    { key: "all", value: "Tất cả ngày" },
  ]);

  const statusOptions = [
    { key: "all", value: "Tất cả trạng thái" },
    { key: "Đang chiếu", value: "Đang chiếu" },
    { key: "Sắp chiếu", value: "Sắp chiếu" },
    { key: "Đã chiếu", value: "Đã chiếu" },
  ];

  // Fetch showtimes from the API with improved error handling
  const fetchShowtimes = async () => {
    setLoading(true);
    try {
      // Build URL with filters
      let url = `http://localhost:3000/showtime?Page=${pagination.currentPage}&Limit=${pagination.pageSize}`;

      if (queryRef.current.movieId !== "all") {
        url += `&movie_id=${queryRef.current.movieId}`;
      } else {
        url += `&movie_id=${""}`;
      }

      if (queryRef.current.cinemaId !== "all") {
        url += `&cinema_id=${queryRef.current.cinemaId}`;
      } else {
        url += `&cinema_id=${""}`;
      }

      if (dateFilter !== "all") {
        url += `&date=${dateFilter}`;
      } else {
        url += `&date=${""}`;
      }
      if (queryRef.current.SearchKey !== "all") {
        url += `&SearchKey=${queryRef.current.SearchKey}`;
        url += `&SearchValue=${queryRef.current.SearchValue}`;
      } else {
        url += `&${queryRef.current.SearchKey}=${""}`;
      }
      console.log("Fetching showtimes from:", url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Showtime data received:", data);

      if (!data || !Array.isArray(data.data)) {
        console.error("Invalid showtime data format:", data);
        throw new Error("Invalid data format received from server");
      }

      // Use the data as received from the backend
      setShowtimes(data.data);
      setFilteredShowtimes(data.data);
      setPagination({
        currentPage: data.pagination?.currentPage || 1,
        totalPages: data.pagination?.totalPages || 1,
        pageSize: pagination.pageSize,
        total: data.pagination?.total || 0,
      });

      setError(null);
    } catch (err) {
      console.error("Error fetching showtimes:", err);
      setError("Không thể tải dữ liệu lịch chiếu. Vui lòng thử lại sau.");

      // Fallback to simple API if main API fails
      try {
        console.log("Attempting fallback to simple API...");
        const simpleUrl = `http://localhost:3000/showtime/simple?Page=${pagination.currentPage}&Limit=${pagination.pageSize}`;
        const simpleResponse = await fetch(simpleUrl);

        if (!simpleResponse.ok) {
          throw new Error(`HTTP error! status: ${simpleResponse.status}`);
        }

        const simpleData = await simpleResponse.json();
        console.log("Simple API data received:", simpleData);

        if (simpleData && Array.isArray(simpleData.data)) {
          setShowtimes(simpleData.data);
          setFilteredShowtimes(simpleData.data);
          setPagination({
            currentPage: simpleData.pagination?.currentPage || 1,
            totalPages: simpleData.pagination?.totalPages || 1,
            pageSize: pagination.pageSize,
            total: simpleData.pagination?.total || 0,
          });

          // Update error message to indicate we're using fallback data
          setError("Sử dụng dữ liệu đơn giản do lỗi khi tải dữ liệu đầy đủ.");
        } else {
          throw new Error("Invalid data format from simple API");
        }
      } catch (fallbackErr) {
        console.error("Fallback fetch also failed:", fallbackErr);
        setShowtimes([]);
        setFilteredShowtimes([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load filter options with improved error handling
  const loadFilterOptions = async () => {
    try {
      // Load movies
      try {
        const moviesResponse = await fetch("http://localhost:3000/movie");
        if (moviesResponse.ok) {
          const moviesData = await moviesResponse.json();
          if (moviesData && Array.isArray(moviesData.data)) {
            setMovieOptions([
              { key: "all", value: "Tất cả phim" },
              ...(moviesData.data || []).map((movie) => ({
                key: movie.id.toString(),
                value: movie.title || `Phim #${movie.id}`,
              })),
            ]);
          }
        }
      } catch (movieErr) {
        console.error("Error loading movies:", movieErr);
      }

      // Load cinemas
      try {
        const cinemasResponse = await fetch("http://localhost:3000/cinema");
        if (cinemasResponse.ok) {
          const cinemasData = await cinemasResponse.json();
          if (cinemasData && Array.isArray(cinemasData.data)) {
            setCinemaOptions([
              { key: "all", value: "Tất cả rạp" },
              ...(cinemasData.data || []).map((cinema) => ({
                key: cinema.id.toString(),
                value: cinema.name || `Rạp #${cinema.id}`,
              })),
            ]);
          }
        }
      } catch (cinemaErr) {
        console.error("Error loading cinemas:", cinemaErr);
      }

      // Load showtime dates
      try {
        const datesResponse = await fetch(
          "http://localhost:3000/showtime/dates"
        );
        if (datesResponse.ok) {
          const datesData = await datesResponse.json();
          if (datesData && Array.isArray(datesData.data)) {
            setDateOptions([
              { key: "all", value: "Tất cả ngày" },
              ...(datesData.data || []).map((date) => ({
                key: date,
                value: formatDate(date),
              })),
            ]);
          }
        }
      } catch (dateErr) {
        console.error("Error loading dates:", dateErr);
      }
    } catch (err) {
      console.error("Error loading filter options:", err);
    }
  };

  // Format date (YYYY-MM-DD to DD/MM/YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const parts = dateString.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  };

  // Initial data load
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Fetch showtimes when filters or pagination changes
  useEffect(() => {
    fetchShowtimes();
  }, [
    pagination.currentPage,
    movieFilter,
    cinemaFilter,
    dateFilter,
    statusFilter,
  ]);

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    // Reset to page 1 when filters change
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }));

    switch (filterName) {
      case "movie":
        setMovieFilter(value);
        break;
      case "cinema":
        setCinemaFilter(value);
        break;
      case "date":
        setDateFilter(value);
        break;
      case "status":
        setStatusFilter(value);
        break;
      default:
        break;
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: newPage,
    }));
  };

  // Handle showtime deletion
  const handleDelete = async (showtimeId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa lịch chiếu này không?")) {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:3000/showtime/delete/${showtimeId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        // Re-fetch showtimes
        fetchShowtimes();
        alert("Xóa lịch chiếu thành công!");
      } catch (err) {
        console.error("Error deleting showtime:", err);
        alert(`Không thể xóa lịch chiếu: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle adding or editing a showtime
  const handleAddShowtime = async (showtimeData) => {
    try {
      setLoading(true);

      // Validate form data
      if (!showtimeData.movieId) {
        throw new Error("Vui lòng chọn phim");
      }
      if (!showtimeData.roomId) {
        throw new Error("Vui lòng chọn phòng chiếu");
      }
      if (!showtimeData.showDate) {
        throw new Error("Vui lòng chọn ngày chiếu");
      }
      if (!showtimeData.startTime) {
        throw new Error("Vui lòng chọn giờ bắt đầu");
      }
      if (!showtimeData.price) {
        throw new Error("Vui lòng nhập giá vé");
      }

      let response;

      if (showtimeData.id) {
        // Edit existing showtime
        response = await fetch(
          `http://localhost:3000/showtime/edit/${showtimeData.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              movie_id: showtimeData.movieId,
              room_id: showtimeData.roomId,
              showDate: showtimeData.showDate,
              startTime: showtimeData.startTime,
              price: showtimeData.price,
              status: showtimeData.status,
            }),
          }
        );
      } else {
        // Add new showtime
        response = await fetch("http://localhost:3000/showtime/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            movie_id: showtimeData.movieId,
            room_id: showtimeData.roomId,
            showDate: showtimeData.showDate,
            startTime: showtimeData.startTime,
            endTime: showtimeData.startTime,
            // status: showtimeData.status,
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      // Re-fetch showtimes
      fetchShowtimes();
      // Reload filter options to include new date if added
      loadFilterOptions();
      setIsModalOpen(false);
      alert(
        showtimeData.id
          ? "Cập nhật lịch chiếu thành công!"
          : "Thêm lịch chiếu thành công!"
      );
    } catch (err) {
      console.error("Error saving showtime:", err);
      alert(`Không thể lưu lịch chiếu: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setMovieFilter("all");
    setCinemaFilter("all");
    setDateFilter("all");
    setStatusFilter("all");
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }));
  };

  // Reference for modal actions
  const entry = useRef({ title: "Add new showtime", action: "Add" });

  // Change modal entry
  const changeEntry = (value) => {
    entry.current = {
      title: value[0],
      action: value[1],
    };
  };

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    // If there's only one page or no pages, don't render pagination
    if (pagination.totalPages <= 1) {
      return null;
    }

    // Calculate the range of page numbers to display
    const pageNumbers = [];
    let startPage, endPage;

    if (pagination.totalPages <= 5) {
      // If we have 5 or fewer pages, show all pages
      startPage = 1;
      endPage = pagination.totalPages;
    } else {
      // More than 5 pages, we need to determine which ones to show
      if (pagination.currentPage <= 3) {
        // Near the beginning
        startPage = 1;
        endPage = 5;
      } else if (pagination.currentPage >= pagination.totalPages - 2) {
        // Near the end
        startPage = pagination.totalPages - 4;
        endPage = pagination.totalPages;
      } else {
        // Somewhere in the middle
        startPage = pagination.currentPage - 2;
        endPage = pagination.currentPage + 2;
      }
    }

    // Generate the page number buttons
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={`page-${i}`}
          onClick={() => handlePageChange(i)}
          className={`w-8 h-8 flex items-center justify-center rounded ${
            pagination.currentPage === i
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-center mt-6">
        <div className="flex items-center gap-2">
          {/* First Page Button */}
          {pagination.currentPage > 3 && pagination.totalPages > 5 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="w-8 h-8 flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
              >
                1
              </button>
              {pagination.currentPage > 4 && <span className="px-1">...</span>}
            </>
          )}

          {/* Previous Button */}
          <button
            onClick={() =>
              handlePageChange(Math.max(1, pagination.currentPage - 1))
            }
            disabled={pagination.currentPage === 1}
            className={`px-3 py-1 rounded ${
              pagination.currentPage === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            Trước
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">{pageNumbers}</div>

          {/* Next Button */}
          <button
            onClick={() =>
              handlePageChange(
                Math.min(pagination.totalPages, pagination.currentPage + 1)
              )
            }
            disabled={pagination.currentPage === pagination.totalPages}
            className={`px-3 py-1 rounded ${
              pagination.currentPage === pagination.totalPages
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            Tiếp
          </button>

          {/* Last Page Button */}
          {pagination.currentPage < pagination.totalPages - 2 &&
            pagination.totalPages > 5 && (
              <>
                {pagination.currentPage < pagination.totalPages - 3 && (
                  <span className="px-1">...</span>
                )}
                <button
                  onClick={() => handlePageChange(pagination.totalPages)}
                  className="w-8 h-8 flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                >
                  {pagination.totalPages}
                </button>
              </>
            )}
        </div>
      </div>
    );
  };
  const queryRef = useRef({
    SearchKey: "",
    SearchValue: "",
    SortKey: "",
    SortValue: "",
    Page: "",
    Limit: 10,
    cinemaId: "",
    movieId: "",
    type: "",
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Header title="Quản lý lịch chiếu" />

      {/* Controls */}
      <div className="bg-white p-5 rounded-xl shadow-md mb-6">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <div className="font-medium mb-2">Phim</div>
              <Select
                options={movieOptions}
                value={movieFilter}
                defaultValue={movieFilter}
                setDefault={setMovieFilter}
                keySearch={"movieId"}
                queryRef={queryRef}
                onChange={(value) => handleFilterChange("movie", value)}
              />
            </div>

            <div>
              <div className="font-medium mb-2">Rạp</div>
              <Select
                options={cinemaOptions}
                value={cinemaFilter}
                keySearch={"cinemaId"}
                defaultValue={cinemaFilter}
                setDefault={setCinemaFilter}
                queryRef={queryRef}
                onChange={(value) => handleFilterChange("cinema", value)}
              />
            </div>

            <div>
              <div className="font-medium mb-2">Ngày chiếu</div>
              <Select
                options={dateOptions}
                value={dateFilter}
                onChange={(value) => handleFilterChange("date", value)}
              />
            </div>

            {/* <div>
              <div className="font-medium mb-2">Trạng thái</div>
              <Select
                options={statusOptions}
                value={statusFilter}
                setDefault={setStatusFilter}
                defaultValue={statusFilter}
                keySearch={"status"}
                queryRef={queryRef}
                onChange={(value) => handleFilterChange("status", value)}
              />
            </div> */}
          </div>

          <button
            onClick={() => {
              setInfoShowTime({});
              changeEntry(["Add new showtime", "Add"]);
              setIsModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors self-end"
          >
            <FaPlus /> Thêm lịch chiếu
          </button>
        </div>

        <div className="flex gap-2">
          <div
            className="button !bg-white !text-black border border-black flex items-center justify-center hover:cursor-pointer"
            onClick={handleResetFilters}
          >
            Đặt lại
          </div>
          {/* <div
            className="button flex items-center justify-center hover:cursor-pointer"
            onClick={fetchShowtimes}
          >
            Tìm kiếm
          </div> */}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      ) : filteredShowtimes.length === 0 ? (
        <div className="bg-white p-8 rounded-lg text-center shadow-sm">
          <p className="text-gray-500">Không tìm thấy lịch chiếu nào.</p>
        </div>
      ) : (
        <>
          <TabelShowTime
            showTimes={filteredShowtimes}
            setOpen={setIsModalOpen}
            setInfoShowTime={setInfoShowTime}
            changeEntry={changeEntry}
            handleDelete={handleDelete}
          />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handlePageChange(Math.max(1, pagination.currentPage - 1))
                  }
                  disabled={pagination.currentPage === 1}
                  className={`px-3 py-1 rounded ${
                    pagination.currentPage === 1
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                >
                  Trước
                </button>

                <div className="flex items-center gap-1">
                  {(() => {
                    const pages = [];

                    // Always show first page
                    if (pagination.totalPages > 0) {
                      pages.push(
                        <button
                          key={1}
                          onClick={() => handlePageChange(1)}
                          className={`w-8 h-8 flex items-center justify-center rounded ${
                            pagination.currentPage === 1
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                          }`}
                        >
                          1
                        </button>
                      );
                    }

                    // Add ellipsis if needed
                    if (pagination.currentPage > 3) {
                      pages.push(<span key="ellipsis1">...</span>);
                    }

                    // Add pages around current page
                    for (
                      let i = Math.max(2, pagination.currentPage - 1);
                      i <=
                      Math.min(
                        pagination.totalPages - 1,
                        pagination.currentPage + 1
                      );
                      i++
                    ) {
                      if (i > 1 && i < pagination.totalPages) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => handlePageChange(i)}
                            className={`w-8 h-8 flex items-center justify-center rounded ${
                              pagination.currentPage === i
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                            }`}
                          >
                            {i}
                          </button>
                        );
                      }
                    }

                    // Add ellipsis if needed
                    if (pagination.currentPage < pagination.totalPages - 2) {
                      pages.push(<span key="ellipsis2">...</span>);
                    }

                    // Always show last page if there are multiple pages
                    if (pagination.totalPages > 1) {
                      pages.push(
                        <button
                          key={pagination.totalPages}
                          onClick={() =>
                            handlePageChange(pagination.totalPages)
                          }
                          className={`w-8 h-8 flex items-center justify-center rounded ${
                            pagination.currentPage === pagination.totalPages
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                          }`}
                        >
                          {pagination.totalPages}
                        </button>
                      );
                    }

                    return pages;
                  })()}
                </div>

                <button
                  onClick={() =>
                    handlePageChange(
                      Math.min(
                        pagination.totalPages,
                        pagination.currentPage + 1
                      )
                    )
                  }
                  disabled={pagination.currentPage === pagination.totalPages}
                  className={`px-3 py-1 rounded ${
                    pagination.currentPage === pagination.totalPages
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                >
                  Tiếp
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Showtime Modal */}
      <AddShowTimeModal
        title={entry.current?.title || "Add new showtime"}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddShowtime={handleAddShowtime}
        info={infoShowTime}
        setInfo={setInfoShowTime}
        Entry={entry.current?.action || "Add"}
      />
    </div>
  );
};

export default Showtime;
