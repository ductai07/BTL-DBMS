import React from "react";
import { FaEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { formatCurrency } from "../utils/formatUtils";

const TableProducts = ({
  columnNames,
  products,
  setOpen,
  setInfoProduct,
  changeEntry,
  handleDelete,
}) => {
  // Get status class for coloring
  const getStatusClass = (status) => {
    switch (status) {
      case "Còn hàng":
        return "bg-green-100 text-green-800";
      case "Hết hàng":
        return "bg-red-100 text-red-800";
      case "Sắp hết":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md overflow-x-auto">
      <h3 className="text-lg font-semibold mb-4">Danh sách sản phẩm</h3>
      <table className="w-full text-left">
        <thead>
          <tr className="text-sm text-gray-500 border-b">
            {columnNames.map((col) => (
              <th key={col} className="py-2 px-4">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map((product) => (
              <tr
                key={product.id}
                className="border-b text-sm text-gray-700 hover:bg-gray-50"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-10 w-10 rounded object-cover mr-2"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded bg-gray-200 mr-2 flex items-center justify-center text-xs">
                        No img
                      </div>
                    )}
                    {product.name}
                  </div>
                </td>
                <td className="py-3 px-4">{product.category}</td>
                <td className="py-3 px-4">{formatCurrency(product.price)}</td>
                <td className="py-3 px-4">{product.quantity}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(
                      product.status
                    )}`}
                  >
                    {product.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="flex gap-2">
                    <span
                      className="hover:cursor-pointer hover:text-blue-600"
                      onClick={() => {
                        setOpen(true);
                        changeEntry(["Edit product", "Save"]);
                        setInfoProduct(product);
                      }}
                    >
                      <FaEdit />
                    </span>
                    <span
                      className="hover:cursor-pointer hover:text-red-600"
                      onClick={() => handleDelete(product.id)}
                    >
                      <MdDeleteForever size={16} />
                    </span>
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columnNames.length} className="py-4 text-center text-gray-500">
                No products found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TableProducts;