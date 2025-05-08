import React from "react";
import { formatCurrency } from "../utils/formatUtils";

const ProductDetailsModal = ({ isOpen, closeModal, product }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-800">Product Details</h2>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
            <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              {product.category || "Uncategorized"}
            </span>
          </div>

          <div>
            <p className="text-gray-600">{product.description || "No description provided"}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Price:</span>
              <span className="font-medium">{formatCurrency(product.price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status:</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  product.inStock
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {product.inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>
          </div>

          {product.image && (
            <div className="mt-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-auto rounded-lg shadow-sm"
              />
            </div>
          )}
          
          {/* Additional product details could be added here */}
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal; 