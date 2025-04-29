import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { FaPlus, FaTrash } from "react-icons/fa";
import { formatCurrency } from "../utils/formatUtils";

const AddOrderModal = ({
  title,
  isOpen,
  onClose,
  onAddOrder,
  info,
  setInfo,
  Entry,
}) => {
  const [items, setItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [newItem, setNewItem] = useState({
    name: "",
    price: 0,
    quantity: 1,
    id: Date.now()
  });

  // Reset form when modal closes or when editing a different order
  useEffect(() => {
    if (!isOpen) {
      setItems([]);
      setTotalAmount(0);
      setNewItem({
        name: "",
        price: 0,
        quantity: 1,
        id: Date.now()
      });
    } else if (info && info.items) {
      // If editing an existing order, load its items
      setItems(info.items);
      calculateTotal(info.items);
    }
  }, [isOpen, info]);

  // Calculate total amount when items change
  const calculateTotal = (itemsArray) => {
    const total = itemsArray.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotalAmount(total);
    return total;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInfo({ ...info, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Generate order number if it's a new order
    let orderNumber = info.orderNumber;
    if (!orderNumber) {
      const now = new Date();
      const year = now.getFullYear();
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      orderNumber = `ORD-${year}-${randomDigits}`;
    }
    
    onAddOrder({
      ...info,
      orderNumber,
      items,
      totalAmount,
      id: info.id || Date.now(),
    });
    onClose();
  };

  // Handle new item input changes
  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ 
      ...newItem, 
      [name]: name === "price" || name === "quantity" ? Number(value) : value 
    });
  };

  // Add new item to the order
  const addItem = () => {
    if (newItem.name && newItem.price > 0) {
      const updatedItems = [...items, { ...newItem, id: Date.now() }];
      setItems(updatedItems);
      calculateTotal(updatedItems);
      
      // Reset new item form
      setNewItem({
        name: "",
        price: 0,
        quantity: 1,
        id: Date.now()
      });
    }
  };

  // Remove item from order
  const removeItem = (itemId) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    setItems(updatedItems);
    calculateTotal(updatedItems);
  };

  // Update item quantity
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedItems = items.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    
    setItems(updatedItems);
    calculateTotal(updatedItems);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white rounded-lg w-[700px] max-w-[95%] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b sticky top-0 bg-white px-5 py-3 z-10">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <IoClose size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Customer Name
              </label>
              <input
                type="text"
                name="customerName"
                value={info.customerName || ""}
                onChange={handleChange}
                placeholder="e.g. Nguyễn Văn A"
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={info.paymentMethod || ""}
                onChange={handleChange}
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="">Select Payment Method</option>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Banking App">Banking App</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Date & Time
              </label>
              <input
                type="datetime-local"
                name="orderDate"
                value={info.orderDate ? new Date(info.orderDate).toISOString().slice(0, 16) : ""}
                onChange={handleChange}
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
                value={info.status || ""}
                onChange={handleChange}
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="">Select Status</option>
                <option value="Processing">Processing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Items Section */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-800 mb-2">Order Items</h4>
            
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <div className="grid grid-cols-12 gap-2 mb-3">
                <div className="col-span-5">
                  <label className="block text-gray-700 text-xs font-medium mb-1">
                    Item Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newItem.name}
                    onChange={handleItemChange}
                    placeholder="e.g. Ticket or Product name"
                    className="border border-gray-300 rounded-md p-1.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-gray-700 text-xs font-medium mb-1">
                    Price (VND)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={newItem.price}
                    onChange={handleItemChange}
                    placeholder="e.g. 120000"
                    className="border border-gray-300 rounded-md p-1.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-700 text-xs font-medium mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={newItem.quantity}
                    onChange={handleItemChange}
                    min="1"
                    className="border border-gray-300 rounded-md p-1.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div className="col-span-2 flex items-end">
                  <button
                    type="button"
                    onClick={addItem}
                    className="bg-blue-500 text-white p-2 rounded-md w-full flex items-center justify-center hover:bg-blue-600"
                  >
                    <FaPlus size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Item List */}
            {items.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-xs text-gray-700 border-b">
                      <th className="px-3 py-2 text-left">Item</th>
                      <th className="px-3 py-2 text-center">Price</th>
                      <th className="px-3 py-2 text-center">Qty</th>
                      <th className="px-3 py-2 text-right">Subtotal</th>
                      <th className="px-3 py-2 text-center w-10">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b last:border-b-0">
                        <td className="px-3 py-2 text-left">{item.name}</td>
                        <td className="px-3 py-2 text-center">{formatCurrency(item.price)}</td>
                        <td className="px-3 py-2 text-center">
                          <div className="flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-1 text-gray-500 hover:text-blue-500"
                            >
                              -
                            </button>
                            <span className="mx-1 w-6 text-center">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-1 text-gray-500 hover:text-blue-500"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right font-medium">
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTrash size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-medium">
                      <td colSpan="3" className="px-3 py-2 text-right">
                        Total:
                      </td>
                      <td className="px-3 py-2 text-right text-green-700">
                        {formatCurrency(totalAmount)}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 bg-gray-50 rounded-md text-gray-500 border border-dashed border-gray-300">
                No items added yet. Add items to create an order.
              </div>
            )}
          </div>

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
              disabled={items.length === 0}
              className={`px-4 py-2 rounded-md ${
                items.length === 0 
                  ? 'bg-gray-400 cursor-not-allowed text-white' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {Entry}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOrderModal;