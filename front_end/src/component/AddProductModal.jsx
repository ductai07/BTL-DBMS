import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { formatCurrency } from "../utils/formatUtils";

const AddProductModal = ({ isOpen, onClose, onSave, product, title }) => {
  const [productData, setProductData] = useState({
    name: "",
    price: "",
    quantity: "",
    unit: "Cái",
    description: "",
    image: ""
  });
  
  // Update form when product prop changes
  useEffect(() => {
    if (product && isOpen) {
      setProductData({
        id: product.id,
        name: product.name || "",
        price: product.price || "",
        quantity: product.quantity || "",
        unit: product.unit || "Cái",
        description: product.description || "",
        image: product.image || "",
        originalData: product.originalData || product
      });
    } else if (isOpen) {
      // Reset form when opened for new product
      setProductData({
        name: "",
        price: "",
        quantity: "",
        unit: "Cái",
        description: "",
        image: ""
      });
    }
  }, [product, isOpen]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData({
      ...productData,
      [name]: name === "price" || name === "quantity" ? parseFloat(value) || "" : value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(productData);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoClose size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Tên sản phẩm
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={productData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tên sản phẩm"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Giá
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="1000"
                required
                value={productData.price}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="VNĐ"
              />
            </div>
            
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Số lượng
              </label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                min="0"
                required
                value={productData.quantity}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
              Đơn vị
            </label>
            <select
              id="unit"
              name="unit"
              required
              value={productData.unit}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Cái">Cái</option>
              <option value="Hộp">Hộp</option>
              <option value="Chai">Chai</option>
              <option value="Lon">Lon</option>
              <option value="Túi">Túi</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
              URL hình ảnh
            </label>
            <input
              id="image"
              name="image"
              type="text"
              value={productData.image}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              id="description"
              name="description"
              rows="3"
              value={productData.description}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mô tả sản phẩm"
            ></textarea>
          </div>
          
          {/* Preview of product */}
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <p className="text-sm font-medium mb-1">Xem trước:</p>
            <div className="flex gap-2">
              {productData.image && (
                <img 
                  src={productData.image} 
                  alt={productData.name} 
                  className="w-16 h-16 object-cover rounded"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/300x300?text=No+Image";
                  }}
                />
              )}
              <div>
                <p className="font-medium">{productData.name || "Tên sản phẩm"}</p>
                <p className="text-sm text-gray-500">{formatCurrency(productData.price || 0)}</p>
                <p className="text-xs text-gray-500">
                  {productData.quantity || 0} {productData.unit}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {product ? "Lưu" : "Thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;