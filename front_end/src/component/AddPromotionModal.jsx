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
        code: "",
        name: "",
        type: "",
        value: 0,
        minPurchase: 0,
        maxDiscount: 0,
        startDate: "",
        endDate: "",
        status: "",
        usageCount: 0,
        applyTo: "",
        description: "",
        id: Date.now(),
      });
      setPreviewSample(100000);
    } else {
      calculatePreview(info.type, info.value, previewSample, info.maxDiscount);
    }
  }, [isOpen, setInfo]);

  // Calculate preview discount when inputs change
  useEffect(() => {
    calculatePreview(info.type, info.value, previewSample, info.maxDiscount);
  }, [info.type, info.value, previewSample, info.maxDiscount]);

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
    
    // Generate a code if not provided (for new promotions)
    let code = info.code;
    if (!code) {
      const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
      const namePart = info.name.substring(0, 4).toUpperCase();
      code = `${namePart}${randomPart}`;
    }
    
    onAddPromotion({
      ...info,
      code,
      usageCount: info.usageCount || 0,
      id: info.id || Date.now(),
    });
    onClose();
  };

  // Calculate discount based on type and preview amount
  const calculatePreview = (type, value, sampleAmount, maxDiscount) => {
    if (!type || !value || !sampleAmount) {
      setPreviewDiscount(0);
      return;
    }
    
    if (type === "Percentage") {
      const discountAmount = sampleAmount * (value / 100);
      const finalDiscount = maxDiscount > 0 ? Math.min(discountAmount, maxDiscount) : discountAmount;
      setPreviewDiscount(finalDiscount);
    } else {
      // For fixed amount, the discount is just the value
      setPreviewDiscount(value);
    }
  };
  
  // Generate coupon code suggestion
  const generateCouponCode = () => {
    if (!info.name) {
      alert("Please enter a promotion name first");
      return;
    }
    
    const namePart = info.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    if (info.type === "Percentage") {
      setInfo({ ...info, code: `${namePart}${info.value}${randomPart}` });
    } else {
      const valueK = Math.floor(info.value / 1000);
      setInfo({ ...info, code: `${namePart}${valueK}K${randomPart}` });
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
                    Promotion Code *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="code"
                      value={info.code || ''}
                      onChange={handleChange}
                      placeholder="e.g. SUMMER25"
                      className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button 
                      type="button" 
                      onClick={generateCouponCode}
                      className="bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-xs hover:bg-gray-300"
                      title="Generate code based on name"
                    >
                      Generate
                    </button>
                  </div>
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
                  <option value="Fixed Amount">Fixed Amount</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  {info.type === "Percentage" ? "Percentage Value *" : "Discount Amount (VND) *"}
                </label>
                <input
                  type="number"
                  name="value"
                  value={info.value || ''}
                  onChange={handleChange}
                  placeholder={info.type === "Percentage" ? "e.g. 25" : "e.g. 50000"}
                  className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                  min="0"
                  max={info.type === "Percentage" ? "100" : ""}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Minimum Purchase Amount (VND)
                </label>
                <input
                  type="number"
                  name="minPurchase"
                  value={info.minPurchase || ''}
                  onChange={handleChange}
                  placeholder="e.g. 100000"
                  className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Leave as 0 for no minimum</p>
              </div>

              {info.type === "Percentage" && (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Maximum Discount Amount (VND)
                  </label>
                  <input
                    type="number"
                    name="maxDiscount"
                    value={info.maxDiscount || ''}
                    onChange={handleChange}
                    placeholder="e.g. 50000"
                    className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave as 0 for no maximum</p>
                </div>
              )}

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Apply To *
                </label>
                <select
                  name="applyTo"
                  value={info.applyTo || ''}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                >
                  <option value="">Select Scope</option>
                  <option value="All">All Items</option>
                  <option value="Tickets">Tickets Only</option>
                  <option value="Food & Drinks">Food & Drinks Only</option>
                </select>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-3 pb-2 border-b">Validity & Status</h4>

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
                  min={info.startDate}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Status *
                </label>
                <select
                  name="status"
                  value={info.status || ''}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Active">Active</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>

              {/* Preview Calculator */}
              <div className="mt-6 p-4 bg-blue-50 rounded-md">
                <h5 className="font-medium text-blue-800 mb-2">Discount Preview</h5>
                <div className="flex items-center mb-2">
                  <label className="text-sm text-gray-700 mr-2">Sample Order:</label>
                  <input
                    type="number"
                    value={previewSample}
                    onChange={(e) => setPreviewSample(Number(e.target.value) || 0)}
                    className="border border-gray-300 rounded-md p-1 w-24 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    min="0"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-600">Original Price:</div>
                  <div className="font-medium text-right">{formatCurrency(previewSample)}</div>
                  <div className="text-gray-600">Discount:</div>
                  <div className="font-medium text-right text-green-600">- {formatCurrency(previewDiscount)}</div>
                  <div className="text-gray-700 font-medium">Final Price:</div>
                  <div className="font-bold text-right">{formatCurrency(Math.max(0, previewSample - previewDiscount))}</div>
                </div>
                
                {info.minPurchase > 0 && previewSample < info.minPurchase && (
                  <div className="mt-2 text-sm text-yellow-600">
                    ⚠️ Minimum purchase amount not met
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end border-t pt-4">
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

export default AddPromotionModal;