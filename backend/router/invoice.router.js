const express = require('express');
const router = express.Router();
const Controller = require('../controller/invoice.controller');

// Lấy danh sách hóa đơn
router.get('/', Controller.index);

// Xem chi tiết hóa đơn
router.get('/detail/:id', Controller.detail);

// Tạo hóa đơn mới
router.post('/create', Controller.create);

// Thêm vé vào hóa đơn
router.post('/:id/ticket', Controller.addTicket);

// Xóa vé khỏi hóa đơn
router.delete('/:id/ticket/:ticketId', Controller.removeTicket);

// Thêm sản phẩm vào hóa đơn
router.post('/:id/product', Controller.addProduct);

// Xóa sản phẩm khỏi hóa đơn
router.delete('/:id/product/:productUsageId', Controller.removeProduct);

// Thanh toán hóa đơn
router.patch('/payment/:id', Controller.payment);

module.exports = router;