import Header from "../component/Header";
import Select from "../component/Select";
import { FaPlus, FaSearch, FaCalendarAlt } from "react-icons/fa";
import { useEffect, useState, useRef } from "react";
import TablePromotions from "../component/TablePromotions";
import AddPromotionModal from "../component/AddPromotionModal";
import { formatCurrency } from "../utils/formatUtils";

const Promotions = () => {
  // Sample data - would normally come from an API
  let [data, setData] = useState([
    {
      id: 1,
      code: "SUMMER25",
      name: "Summer Sale 25%",
      type: "Percentage",
      value: 25,
      minPurchase: 100000,
      maxDiscount: 50000,
      startDate: "2025-06-01",
      endDate: "2025-08-31",
      status: "Scheduled",
      usageCount: 0,
      applyTo: "All",
      description: "25% off for all purchases during summer"
    },
    {
      id: 2,
      code: "WELCOME50K",
      name: "New Customer Welcome",
      type: "Fixed Amount",
      value: 50000,
      minPurchase: 200000,
      maxDiscount: 50000,
      startDate: "2025-01-01",
      endDate: "2025-12-31",
      status: "Active",
      usageCount: 145,
      applyTo: "Tickets",
      description: "50,000 VND off for new customers"
    },
    {
      id: 3,
      code: "COMBO30",
      name: "Combo Discount 30%",
      type: "Percentage",
      value: 30,
      minPurchase: 0,
      maxDiscount: 100000,
      startDate: "2025-04-01",
      endDate: "2025-05-15",
      status: "Active",
      usageCount: 78,
      applyTo: "Food & Drinks",
      description: "30% off on all combo purchases"
    },
    {
      id: 4,
      code: "BDAY100K",
      name: "Birthday Special",
      type: "Fixed Amount",
      value: 100000,
      minPurchase: 300000,
      maxDiscount: 100000,
      startDate: "2025-01-01",
      endDate: "2025-12-31",
      status: "Active",
      usageCount: 56,
      applyTo: "All",
      description: "Special birthday discount"
    },
    {
      id: 5,
      code: "WEEKEND10",
      name: "Weekend Discount",
      type: "Percentage",
      value: 10,
      minPurchase: 0,
      maxDiscount: 30000,
      startDate: "2025-03-01",
      endDate: "2025-04-01",
      status: "Expired",
      usageCount: 230,
      applyTo: "Tickets",
      description: "10% off on weekend tickets"
    }
  ]);
  
  // API calls for data management
  const handleDelete = (id) => {
    setDelete(!Delete);
    const updateData = data.filter((item) => item.id != id);
    setData(updateData);
    filterPromotions(updateData);
  };

  const handleAddPromotion = (newPromotion) => {
    let updatedPromotions = [
      newPromotion,
      ...data.filter((promotion) => promotion.id != newPromotion.id),
    ];
    setData(updatedPromotions);
    filterPromotions(updatedPromotions);
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

  const filterPromotions = (dataToFilter) => {
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
    filterPromotions(data);
  }, [defaultStatus, defaultType, defaultScope, searchTerm]);

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
    id: Date.now(),
  });
  
  const entry = useRef({});
  const changeEntry = (value) => {
    entry.current = {
      title: value[0],
      action: value[1],
    };
  };

  const [Delete, setDelete] = useState(false);

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
            className="flex items-center justify-center  mx-auto bg-blue-600 hover:bg-blue-400 text-white px-4 py-2 rounded-md font-medium"
            onClick={() => {
              setIsModalOpen(true);
              changeEntry(["Create new promotion", "Create"]);
            }}
          >
            <FaPlus />
            New promotion
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
          <TablePromotions
            columnNames={columnNames}
            promotions={promotions}
            setOpen={setIsModalOpen}
            setPromotionInfo={setPromotionInfo}
            changeEntry={changeEntry}
            handleDelete={handleDelete}
          />
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