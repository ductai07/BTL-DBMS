const express = require('express');
const router = express.Router();
const Controller = require('../controller/customer.controller');

// Lấy danh sách khách hàng
router.get('/', Controller.index);

// Xem chi tiết thông tin khách hàng
router.get('/detail/:id', Controller.detail);

// Thêm khách hàng mới
router.post('/add', Controller.add);

// Cập nhật thông tin khách hàng
router.patch('/update/:id', Controller.update);

// Xóa khách hàng
router.delete('/delete/:id', Controller.delete);

module.exports = router;