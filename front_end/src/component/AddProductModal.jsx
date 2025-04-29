import { useEffect } from "react";
import { IoClose } from "react-icons/io5";

const AddProductModal = ({
  title,
  isOpen,
  onClose,
  onAddProduct,
  info,
  setInfo,
  Entry,
}) => {
  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setInfo({
        name: "",
        category: "",
        price: "",
        stock: "",
        status: "",
        isCombo: false,
        image: "",
        id: Date.now(),
      });
    }
  }, [isOpen, setInfo]);

  const handleChange = (e) => {
    const value = 
      e.target.type === "checkbox" 
        ? e.target.checked 
        : e.target.value;
    
    setInfo({ ...info, [e.target.name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddProduct({
      ...info,
      id: info.id || Date.now(),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-[500px] max-w-[95%]">
        <div className="flex justify-between items-center border-b px-5 py-3">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <IoClose size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                value={info.name}
                onChange={handleChange}
                placeholder="e.g. Bắp rang bơ lớn"
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Category
              </label>
              <select
                name="category"
                value={info.category}
                onChange={handleChange}
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="">Select Category</option>
                <option value="Popcorn">Popcorn</option>
                <option value="Drink">Drink</option>
                <option value="Snack">Snack</option>
                <option value="Combo">Combo</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Price (VND)
              </label>
              <input
                type="number"
                name="price"
                value={info.price}
                onChange={handleChange}
                placeholder="e.g. 65000"
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stock"
                value={info.stock}
                onChange={handleChange}
                placeholder="e.g. 100"
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Status
              </label>
              <select
                name="status"
                value={info.status}
                onChange={handleChange}
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="">Select Status</option>
                <option value="Available">Available</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Image URL
              </label>
              <input
                type="text"
                name="image"
                value={info.image}
                onChange={handleChange}
                placeholder="https://example.com/image.png"
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="flex items-center gap-2 text-gray-700">
                <input
                  type="checkbox"
                  name="isCombo"
                  checked={info.isCombo}
                  onChange={handleChange}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium">This is a combo product</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Check this box if this product is a combination of multiple items
              </p>
            </div>
          </div>

          {info.image && (
            <div className="mt-4 flex justify-center">
              <img
                src={info.image}
                alt="Product Preview"
                className="h-40 object-contain rounded border border-gray-200"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/200x200?text=Image+Error";
                }}
              />
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              {Entry}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;