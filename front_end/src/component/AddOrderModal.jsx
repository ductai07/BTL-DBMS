import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { FaPlus, FaTrash } from "react-icons/fa";
import { formatCurrency } from "../utils/formatUtils";

const AddOrderModal = ({ isOpen, onClose, onSave }) => {
  const [items, setItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [customer, setCustomer] = useState({ name: "", phone: "" });
  const [paymentMethod, setPaymentMethod] = useState("");
  const [status, setStatus] = useState("Chưa thanh toán");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [tickets, setTickets] = useState([]);
  
  // Separate state for product item and ticket item
  const [productItem, setProductItem] = useState({
    product_id: "",
    name: "",
    price: 0,
    quantity: 1
  });
  
  const [ticketItem, setTicketItem] = useState({
    ticket_id: "",
    name: "",
    price: 0
  });

  // Reset form & fetch data when modal open/close
  useEffect(() => {
    if (!isOpen) {
      setItems([]);
      setTotalAmount(0);
      setCustomer({ name: "", phone: "" });
      setPaymentMethod("");
      setStatus("Chưa thanh toán");
      setProductItem({ product_id: "", name: "", price: 0, quantity: 1 });
      setTicketItem({ ticket_id: "", name: "", price: 0 });
    } else {
      fetchProducts();
      fetchTickets();
    }
  }, [isOpen]);

  // Fetch products
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

  // Fetch tickets
  const fetchTickets = async () => {
    try {
      const response = await fetch("http://localhost:3000/ticket?invoice_id=null");
      const data = await response.json();
      if (data && Array.isArray(data.data)) {
        setTickets(data.data);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  // Update total amount when items change
  useEffect(() => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotalAmount(total);
  }, [items]);

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductSelect = (e) => {
    const productId = e.target.value;
    const selectedProduct = products.find(p => p.id.toString() === productId);
    if (selectedProduct) {
      setProductItem({
        product_id: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        quantity: 1
      });
    } else {
      setProductItem({ product_id: "", name: "", price: 0, quantity: 1 });
    }
  };

  const handleTicketSelect = (e) => {
    const ticketId = e.target.value;
    const selectedTicket = tickets.find(t => t.id.toString() === ticketId);
    if (selectedTicket) {
      setTicketItem({
        ticket_id: selectedTicket.id,
        name: `Vé phim: ${selectedTicket.movieTitle} - Ghế: ${selectedTicket.seatPosition}`,
        price: selectedTicket.price
      });
    } else {
      setTicketItem({ ticket_id: "", name: "", price: 0 });
    }
  };

  const handleProductQuantityChange = (e) => {
    setProductItem({ 
      ...productItem, 
      quantity: parseInt(e.target.value) || 1 
    });
  };

  const addProductItem = () => {
    if (!productItem.product_id) {
      alert("Vui lòng chọn sản phẩm");
      return;
    }

    const selectedProduct = products.find(p => p.id.toString() === productItem.product_id.toString());
    if (selectedProduct) {
      const newItemToAdd = {
        id: Date.now() + 1,
        product_id: selectedProduct.id,
        ticket_id: "",
        name: selectedProduct.name,
        price: selectedProduct.price,
        quantity: productItem.quantity
      };

      // Check for duplicates
      const existingIndex = items.findIndex(item => 
        item.product_id && item.product_id.toString() === productItem.product_id.toString()
      );

      if (existingIndex !== -1) {
        // Update existing item
        const updatedItems = [...items];
        updatedItems[existingIndex].quantity += productItem.quantity;
        setItems(updatedItems);
      } else {
        // Add new item
        setItems([...items, newItemToAdd]);
      }

      // Reset product selection
      setProductItem({ product_id: "", name: "", price: 0, quantity: 1 });
    }
  };

  const addTicketItem = () => {
    if (!ticketItem.ticket_id) {
      alert("Vui lòng chọn vé");
      return;
    }

    const selectedTicket = tickets.find(t => t.id.toString() === ticketItem.ticket_id.toString());
    if (selectedTicket) {
      const newItemToAdd = {
        id: Date.now() + 2,
        product_id: "",
        ticket_id: selectedTicket.id,
        name: `Vé phim: ${selectedTicket.movieTitle} - Ghế: ${selectedTicket.seatPosition}`,
        price: selectedTicket.price,
        quantity: 1 // vé chỉ 1
      };

      // Check for duplicates
      const existingIndex = items.findIndex(item => 
        item.ticket_id && item.ticket_id.toString() === ticketItem.ticket_id.toString()
      );

      if (existingIndex !== -1) {
        // Vé đã tồn tại, hiển thị thông báo
        alert("Vé này đã được thêm vào đơn hàng");
      } else {
        // Add new ticket
        setItems([...items, newItemToAdd]);
      }

      // Reset ticket selection
      setTicketItem({ ticket_id: "", name: "", price: 0 });
    }
  };

  const updateQuantity = (id, quantity) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const removeItem = (id) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      alert("Vui lòng thêm ít nhất một sản phẩm hoặc vé vào đơn hàng");
      return;
    }
    try {
      setLoading(true);
      // Step 1: Create the invoice
      const createResponse = await fetch("http://localhost:3000/invoice/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note: `Customer: ${customer.name} - ${customer.phone}`,
          status: status
        })
      });
      if (!createResponse.ok) throw new Error("Failed to create invoice");
      const invoiceData = await createResponse.json();
      const invoiceId = invoiceData.data.id;
      
      // Step 2: Add products and tickets to the invoice
      for (const item of items) {
        if (item.product_id) {
          await fetch(`http://localhost:3000/invoice/${invoiceId}/product`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product_id: item.product_id, quantity: item.quantity })
          });
        } else if (item.ticket_id) {
          await fetch(`http://localhost:3000/invoice/${invoiceId}/ticket`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ticket_id: item.ticket_id })
          });
        }
      }
      
      // Step 3: Process payment
      await fetch(`http://localhost:3000/invoice/payment/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: paymentMethod || "Cash" })
      });
      
      if (typeof onSave === 'function') onSave();
      onClose();
      alert("Đơn hàng đã được tạo thành công!");
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Không thể tạo đơn hàng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
  
    // Nếu chuỗi là dạng full datetime thì cắt lấy phần giờ
    if (timeString.includes("T")) {
      const timePart = timeString.split("T")[1]?.split(".")[0];
      if (timePart) return timePart.slice(0, 5); // Lấy "hh:mm"
    }
  
    // Nếu chuỗi là dạng "hh:mm:ss" thì rút gọn lại
    if (timeString.length >= 5) {
      return timeString.slice(0, 5);
    }
  
    return timeString;
  };
  

  return (
    isOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            onClick={onClose}
          >
            <IoClose size={24} />
          </button>
          <h2 className="text-xl font-bold mb-4">Tạo đơn hàng mới</h2>

          {/* Customer Input */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium">Tên khách hàng</label>
              <input
                name="name"
                value={customer.name}
                onChange={handleCustomerChange}
                className="w-full border border-gray-300 rounded p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Số điện thoại</label>
              <input
                name="phone"
                value={customer.phone}
                onChange={handleCustomerChange}
                className="w-full border border-gray-300 rounded p-2 text-sm"
              />
            </div>
          </div>

          {/* Product / Ticket Selector */}
          <div className="grid grid-cols-12 gap-2 mb-4 items-end">
            {/* Product Selector */}
            <div className="col-span-6">
              <label className="text-sm font-medium">Sản phẩm</label>
              <select
                value={productItem.product_id}
                onChange={handleProductSelect}
                className="w-full border p-2 rounded text-sm"
              >
                <option value="">Chọn sản phẩm</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {formatCurrency(p.price)}
                  </option>
                ))}
              </select>
              <input 
                type="number" 
                value={productItem.price} 
                readOnly 
                className="w-full bg-gray-100 border p-2 rounded text-sm mt-1" 
              />
              <input 
                type="number" 
                min={1} 
                value={productItem.quantity} 
                onChange={handleProductQuantityChange} 
                className="w-full border p-2 rounded text-sm mt-1" 
              />
              <button 
                type="button" 
                onClick={addProductItem} 
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mt-1"
              >
                Thêm sản phẩm
              </button>
            </div>

            {/* Ticket Selector */}
            <div className="col-span-6">
              <label className="text-sm font-medium">Vé</label>
              <select
                value={ticketItem.ticket_id}
                onChange={handleTicketSelect}
                className="w-full border p-2 rounded text-sm"
              >
                <option value="">Chọn vé</option>
                {tickets.map((t) => (
                  <option key={t.id} value={t.id}>
                    Vé #{t.id} - {t.movieTitle} - Ghế {t.seatPosition} - Khung giờ {formatTime(t.showTime)} - {formatCurrency(t.price)}
                  </option>
                ))}
              </select>
              <input 
                type="number" 
                value={ticketItem.price} 
                readOnly 
                className="w-full bg-gray-100 border p-2 rounded text-sm mt-1" 
              />
              <button 
                type="button" 
                onClick={addTicketItem} 
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mt-1"
              >
                Thêm vé
              </button>
            </div>
          </div>

          {/* Items Table */}
          {items.length > 0 ? (
            <div className="border rounded mb-4">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-2">Tên</th>
                    <th className="text-right p-2">Đơn giá</th>
                    <th className="text-center p-2">SL</th>
                    <th className="text-right p-2">Thành tiền</th>
                    <th className="text-center p-2">Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-2">{item.name}</td>
                      <td className="p-2 text-right">{formatCurrency(item.price)}</td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                          className="w-12 text-center border rounded p-1"
                        />
                      </td>
                      <td className="p-2 text-right">
                        {formatCurrency(item.price * item.quantity)}
                      </td>
                      <td className="p-2 text-center">
                        <button onClick={() => removeItem(item.id)} className="text-red-600">
                          <FaTrash size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-500 bg-gray-100 p-4 rounded mb-4">
              Chưa có sản phẩm nào trong đơn hàng
            </div>
          )}

          {/* Summary */}
          {items.length > 0 && (
            <div className="flex justify-end mb-4">
              <div className="w-64 bg-gray-50 p-4 rounded">
                <div className="flex justify-between mb-2 text-sm">
                  <span>Tổng SL:</span>
                  <span className="font-medium">
                    {items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2 text-sm font-bold text-green-600">
                  <span>Tổng tiền:</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment method selector */}
          {items.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Phương thức thanh toán</label>
              <select
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
                className="w-full border p-2 rounded text-sm"
              >
                <option value="">Chọn phương thức thanh toán</option>
                <option value="Cash">Tiền mặt</option>
                <option value="Card">Thẻ</option>
                <option value="Banking">Chuyển khoản</option>
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded mr-2 hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={loading || items.length === 0}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Đang xử lý...
                </span>
              ) : (
                "Tạo đơn hàng"
              )}
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default AddOrderModal;