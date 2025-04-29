import { BiSolidPencil } from "react-icons/bi";
import { MdDelete, MdContentCopy } from "react-icons/md";
import { formatCurrency } from "../utils/formatUtils";
import { format } from "date-fns";

const TablePromotions = ({
  columnNames,
  promotions,
  setOpen,
  setPromotionInfo,
  changeEntry,
  handleDelete,
}) => {
  const promotionStatusColor = {
    "Active": "bg-green-100 text-green-800",
    "Scheduled": "bg-blue-100 text-blue-800",
    "Expired": "bg-gray-100 text-gray-800",
    "Disabled": "bg-red-100 text-red-800"
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    return format(new Date(dateString), "dd/MM/yyyy");
  };

  // Format validity period
  const getValidityPeriod = (startDate, endDate) => {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  // Format discount based on type
  const formatDiscount = (type, value) => {
    if (type === "Percentage") {
      return `${value}%`;
    } else {
      return formatCurrency(value);
    }
  };

  // Copy promotion code to clipboard
  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    // You could add a toast notification here
    alert(`Copied: ${code}`);
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
          {promotions.map((promotion) => (
            <tr
              key={promotion.id}
              className="text-sm text-gray-700 border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-4 text-center">
                <div className="flex items-center justify-center space-x-1">
                  <span className="font-mono font-medium">{promotion.code}</span>
                  <button
                    onClick={() => copyToClipboard(promotion.code)}
                    className="text-gray-400 hover:text-blue-500"
                    title="Copy code"
                  >
                    <MdContentCopy size={14} />
                  </button>
                </div>
              </td>
              <td className="px-4 py-4 text-left">
                <div>
                  <p className="font-medium text-gray-800">{promotion.name}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{promotion.description}</p>
                </div>
              </td>
              <td className="px-4 py-4 text-center font-medium">
                {formatDiscount(promotion.type, promotion.value)}
                {promotion.minPurchase > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    Min: {formatCurrency(promotion.minPurchase)}
                  </div>
                )}
                {promotion.maxDiscount > 0 && promotion.type === "Percentage" && (
                  <div className="text-xs text-gray-500">
                    Max: {formatCurrency(promotion.maxDiscount)}
                  </div>
                )}
              </td>
              <td className="px-4 py-4 text-center text-xs">
                {getValidityPeriod(promotion.startDate, promotion.endDate)}
              </td>
              <td className="px-4 py-4 text-center">
                <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                  {promotion.applyTo}
                </span>
              </td>
              <td className="px-4 py-4 text-center">
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${promotionStatusColor[promotion.status]}`}>
                  {promotion.status}
                </span>
              </td>
              <td className="px-4 py-4 text-center text-sm">
                {promotion.usageCount}
              </td>
              <td className="px-4 py-4 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <button
                    className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                    onClick={() => {
                      changeEntry(["Edit promotion", "Save"]);
                      setPromotionInfo(promotion);
                      setOpen(true);
                    }}
                    title="Edit"
                  >
                    <BiSolidPencil />
                  </button>
                  <button
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    onClick={() => {
                      handleDelete(promotion.id);
                    }}
                    title="Delete"
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

export default TablePromotions;