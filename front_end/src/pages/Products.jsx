import React, { useState, useEffect, useRef } from "react";
import { Header } from "../component/Header";
import AddProductModal from "../component/AddProductModal";
import ProductDetailsModal from "../component/ProductDetailsModal";
import { BiSolidPencil } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import { formatCurrency } from "../utils/formatUtils";
import { Select } from "../component/Select";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api";

// Create simple toast notification replacements
const toast = {
  success: (message) => {
    console.log("Success:", message);
    alert(message);
  },
  error: (message) => {
    console.error("Error:", message);
    alert("Error: " + message);
  }
};

const Products = () => {
  // State variables
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productInfo, setProductInfo] = useState({});
  const [addButtonText, setAddButtonText] = useState(["Add product", "Add"]);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [viewType, setViewType] = useState("grid"); // "grid" or "table"
  const [searchText, setSearchText] = useState("");

  const categories = ["All", "Popcorn", "Drink", "Combo"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Fetch products with search and category filter
  // Fetch products with search and category filter
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the API_ENDPOINTS constant for consistency
      let url = `${API_ENDPOINTS.PRODUCTS}?page=${currentPage}&limit=${perPage}`;
      
      // Add search parameter if present
      if (searchText) {
        url += `&SearchKey=name&SearchValue=${encodeURIComponent(searchText)}`;
      }
      
      // Add category filter if not "All"
      if (selectedCategory !== "All") {
        // Sửa tham số category thành SearchKey và SearchValue
        url += `&SearchKey=category&SearchValue=${encodeURIComponent(selectedCategory)}`;
      }
      
      console.log("Fetching products from URL:", url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products. Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Products data received:", data);
      
      // Standardize the data format
      const formattedProducts = (data.data || []).map(product => ({
        id: product.id,
        name: product.name || "Unknown Product",
        price: product.price || 0,
        category: product.category || "Uncategorized",
        description: product.description || "",
        inStock: product.quantity > 0,
        image: product.image || "https://placehold.co/300x300?text=No+Image"
      }));
      
      setProducts(formattedProducts);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalProducts(data.pagination?.total || 0);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message || "Failed to fetch products");
      toast.error("Failed to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchText(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Fetch products when component mounts or dependencies change
  useEffect(() => {
    fetchProducts();
  }, [currentPage, perPage, selectedCategory, searchText]);

  // Function to handle adding or editing a product
  const handleAddProduct = async (newProduct) => {
    setLoading(true);
    
    try {
      const isEditing = newProduct.id !== undefined;
      
      // Chuyển đổi dữ liệu để phù hợp với backend
      const productData = {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        description: newProduct.description || '',
        // Chuyển đổi inStock thành quantity
        quantity: newProduct.inStock ? (newProduct.quantity || 10) : 0,
        // Sử dụng category làm unit nếu không có unit
        unit: newProduct.unit || newProduct.category || 'Đơn vị'
      };
      
      const url = isEditing 
        ? API_ENDPOINTS.PRODUCT_EDIT(newProduct.id)
        : API_ENDPOINTS.PRODUCT_ADD;
      
      const method = isEditing ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'add'} product. Status: ${response.status}`);
      }
      
      toast.success(`Product ${isEditing ? 'updated' : 'added'} successfully!`);
      setOpenAdd(false);
      
      // Refresh the products list
      fetchProducts();
      
    } catch (err) {
      console.error(`Error ${newProduct.id ? 'updating' : 'adding'} product:`, err);
      toast.error(err.message || `Failed to ${newProduct.id ? 'update' : 'add'} product`);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle deleting a product
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(API_ENDPOINTS.PRODUCT_DELETE(id), {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete product. Status: ${response.status}`);
      }
      
      toast.success("Product deleted successfully!");
      
      // Refresh the products list
      fetchProducts();
      
    } catch (err) {
      console.error("Error deleting product:", err);
      toast.error(err.message || "Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle per page change
  const handlePerPageChange = (e) => {
    setPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page when changing per page
  };

  // Handle category change
  // Tạo queryRef để lưu trữ các tham số tìm kiếm
  const queryRef = useRef({});
  
  // Chuyển đổi categories thành định dạng cũ
  const categoryOptions = [
  { key: "all", value: "Tất cả danh mục" },
  { key: "Popcorn", value: "Popcorn" },
  { key: "Drink", value: "Drink" },
  { key: "Combo", value: "Combo" },
  { key: "Other", value: "Other" }
  ];
  
  // Thay đổi hàm handleCategoryChange
  // Handle category change
  const handleCategoryChange = (category) => {
  setSelectedCategory(category);
  setCurrentPage(1); // Reset to first page when changing category
  // Gọi fetchProducts ngay sau khi thay đổi danh mục
  setTimeout(() => fetchProducts(), 0);
  };
  
  // Trong phần render, thay đổi component Select
  <Select
  options={categoryOptions}
  placeholder="All Categories"
  value={selectedCategory}
  onChange={handleCategoryChange}
  keySearch="category"
  queryRef={queryRef}
  size="sm"
  />

  // Open Add/Edit modal
  const openAddModal = (product = null) => {
    if (product) {
      setAddButtonText(["Edit product", "Save"]);
      setProductInfo(product);
    } else {
      setAddButtonText(["Add product", "Add"]);
      setProductInfo({});
    }
    setOpenAdd(true);
  };

  // Open product details modal
  const openDetailsModal = (product) => {
    setSelectedProduct(product);
    setOpenDetails(true);
  };

  return (
    // Thay đổi container chính để thêm padding
    <div className="container-fluid mt-5 px-4 pb-6">
      <Header
        title="Products"
        description="Manage your cinema's products and services"
      />
    
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center my-6 gap-4">
        <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchText}
              onChange={handleSearch}
            />
            <button
              onClick={() => setSearchText("")}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 ${
                !searchText && "hidden"
              }`}
            >
              ✕
            </button>
          </div>

          {/* Category filter */}
          {/* <div className="w-full md:w-auto">
            <Select
              options={categories}
              placeholder="All Categories"
              selected={selectedCategory}
              setSelected={handleCategoryChange}
              size="sm"
            />
          </div> */}
        </div>

        <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
          {/* View type toggle */}
          <div className="flex rounded-md overflow-hidden border border-gray-300">
            <button
              className={`px-3 py-2 ${
                viewType === "grid"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700"
              }`}
              onClick={() => setViewType("grid")}
            >
              Grid
            </button>
            <button
              className={`px-3 py-2 ${
                viewType === "table"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700"
              }`}
              onClick={() => setViewType("table")}
            >
              Table
            </button>
          </div>

          {/* Add product button */}
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            onClick={() => openAddModal()}
          >
            Add Product
          </button>
        </div>
      </div>

      {/* Loading and error states */}
      {loading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg my-4">
          <p>{error}</p>
          <button
            className="text-sm underline mt-2"
            onClick={fetchProducts}
          >
            Try again
          </button>
        </div>
      )}

      {/* Products display */}
      {!loading && !error && products.length === 0 && (
        <div className="bg-gray-50 rounded-lg py-8 px-4 text-center my-4">
          <p className="text-gray-500 mb-4">No products found.</p>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            onClick={() => openAddModal()}
          >
            Add your first product
          </button>
        </div>
      )}

      {/* Products grid view */}
      {!loading && !error && products.length > 0 && viewType === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 my-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200"
            >
              <div 
                className="p-4 cursor-pointer"
                onClick={() => openDetailsModal(product)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-blue-500 font-medium mt-1">
                      {product.category || "Uncategorized"}
                    </p>
                  </div>
                  <span className="bg-blue-50 text-blue-700 text-sm font-medium px-2 py-1 rounded">
                    {formatCurrency(product.price)}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                  {product.description || "No description provided"}
                </p>
                <div className="flex justify-between items-center mt-4">
                  <span
                    className={`text-sm font-medium px-2 py-1 rounded-full ${
                      product.inStock
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        openAddModal(product);
                      }}
                    >
                      <BiSolidPencil />
                    </button>
                    <button
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(product.id);
                      }}
                    >
                      <MdDelete />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Products table view */}
      {!loading && !error && products.length > 0 && viewType === "table" && (
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm my-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr 
                  key={product.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => openDetailsModal(product)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {product.name}
                    </div>
                    <div className="text-sm text-gray-500 line-clamp-1">
                      {product.description || "No description"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {product.category || "Uncategorized"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">
                      {formatCurrency(product.price)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.inStock
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-900 font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          openAddModal(product);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900 font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(product.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && products.length > 0 && (
        <div className="flex flex-col md:flex-row justify-between items-center my-4">
          <div className="text-sm text-gray-500 mb-4 md:mb-0">
            Showing {(currentPage - 1) * perPage + 1} to{" "}
            {Math.min(currentPage * perPage, totalProducts)} of {totalProducts} products
          </div>
          <div className="flex items-center space-x-2">
            <select
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
              value={perPage}
              onChange={handlePerPageChange}
            >
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
            </select>
            <div className="flex space-x-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-blue-500 hover:bg-blue-50 border border-gray-300"
                }`}
              >
                &lt;
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === i + 1
                      ? "bg-blue-500 text-white"
                      : "bg-white text-blue-500 hover:bg-blue-50 border border-gray-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-blue-500 hover:bg-blue-50 border border-gray-300"
                }`}
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      <AddProductModal
        isOpen={openAdd}
        closeModal={() => setOpenAdd(false)}
        addProduct={handleAddProduct}
        buttonText={addButtonText}
        initialData={productInfo}
      />

      {/* Product Details Modal */}
      <ProductDetailsModal
        isOpen={openDetails}
        closeModal={() => setOpenDetails(false)}
        product={selectedProduct}
      />
    </div>
  );
};

export default Products;