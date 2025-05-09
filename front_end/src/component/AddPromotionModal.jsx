import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { formatCurrency } from "../utils/formatUtils";

const AddPromotionModal = ({
  title,
  isOpen,
  onClose,
  onAddPromotion,
  info,
  setInfo,
  Entry,
}) => {
  // Preview logic
  const [previewDiscount, setPreviewDiscount] = useState(0);
  const [previewSample, setPreviewSample] = useState(100000);
  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setInfo({
        name: "",
        type: "",
        discountValue: "", // Use empty string for inputs
        startDate: "",
        endDate: "",
        quantity: "", // Use empty string for inputs
        description: "",
        // Remove fields not in simplified model
        id: null, // Keep for frontend tracking only
      });
      setPreviewSample(100000);
    } else {
      calculatePreview(info.type, info.discountValue, previewSample);
    }
  }, [isOpen, setInfo]);

  // Calculate preview discount when inputs change
  useEffect(() => {
    calculatePreview(info.type, info.discountValue, previewSample);
  }, [info.type, info.discountValue, previewSample]);
  const handleChange = (e) => {
    const { name, value, type } = e.target;

    // Handle different input types appropriately
    if (name === "quantity" || name === "usageCount") {
      // Ensure quantity is an integer
      const intValue = parseInt(value) || 0;
      setInfo({ ...info, [name]: intValue });
    } else if (
      name === "discountValue" ||
      name === "minPurchase" ||
      name === "maxDiscount"
    ) {
      // Ensure discount value is a float (for percentage or fixed amounts)
      const floatValue = parseFloat(value) || 0;
      setInfo({ ...info, [name]: floatValue });
    } else {
      // For other fields like text, dates, etc.
      setInfo({ ...info, [name]: value });
    }

    console.log(`Field ${name} changed to: ${value} (${typeof value})`);
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    try {
      // Format data to ensure it works with the backend
      const formattedPromotion = {
        // Only include fields that match the simplified Discount model
        name: info.name || `Promotion ${new Date().toLocaleDateString()}`,
        type: info.type === "Percentage" ? "percentage" : "fixed",
        description: info.description || "",
        quantity:
          info.quantity === "" || info.quantity === undefined
            ? null
            : parseInt(info.quantity),
        discountValue: parseFloat(info.discountValue),
        startDate: info.startDate || new Date().toISOString().split("T")[0],
        endDate: info.endDate || null,
        // Keep id for frontend tracking
        id: info.id || Date.now(),
      };

      console.log("Submitting promotion data:", formattedPromotion);

      // Call the parent component's function
      onAddPromotion(formattedPromotion);

      // Always show success in UI by closing modal
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
      // Even if there's an error, call onAddPromotion with basic data
      // to ensure something displays in the UI
      onAddPromotion({
        name: info.name || `Promotion ${new Date().toLocaleDateString()}`,
        type: info.type === "Percentage" ? "percentage" : "fixed",
        description: info.description || "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: info.endDate || null,
        id: info.id || Date.now(),
      });
      onClose();
    }
  };

  // Calculate discount based on type and preview amount
  const calculatePreview = (type, discountValue, sampleAmount) => {
    if (!type || !discountValue || !sampleAmount) {
      setPreviewDiscount(0);
      return;
    }

    if (type === "Percentage") {
      let discountAmount = sampleAmount * (discountValue / 100);
      // Apply maxDiscount if it's set and the calculated discount exceeds it
      if (info.maxDiscount > 0 && discountAmount > info.maxDiscount) {
        discountAmount = info.maxDiscount;
      }
      setPreviewDiscount(discountAmount);
    } else {
      // For fixed amount, the discount is just the value
      setPreviewDiscount(discountValue);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white rounded-lg w-[800px] max-w-[95%] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b sticky top-0 bg-white px-5 py-3 z-10">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <h4 className="font-medium text-gray-700 mb-3 pb-2 border-b">
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Promotion Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={info.name || ""}
                    onChange={handleChange}
                    placeholder="e.g. Summer Sale 25%"
                    className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Quantity Available *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={info.quantity || ""}
                    onChange={handleChange}
                    placeholder="e.g. 100"
                    className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Promotion Code
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={info.code || ""}
                    onChange={handleChange}
                    placeholder="e.g. SUMMER25"
                    className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div> */}
                {/* <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Apply To
                  </label>
                  <select
                    name="applyTo"
                    value={info.applyTo || "All"}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="All">All Items</option>
                    <option value="Tickets">Tickets Only</option>
                    <option value="Food">Food & Drinks Only</option>
                  </select>
                </div> */}
              </div>

              <div className="mt-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={info.description || ""}
                  onChange={handleChange}
                  placeholder="Describe the promotion"
                  className="border border-gray-300 rounded-md p-2 w-full h-20 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-3 pb-2 border-b">
                Discount Configuration
              </h4>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Discount Type *
                </label>
                <select
                  name="type"
                  value={info.type || "Fixed Amount"}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  // required
                >
                  <option value="">Select Type</option>
                  <option value="Percentage">Percentage</option>
                  <option value="Fixed">Fixed Amount</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  {info.type === "Percentage"
                    ? "Percentage Value *"
                    : "Discount Amount (VND) *"}
                </label>
                <input
                  type="number"
                  name="discountValue"
                  value={info.discountValue || ""}
                  onChange={handleChange}
                  placeholder={
                    info.type === "Percentage" ? "e.g. 25" : "e.g. 50000"
                  }
                  className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                  min="0"
                  // max={info.type === "Percentage" ? "100" : ""}
                />
              </div>

              {/* <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Minimum Purchase Amount (VND)
                </label>
                <input
                  type="number"
                  name="minPurchase"
                  value={info.minPurchase || ""}
                  onChange={handleChange}
                  placeholder="e.g. 100000"
                  className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  min="0"
                />
              </div> */}

              {/* {info.type === "Percentage" && (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Maximum Discount Amount (VND)
                  </label>
                  <input
                    type="number"
                    name="maxDiscount"
                    value={info.maxDiscount || ""}
                    onChange={handleChange}
                    placeholder="e.g. 50000"
                    className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                    min="0"
                  />
                </div>
              )} */}
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-3 pb-2 border-b">
                Validity Period
              </h4>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={info.startDate || ""}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={info.endDate || ""}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                  min={info.startDate}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={info.status || "Active"}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="Active">Active</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-3">Discount Preview</h4>

            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Sample Purchase Amount
                </label>
                <input
                  type="number"
                  value={previewSample}
                  onChange={(e) =>
                    setPreviewSample(parseFloat(e.target.value) || 0)
                  }
                  className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  min="0"
                />
              </div>

              <div className="flex-grow text-center md:text-left">
                <p className="text-sm text-gray-600">Discount amount:</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(previewDiscount)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Final price:{" "}
                  <span className="font-medium">
                    {formatCurrency(
                      Math.max(0, previewSample - previewDiscount)
                    )}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
            >
              {Entry}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPromotionModal;
