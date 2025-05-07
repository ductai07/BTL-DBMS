import { useState, useEffect } from "react";
import Header from "../component/Header";
import Search from "../component/Search";
import { FaPlus } from "react-icons/fa";
import TableProducts from "../component/TableProducts";
import AddProductModal from "../component/AddProductModal";
import ProductGridView from "../component/ProductGridView";

const Products = () => {
  const [view, setView] = useState("grid");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productInfo, setProductInfo] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 12,
    total: 0
  });
  const [searchText, setSearchText] = useState("");

  // Fetch products from the backend API
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/product?Page=${pagination.currentPage}&Limit=${pagination.pageSize}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform data to match the expected format
      const formattedProducts = (data.data || []).map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit || 'Cái',
        quantity: product.quantity || 0,
        image: product.image || 'https://placehold.co/300x300?text=No+Image',
        description: product.description || '',
        category: product.category || 'Sản phẩm',
        // Keep original data
        originalData: product
      }));
      
      setProducts(formattedProducts);
      applyFilters(formattedProducts, searchText);
      setPagination({
        currentPage: data.pagination?.currentPage || 1,
        totalPages: data.pagination?.totalPages || 1,
        pageSize: data.pagination?.pageSize || 12,
        total: data.pagination?.total || 0
      });
      setError(null);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchProducts();
  }, [pagination.currentPage]);

  // Apply filters to products
  const applyFilters = (productsData, search) => {
    if (!search) {
      setFilteredProducts(productsData);
      return;
    }
    
    const lowerSearch = search.toLowerCase();
    const filtered = productsData.filter(product => 
      product.name.toLowerCase().includes(lowerSearch) || 
      product.description.toLowerCase().includes(lowerSearch) ||
      product.category.toLowerCase().includes(lowerSearch)
    );
    
    setFilteredProducts(filtered);
  };

  // Handle search change
  const handleSearch = (text) => {
    setSearchText(text);
    applyFilters(products, text);
  };

  // Handle adding or editing a product
  const handleAddProduct = async (productData) => {
    try {
      setLoading(true);
      let response;
      
      if (productData.id && productData.originalData) {
        // Edit existing product
        response = await fetch(`http://localhost:3000/product/edit/${productData.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: productData.name,
            price: productData.price,
            quantity: productData.quantity,
            unit: productData.unit,
            description: productData.description,
            image: productData.image
          })
        });
      } else {
        // Add new product
        response = await fetch('http://localhost:3000/product/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: productData.name,
            price: productData.price,
            quantity: productData.quantity,
            unit: productData.unit,
            description: productData.description,
            image: productData.image
          })
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      // Re-fetch the products after adding/editing
      await fetchProducts();
      setIsModalOpen(false);
      alert(productData.id ? "Cập nhật sản phẩm thành công!" : "Thêm sản phẩm thành công!");
    } catch (err) {
      console.error("Error saving product:", err);
      alert(`Không thể lưu sản phẩm: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle product deletion
  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/product/delete/${productId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        // Re-fetch products after deletion
        await fetchProducts();
        alert("Xóa sản phẩm thành công!");
      } catch (err) {
        console.error("Error deleting product:", err);
        alert(`Không thể xóa sản phẩm: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };

  return (
    <div className="w-full min-h-screen bg-gray-100">
      <div className="p-6">
        <Header title="Quản lý sản phẩm" />
        
        {/* Top Controls */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <Search 
              placeholder="Tìm kiếm sản phẩm..." 
              onSearch={handleSearch} 
              search={searchText}
            />
            
            <div className="flex rounded-lg overflow-hidden">
              <button 
                className={`px-4 py-2 ${view === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                onClick={() => setView('grid')}
              >
                Grid
              </button>
              <button 
                className={`px-4 py-2 ${view === 'table' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                onClick={() => setView('table')}
              >
                Table
              </button>
            </div>
          </div>
          
          <button
            onClick={() => {
              setProductInfo(null);
              setIsModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FaPlus /> Thêm sản phẩm
          </button>
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
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white p-8 rounded-lg text-center shadow-sm">
            <p className="text-gray-500">Không tìm thấy sản phẩm nào.</p>
          </div>
        ) : (
          <>
            {view === 'grid' ? (
              <ProductGridView 
                products={filteredProducts}
                onEdit={(product) => {
                  setProductInfo(product);
                  setIsModalOpen(true);
                }}
                onDelete={handleDeleteProduct}
              />
            ) : (
              <TableProducts 
                products={filteredProducts} 
                onEdit={(product) => {
                  setProductInfo(product);
                  setIsModalOpen(true);
                }}
                onDelete={handleDeleteProduct}
              />
            )}
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(Math.max(1, pagination.currentPage - 1))}
                    disabled={pagination.currentPage === 1}
                    className={`px-3 py-1 rounded ${pagination.currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                  >
                    Trước
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {[...Array(pagination.totalPages)].map((_, i) => {
                      // Show max 5 page numbers with ellipsis
                      if (
                        pagination.totalPages <= 5 ||
                        i + 1 === 1 ||
                        i + 1 === pagination.totalPages ||
                        (i + 1 >= pagination.currentPage - 1 && i + 1 <= pagination.currentPage + 1)
                      ) {
                        return (
                          <button
                            key={i}
                            onClick={() => handlePageChange(i + 1)}
                            className={`w-8 h-8 flex items-center justify-center rounded ${
                              pagination.currentPage === i + 1
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            }`}
                          >
                            {i + 1}
                          </button>
                        );
                      } else if (
                        (i === 1 && pagination.currentPage > 3) ||
                        (i === pagination.totalPages - 2 && pagination.currentPage < pagination.totalPages - 2)
                      ) {
                        return <span key={i}>...</span>;
                      }
                      return null;
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className={`px-3 py-1 rounded ${pagination.currentPage === pagination.totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                  >
                    Tiếp
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Add/Edit Product Modal */}
      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddProduct}
        product={productInfo}
        title={productInfo ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
      />
    </div>
  );
};

export default Products;