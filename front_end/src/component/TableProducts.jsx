import { BiSolidPencil } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import { formatCurrency } from "../utils/formatUtils";

const TableProducts = ({
  columnNames,
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
    <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
      <table className="w-full table-auto">
        <thead>
          <tr className="text-sm font-medium text-gray-700 border-b border-gray-200 bg-gray-50">
            {columnNames.map((name, index) => (
              <th
                key={index}
                className="px-4 py-4 text-center"
              >
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product.id}
              className="text-sm text-gray-700 border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-4 text-center">
                <div className="flex justify-center">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-16 h-16 object-contain rounded"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/100x100?text=No+Image";
                    }}
                  />
                </div>
              </td>
              <td className="px-4 py-4 text-left">
                <div>
                  <p className="font-medium text-gray-800">{product.name}</p>
                  {product.isCombo && <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full mt-1 inline-block">Combo</span>}
                </div>
              </td>
              <td className="px-4 py-4 text-center">{product.category}</td>
              <td className="px-4 py-4 text-center font-medium text-green-700">{formatCurrency(product.price)}</td>
              <td className="px-4 py-4 text-center">
                {product.stock === 0 ? (
                  <span className="text-red-600 font-medium">{product.stock}</span>
                ) : product.stock <= 10 ? (
                  <span className="text-yellow-600 font-medium">{product.stock}</span>
                ) : (
                  <span>{product.stock}</span>
                )}
              </td>
              <td className="px-4 py-4 text-center">
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${productStatusColor[product.status]}`}>
                  {product.status}
                </span>
              </td>
              <td className="px-4 py-4 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <button
                    className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                    onClick={() => {
                      changeEntry(["Edit product", "Edit"]);
                      setProductInfo(product);
                      setOpen(true);
                    }}
                  >
                    <BiSolidPencil />
                  </button>
                  <button
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    onClick={() => {
                      handleDelete(product.id);
                    }}
                  >
                    <MdDelete />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableProducts;