import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { FaPlus, FaTrash } from "react-icons/fa";
import { formatCurrency } from "../utils/formatUtils";

const AddOrderModal = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [items, setItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [customer, setCustomer] = useState({
    name: "",
    phone: ""
  });
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [newItem, setNewItem] = useState({
    product_id: "",
    name: "",
    price: 0,
    quantity: 1
  });

  // Reset form when modal closes
  // Thêm vào phần khai báo state
  const [status, setStatus] = useState("Chưa thanh toán");
  
  // Thêm vào phần reset form
  useEffect(() => {
    if (!isOpen) {
      setItems([]);
      setTotalAmount(0);
      setCustomer({ name: "", phone: "" });
      setPaymentMethod("");
      setStatus("Chưa thanh toán"); // Reset trạng thái
      setNewItem({
        product_id: "",
        name: "",
        price: 0,
        quantity: 1
      });
    } else {
      // Fetch available products
      fetchProducts();
    }
  }, [isOpen]);

  // Fetch available products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/product");
      const data = await response.json();
      
      if (data && Array.isArray(data.data)) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total amount when items change
  useEffect(() => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotalAmount(total);
  }, [items]);

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
  };

  // Trong hàm handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit button clicked");
    
    if (items.length === 0) {
      alert("Vui lòng thêm ít nhất một sản phẩm vào đơn hàng");
      return;
    }
    
    try {
      setLoading(true);
      console.log("Creating invoice...");
      
      // Step 1: Create the invoice
      const createResponse = await fetch("http://localhost:3000/invoice/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          note: `Customer: ${customer.name} - ${customer.phone}`,
          status: status
        })
      });
      
      console.log("Create response:", createResponse);
      
      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        console.error("Error data:", errorData);
        throw new Error(errorData.message || "Failed to create invoice");
      }
      
      const invoiceData = await createResponse.json();
      const invoiceId = invoiceData.data.id;
      
      // Step 2: Add products to the invoice
      for (const item of items) {
        await fetch(`http://localhost:3000/invoice/${invoiceId}/product`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            product_id: item.product_id,
            quantity: item.quantity
          })
        });
      }
      
      // Step 3: Process payment
      await fetch(`http://localhost:3000/invoice/payment/${invoiceId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          paymentMethod: paymentMethod || "Cash"
        })
      });
      
      // Call the parent handler
      if (typeof onSave === 'function') {
        onSave();
      }
      
      onClose();
      alert("Đơn hàng đã được tạo thành công!");
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Không thể tạo đơn hàng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Handle product selection
  const handleProductChange = (e) => {
    const productId = e.target.value;
    const selectedProduct = products.find(p => p.id.toString() === productId);
    
    if (selectedProduct) {
      setNewItem({
        product_id: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        quantity: 1
      });
    } else {
      setNewItem({
        product_id: "",
        name: "",
        price: 0,
        quantity: 1
      });
    }
  };

  // Add new item to the order
  const addItem = () => {
    if (!newItem.product_id) {
      alert("Vui lòng chọn sản phẩm");
      return;
    }
    
    // Check if the product already exists in the order
    const existingItemIndex = items.findIndex(item => item.product_id === newItem.product_id);
    
    if (existingItemIndex !== -1) {
      // Update quantity if product already exists
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += newItem.quantity;
      setItems(updatedItems);
    } else {
      // Add new product
      setItems([...items, { ...newItem, id: Date.now() }]);
    }
    
    // Reset selection
    setNewItem({
      product_id: "",
      name: "",
      price: 0,
      quantity: 1
    });
  };

  // Remove item from order
  const removeItem = (itemId) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  // Update item quantity
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setItems(items.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white rounded-lg w-[700px] max-w-[95%] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b sticky top-0 bg-white px-5 py-3 z-10">
          <h3 className="font-semibold text-lg">Tạo đơn hàng mới</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <IoClose size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Tên khách hàng
              </label>
              <input
                type="text"
                name="name"
                value={customer.name}
                onChange={handleCustomerChange}
                placeholder="Ví dụ: Nguyễn Văn A"
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Số điện thoại
              </label>
              <input
                type="text"
                name="phone"
                value={customer.phone}
                onChange={handleCustomerChange}
                placeholder="Ví dụ: 0987654321"
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Phương thức thanh toán
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="">Chọn phương thức thanh toán</option>
                <option value="Cash">Tiền mặt</option>
                <option value="Card">Thẻ tín dụng</option>
                <option value="Banking">Chuyển khoản</option>
              </select>
            </div>
          </div>

          {/* Items Section */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-800 mb-2">Danh sách sản phẩm</h4>
            
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <div className="grid grid-cols-12 gap-2 mb-3">
                <div className="col-span-5">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Trạng thái đơn hàng
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  >
                    <option value="Chưa thanh toán">Chưa thanh toán</option>
                    <option value="Đã thanh toán">Đã thanh toán</option>
                    <option value="Đã hủy">Đã hủy</option>
                  </select>
                </div>
                  <label className="block text-gray-700 text-xs font-medium mb-1">
                    Sản phẩm
                  </label>
                  <select
                    value={newItem.product_id}
                    onChange={handleProductChange}
                    className="border border-gray-300 rounded-md p-1.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Chọn sản phẩm</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {formatCurrency(product.price)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-3">
                  <label className="block text-gray-700 text-xs font-medium mb-1">
                    Giá (VND)
                  </label>
                  <input
                    type="number"
                    value={newItem.price}
                    readOnly
                    className="border border-gray-300 rounded-md p-1.5 w-full text-sm bg-gray-100"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-700 text-xs font-medium mb-1">
                    Số lượng
                  </label>
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})}
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
            
            {/* Items List */}
            {items.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sản phẩm
                      </th>
                      <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Đơn giá
                      </th>
                      <th scope="col" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SL
                      </th>
                      <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thành tiền
                      </th>
                      <th scope="col" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Xóa
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="w-12 text-center border rounded p-1 text-sm"
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 bg-gray-100 rounded-md">
                Chưa có sản phẩm nào trong đơn hàng
              </div>
            )}

            {/* Order Summary */}
            {items.length > 0 && (
              <div className="mt-4 flex justify-end">
                <div className="w-64 bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Tổng số lượng:</span>
                    <span className="font-medium">{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-sm font-medium">Tổng tiền:</span>
                    <span className="font-bold text-green-600">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Form Actions */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 mr-2"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={loading || items.length === 0}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </span>
              ) : (
                "Tạo đơn hàng"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOrderModal;

