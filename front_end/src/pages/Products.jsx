import Header from "../component/Header";
import Select from "../component/Select";
import { FaPlus, FaSearch, FaTh, FaList } from "react-icons/fa";
import { useEffect, useState, useRef } from "react";
import TableProducts from "../component/TableProducts";
import AddProductModal from "../component/AddProductModal";
import ProductGridView from "../component/ProductGridView";
import { formatCurrency } from "../utils/formatUtils";

const Products = () => {
  // Call api lay data
  let [data, setData] = useState([
    {
      id: 1,
      name: "Bắp rang bơ lớn",
      category: "Popcorn",
      price: 65000,
      stock: 100,
      status: "Available",
      isCombo: false,
      image: "https://www.cgv.vn/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/p/o/popcorn_caramel_1.png"
    },
    {
      id: 2,
      name: "Coca Cola ly lớn",
      category: "Drink",
      price: 35000,
      stock: 150,
      status: "Available",
      isCombo: false,
      image: "https://www.cgv.vn/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/c/o/coke.png"
    },
    {
      id: 3,
      name: "Combo Couple",
      category: "Combo",
      price: 150000,
      stock: 50,
      status: "Available",
      isCombo: true,
      image: "https://www.cgv.vn/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/c/o/combo_for_2_1.png"
    },
    {
      id: 4,
      name: "Kẹo M&M",
      category: "Snack",
      price: 30000,
      stock: 5,
      status: "Low Stock",
      isCombo: false,
      image: "https://www.cgv.vn/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/m/_/m_m.png"
    },
    {
      id: 5,
      name: "Combo Family",
      category: "Combo",
      price: 220000,
      stock: 0,
      status: "Out of Stock",
      isCombo: true,
      image: "https://www.cgv.vn/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/c/g/cgv_family_combo_4.png"
    },
  ]);
  
  // Call api de update data
  const handleDelete = (productId) => {
    setDelete(!Delete);
    const updateData = data.filter(({ id }) => id != productId);
    setData(updateData);
    filterProducts(updateData);
  };

  const handleAddProduct = (newProduct) => {
    let updatedProducts = [
      newProduct,
      ...data.filter((product) => product.id != newProduct.id),
    ];
    setData(updatedProducts);
    filterProducts(updatedProducts);
  };

  // Table configuration
  const columnNames = ["Image", "Product", "Category", "Price", "Stock", "Status", "Actions"];
  const [products, setProducts] = useState([]);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem("productViewMode") || "table");
  const [searchTerm, setSearchTerm] = useState("");
  
  const productCategories = [
    { key: "all", value: "All Categories" },
    { key: "popcorn", value: "Popcorn" },
    { key: "drink", value: "Drink" },
    { key: "snack", value: "Snack" },
    { key: "combo", value: "Combo" },
  ];
  
  const productStatuses = [
    { key: "all", value: "All Status" },
    { key: "available", value: "Available" },
    { key: "low_stock", value: "Low Stock" },
    { key: "out_of_stock", value: "Out of Stock" },
  ];

  const [defaultCategory, setDefaultCategory] = useState(() => {
    return localStorage.getItem("keyCategory") || productCategories[0].value;
  });

  const [defaultProductStatus, setDefaultProductStatus] = useState(() => {
    return localStorage.getItem("keyProductStatus") || productStatuses[0].value;
  });

  const filterProducts = (dataToFilter) => {
    let filtered = dataToFilter;

    // Filter by category
    if (defaultCategory !== productCategories[0].value) {
      filtered = filtered.filter((product) => {
        return product.category === defaultCategory;
      });
    }

    // Filter by status
    if (defaultProductStatus !== productStatuses[0].value) {
      filtered = filtered.filter((product) => {
        return product.status === defaultProductStatus;
      });
    }

    // Filter by search term
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((product) => {
        return product.name.toLowerCase().includes(term) || 
               product.category.toLowerCase().includes(term);
      });
    }

    setProducts(filtered);
  };

  // Calculate statistics
  const totalProducts = data.length;
  const totalCombos = data.filter(product => product.isCombo).length;
  const lowStockCount = data.filter(product => product.status === "Low Stock").length;
  const outOfStockCount = data.filter(product => product.status === "Out of Stock").length;

  // Total inventory value
  const totalValue = data.reduce((sum, product) => sum + (product.price * product.stock), 0);

  useEffect(() => {
    filterProducts(data);
  }, [defaultCategory, defaultProductStatus, searchTerm]);

  // View mode toggle
  const toggleViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem("productViewMode", mode);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [productInfo, setProductInfo] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    status: "",
    isCombo: false,
    image: "",
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
      <Header title={"Product & Combos Management"} />
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
          <p className="text-2xl font-semibold">{totalProducts}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Combos</h3>
          <p className="text-2xl font-semibold">{totalCombos}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Low/Out of Stock</h3>
          <p className="text-2xl font-semibold text-yellow-600">{lowStockCount + outOfStockCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Inventory Value</h3>
          <p className="text-2xl font-semibold text-green-600">{formatCurrency(totalValue)}</p>
        </div>
      </div>
      
      <div>
        {/* Filters and actions */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-64"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <Select
              options={productCategories}
              defaultValue={defaultCategory}
              setDefault={setDefaultCategory}
              keyStorage={"keyCategory"}
            />
            <Select
              options={productStatuses}
              defaultValue={defaultProductStatus}
              setDefault={setDefaultProductStatus}
              keyStorage={"keyProductStatus"}
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white border border-gray-300 rounded-md overflow-hidden">
              <button 
                onClick={() => toggleViewMode('table')} 
                className={`p-2 ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
                title="Table View"
              >
                <FaList />
              </button>
              <button 
                onClick={() => toggleViewMode('grid')} 
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
                title="Grid View"
              >
                <FaTh />
              </button>
            </div>
            <button
              className="button flex items-center mx-auto bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              onClick={() => {
                setIsModalOpen(true);
                changeEntry(["Add new product", "Add"]);
              }}
            >
              <FaPlus />
              Add product
            </button>
          </div>
        </div>
        
        {/* Product list display */}
        {!products.length ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/5445/5445197.png" 
              alt="No products" 
              className="w-24 h-24 mx-auto opacity-50"
            />
            <p className="text-center font-semibold text-xl mt-4 text-gray-700">
              Không có sản phẩm nào được tìm thấy!
            </p>
            <p className="text-gray-500 mt-2">
              Thử thay đổi bộ lọc hoặc thêm sản phẩm mới
            </p>
          </div>
        ) : viewMode === 'table' ? (
          <TableProducts
            columnNames={columnNames}
            products={products}
            setOpen={setIsModalOpen}
            setProductInfo={setProductInfo}
            changeEntry={changeEntry}
            handleDelete={handleDelete}
          />
        ) : (
          <ProductGridView 
            products={products}
            setOpen={setIsModalOpen}
            setProductInfo={setProductInfo}
            changeEntry={changeEntry}
            handleDelete={handleDelete}
          />
        )}
      </div>
      
      <AddProductModal
        title={entry.current.title}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddProduct={handleAddProduct}
        info={productInfo}
        setInfo={setProductInfo}
        Entry={entry.current.action}
      />
    </div>
  );
};

export default Products;