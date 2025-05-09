import Header from "../component/Header";
import Select from "../component/Select";
import { FaPlus, FaSearch, FaCalendarAlt } from "react-icons/fa";
import { useEffect, useState, useRef } from "react";
import TablePromotions from "../component/TablePromotions";
import AddPromotionModal from "../component/AddPromotionModal";
import { formatCurrency } from "../utils/formatUtils";
import { API_ENDPOINTS } from "../config/api";
// Thêm import Pagination
import Pagination from "../component/Pagination";

const Promotions = () => {
  // State for promotions data
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    total: 0
  });
  
  // Fetch promotions from the API
  const fetchPromotions = async () => {
    setLoading(true);
    try {
      // Use API_ENDPOINTS for consistency
      let url = `${API_ENDPOINTS.PROMOTIONS}?Page=${pagination.currentPage}&Limit=${pagination.pageSize}`;
      
      // Add filters if selected
      if (defaultStatus !== promotionStatuses[0].value) {
        const statusValue = defaultStatus.toLowerCase();
        url += `&status=${statusValue}`;
      }
      
      if (defaultType !== promotionTypes[0].value) {
        const typeValue = defaultType === "Fixed Amount" ? "fixed" : "percentage";
        url += `&type=${typeValue}`;
      }
      
      if (defaultScope !== applicationScope[0].value) {
        const scopeValue = defaultScope.toLowerCase().replace(' & ', '_');
        url += `&applyTo=${scopeValue}`;
      }
      
      if (searchTerm.trim() !== "") {
        url += `&SearchKey=name&SearchValue=${encodeURIComponent(searchTerm)}`;
      }
      
      console.log("Fetching promotions from:", url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log("Promotion data received:", responseData);
      
      if (!responseData || !Array.isArray(responseData.data)) {
        console.error("Invalid promotion data format:", responseData);
        throw new Error("Invalid data format received from server");
      }
      
      // Format data consistently
      const formattedPromotions = responseData.data.map(discount => ({
        id: discount.id,
        code: discount.code || discount.promotionCode || `PROMO${discount.id}`,
        name: discount.name || discount.title || `Discount #${discount.id}`,
        type: discount.discountType === "fixed" || discount.type === "fixed" ? "Fixed Amount" : "Percentage",
        value: parseFloat(discount.discountValue || discount.value || 0),
        minPurchase: parseFloat(discount.minPurchase || 0),
        maxDiscount: parseFloat(discount.maxDiscount || 0),
        startDate: discount.startDate || discount.startTime || new Date().toISOString().split('T')[0],
        endDate: discount.endDate || discount.endTime || new Date().toISOString().split('T')[0],
        status: discount.status || determineStatus(discount.startDate || discount.startTime, discount.endDate || discount.endTime),
        usageCount: discount.usageCount || 0,
        applyTo: discount.applyTo || "All",
        description: discount.description || "",
        quantity: discount.quantity || 0,
        discountValue: discount.discountValue || discount.value || 0,
      }));
      
      console.log("Formatted promotions:", formattedPromotions);
      setData(formattedPromotions);
      setPromotions(formattedPromotions);
      setPagination({
        currentPage: responseData.pagination?.currentPage || 1,
        totalPages: responseData.pagination?.totalPages || 1,
        pageSize: pagination.pageSize,
        total: responseData.pagination?.total || 0
      });
      
      setError(null);
    } catch (err) {
      console.error("Error fetching promotions:", err);
      setError("Không thể tải dữ liệu khuyến mãi. Vui lòng thử lại sau.");
      setData([]);
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Determine status based on dates
  const determineStatus = (startDate, endDate) => {
    const today = new Date();
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    if (!start || !end) return "Unknown";
    
    if (today < start) return "Scheduled";
    if (today > end) return "Expired";
    return "Active";
  };
  
  // API calls for data management
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khuyến mãi này không?")) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.PROMOTION_DELETE(id), {
        method: "DELETE"
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      // Update local state
      const updatedData = data.filter(item => item.id !== id);
      setData(updatedData);
      filterPromotions(updatedData);
      alert("Xóa khuyến mãi thành công!");
    } catch (error) {
      console.error("Error deleting promotion:", error);
      alert(`Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPromotion = async (newPromotion) => {
    try {
      setLoading(true);
      
      // Format data for API based on existing database schema
      const promotionData = {
        name: newPromotion.name,
        type: newPromotion.type === "Percentage" ? "percentage" : "fixed",
        description: newPromotion.description,
        quantity: newPromotion.quantity || 0,
        discountValue: newPromotion.value,
        startDate: newPromotion.startDate,
        endDate: newPromotion.endDate
      };
      
      let response;
      console.log('promotionData: ', promotionData)
      console.log('newPromotion: ', newPromotion)
      if (newPromotion.id < 100000) {
        // Edit existing promotion
        response = await fetch(API_ENDPOINTS.PROMOTION_EDIT(newPromotion.id), {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(promotionData)
        });
      } else {
        // Add new promotion
        response = await fetch(API_ENDPOINTS.PROMOTION_ADD, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(promotionData)
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      // Refresh data
      fetchPromotions();
      setIsModalOpen(false);
      alert(newPromotion.id ? "Cập nhật khuyến mãi thành công!" : "Thêm khuyến mãi thành công!");
    } catch (error) {
      console.error("Error saving promotion:", error);
      alert(`Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Table configuration
  const columnNames = ["Code", "Name", "Discount", "Validity", "Type", "Status", "Usage", "Actions"];
  const [promotions, setPromotions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const promotionStatuses = [
    { key: "all", value: "All Status" },
    { key: "active", value: "Active" },
    { key: "scheduled", value: "Scheduled" },
    { key: "expired", value: "Expired" },
    { key: "disabled", value: "Disabled" }
  ];
  
  const promotionTypes = [
    { key: "all", value: "All Types" },
    { key: "percentage", value: "Percentage" },
    { key: "fixed", value: "Fixed Amount" }
  ];
  
  const applicationScope = [
    { key: "all", value: "All Scopes" },
    { key: "tickets", value: "Tickets" },
    { key: "food", value: "Food & Drinks" },
    { key: "all_items", value: "All" }
  ];

  const [defaultStatus, setDefaultStatus] = useState(() => {
    return localStorage.getItem("keyPromotionStatus") || promotionStatuses[0].value;
  });

  const [defaultType, setDefaultType] = useState(() => {
    return localStorage.getItem("keyPromotionType") || promotionTypes[0].value;
  });
  
  const [defaultScope, setDefaultScope] = useState(() => {
    return localStorage.getItem("keyPromotionScope") || applicationScope[0].value;
  });

  const filterPromotions = (dataToFilter = data) => {
    let filtered = dataToFilter;

    // Filter by status
    if (defaultStatus !== promotionStatuses[0].value) {
      filtered = filtered.filter((promo) => {
        return promo.status === defaultStatus;
      });
    }

    // Filter by type
    if (defaultType !== promotionTypes[0].value) {
      filtered = filtered.filter((promo) => {
        return promo.type === defaultType;
      });
    }
    
    // Filter by scope
    if (defaultScope !== applicationScope[0].value) {
      filtered = filtered.filter((promo) => {
        return promo.applyTo === defaultScope;
      });
    }

    // Filter by search term
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((promo) => {
        return promo.code.toLowerCase().includes(term) || 
               promo.name.toLowerCase().includes(term) ||
               promo.description.toLowerCase().includes(term);
      });
    }

    setPromotions(filtered);
  };

  // Calculate statistics
  const totalPromotions = data.length;
  const activePromotions = data.filter(promo => promo.status === "Active").length;
  const scheduledPromotions = data.filter(promo => promo.status === "Scheduled").length;
  const expiredPromotions = data.filter(promo => promo.status === "Expired").length;
  const today = new Date();
  const soonExpiring = data.filter(promo => {
    if (promo.status !== "Active") return false;
    const endDate = new Date(promo.endDate);
    const diffDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  }).length;

  useEffect(() => {
    fetchPromotions();
  }, [pagination.currentPage]);
  
  useEffect(() => {
    filterPromotions();
  }, [defaultStatus, defaultType, defaultScope, searchTerm, data]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [promotionInfo, setPromotionInfo] = useState({
    code: "",
    name: "",
    type: "",
    value: 0,
    minPurchase: 0,
    maxDiscount: 0,
    startDate: "",
    endDate: "",
    status: "",
    usageCount: 0,
    applyTo: "",
    description: "",
    id: null,
    quantity: 0,
    discountValue: 0,
  });
  
  const entry = useRef({});
  const changeEntry = (value) => {
    entry.current = {
      title: value[0],
      action: value[1],
    };
  };

  const [Delete, setDelete] = useState(false);

  // Thêm hàm xử lý thay đổi trang
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };
  
  // Trong phần return, thêm component Pagination sau TablePromotions
  return (
    <div className="w-[100%] h-[100vh] bg-neutral-100 p-5 overflow-auto">
      <Header title={"Promotion Management"} />
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Promotions</h3>
          <p className="text-2xl font-semibold">{totalPromotions}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Active</h3>
          <p className="text-2xl font-semibold text-green-600">{activePromotions}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Scheduled</h3>
          <p className="text-2xl font-semibold text-blue-600">{scheduledPromotions}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Expired</h3>
          <p className="text-2xl font-semibold text-gray-600">{expiredPromotions}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Expiring Soon</h3>
          <p className="text-2xl font-semibold text-yellow-600">{soonExpiring}</p>
        </div>
      </div>
      
      <div>
        {/* Filters and actions */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search promotions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-64"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <Select
              options={promotionStatuses}
              defaultValue={defaultStatus}
              setDefault={setDefaultStatus}
              keyStorage={"keyPromotionStatus"}
            />
            <Select
              options={promotionTypes}
              defaultValue={defaultType}
              setDefault={setDefaultType}
              keyStorage={"keyPromotionType"}
            />
            <Select
              options={applicationScope}
              defaultValue={defaultScope}
              setDefault={setDefaultScope}
              keyStorage={"keyPromotionScope"}
            />
          </div>
          <button
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-400 text-white px-4 py-2 rounded-md font-medium"
            onClick={() => {
              setIsModalOpen(true);
              changeEntry(["Create new promotion", "Create"]);
            }}
          >
            <FaPlus />
            <span>New promotion</span>
          </button>
        </div>
        
        {/* Promotions list display */}
        {!promotions.length ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/7486/7486754.png" 
              alt="No promotions" 
              className="w-24 h-24 mx-auto opacity-50"
            />
            <p className="text-center font-semibold text-xl mt-4 text-gray-700">
              Không có khuyến mãi nào được tìm thấy!
            </p>
            <p className="text-gray-500 mt-2">
              Thử thay đổi bộ lọc hoặc tạo khuyến mãi mới
            </p>
          </div>
        ) : (
          <>
            <TablePromotions
              columnNames={columnNames}
              promotions={promotions}
              setOpen={setIsModalOpen}
              setPromotionInfo={setPromotionInfo}
              changeEntry={changeEntry}
              handleDelete={handleDelete}
            />
            
            {/* Thêm phân trang */}
            {pagination.totalPages > 1 && (
              <Pagination 
                pagination={pagination} 
                onPageChange={handlePageChange} 
              />
            )}
          </>
        )}
      </div>

      <AddPromotionModal
        title={entry.current.title}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddPromotion={handleAddPromotion}
        info={promotionInfo}
        setInfo={setPromotionInfo}
        Entry={entry.current.action}
      />
    </div>
  );
};

export default Promotions;