const express = require('express');
const router = express.Router();
const Controller = require('../controller/product.controller');

// Lấy danh sách sản phẩm với tìm kiếm, sắp xếp, phân trang
router.get('/', Controller.index);

// Xem chi tiết sản phẩm
router.get('/detail/:id', Controller.detail);

// Thêm sản phẩm mới
router.post('/add', Controller.add);

// Sửa thông tin sản phẩm
router.patch('/edit/:id', Controller.edit);

// Xóa sản phẩm
router.delete('/delete/:id', Controller.delete);

module.exports = router;