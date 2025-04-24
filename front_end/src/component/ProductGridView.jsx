import { BiSolidPencil } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import { formatCurrency } from "../utils/formatUtils";

const ProductGridView = ({
  products,
  setOpen,
  setProductInfo,
  changeEntry,
  handleDelete,
}) => {
  const productStatusColor = {
    "Available": "bg-green-100 text-green-800",
    "Low Stock": "bg-yellow-100 text-yellow-800",
    "Out of Stock": "bg-red-100 text-red-800"
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <div 
          key={product.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="relative h-48 bg-gray-100">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-contain p-4" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/300x300?text=No+Image";
              }}
            />
            {product.isCombo && (
              <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                COMBO
              </span>
            )}
          </div>
          
          <div className="p-4">
            <h3 className="font-medium text-gray-800 mb-2 line-clamp-2 h-12">{product.name}</h3>
            
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600 text-sm">{product.category}</span>
              <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${productStatusColor[product.status]}`}>
                {product.status}
              </span>
            </div>
            
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-green-700">{formatCurrency(product.price)}</span>
              <span className="text-sm text-gray-500">Stock: {product.stock}</span>
            </div>
            
            <div className="flex justify-end space-x-2 mt-2 border-t pt-3">
              <button
                className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full"
                onClick={() => {
                  changeEntry(["Edit product", "Edit"]);
                  setProductInfo(product);
                  setOpen(true);
                }}
              >
                <BiSolidPencil />
              </button>
              <button
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full"
                onClick={() => {
                  handleDelete(product.id);
                }}
              >
                <MdDelete />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductGridView;