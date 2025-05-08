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
        discountValue: 0,
        startDate: "",
        endDate: "",
        quantity: 0,
        description: "",
        id: Date.now(),
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
    
    // Convert numeric fields to numbers
    if (type === 'number') {
      setInfo({ ...info, [name]: parseFloat(value) || 0 });
    } else {
      setInfo({ ...info, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    onAddPromotion({
      ...info,
      quantity: info.quantity || 0,
      id: info.id || Date.now(),
    });
    onClose();
  };

  // Calculate discount based on type and preview amount
  const calculatePreview = (type, discountValue, sampleAmount) => {
    if (!type || !discountValue || !sampleAmount) {
      setPreviewDiscount(0);
      return;
    }
    
    if (type === "Percentage") {
      const discountAmount = sampleAmount * (discountValue / 100);
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
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <IoClose size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <h4 className="font-medium text-gray-700 mb-3 pb-2 border-b">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Promotion Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={info.name || ''}
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
                    value={info.quantity || ''}
                    onChange={handleChange}
                    placeholder="e.g. 100"
                    className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                    min="0"
                    required
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={info.description || ''}
                  onChange={handleChange}
                  placeholder="Describe the promotion"
                  className="border border-gray-300 rounded-md p-2 w-full h-20 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-3 pb-2 border-b">Discount Configuration</h4>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Discount Type *
                </label>
                <select
                  name="type"
                  value={info.type || ''}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Percentage">Percentage</option>
                  <option value="Fixed">Fixed Amount</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  {info.type === "Percentage" ? "Percentage Value *" : "Discount Amount (VND) *"}
                </label>
                <input
                  type="number"
                  name="discountValue"
                  value={info.discountValue || ''}
                  onChange={handleChange}
                  placeholder={info.type === "Percentage" ? "e.g. 25" : "e.g. 50000"}
                  className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                  min="0"
                  max={info.type === "Percentage" ? "100" : ""}
                />
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-3 pb-2 border-b">Validity Period</h4>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={info.startDate || ''}
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
                  value={info.endDate || ''}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-4">
            <h4 className="font-medium text-gray-700 mb-3">Discount Preview</h4>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Sample Purchase Amount (VND)
                </label>
                <input
                  type="number"
                  value={previewSample}
                  onChange={(e) => setPreviewSample(parseFloat(e.target.value) || 0)}
                  className="border border-gray-300 rounded-md p-2 w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  min="0"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Discount Type:</p>
                  <p className="font-medium">{info.type || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Discount Value:</p>
                  <p className="font-medium">
                    {info.type === "Percentage" 
                      ? `${info.discountValue || 0}%` 
                      : formatCurrency(info.discountValue || 0, "VND")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sample Purchase:</p>
                  <p className="font-medium">{formatCurrency(previewSample, "VND")}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Discount Amount:</p>
                  <p className="font-medium">{formatCurrency(previewDiscount, "VND")}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Final Price:</p>
                  <p className="font-medium text-green-600">{formatCurrency(previewSample - previewDiscount, "VND")}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Quantity:</p>
                  <p className="font-medium">{info.quantity || 0}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              {info.id ? "Update Promotion" : "Add Promotion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPromotionModal;