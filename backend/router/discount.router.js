const express = require('express');
const router = express.Router();
const Controller = require('../controller/discount.controller');

// Lấy danh sách khuyến mãi với tìm kiếm, sắp xếp, phân trang
router.get('/', Controller.index);

// Xem chi tiết khuyến mãi
router.get('/detail/:id', Controller.detail);

// Thêm khuyến mãi mới
router.post('/add', Controller.add);

// Sửa thông tin khuyến mãi
router.patch('/edit/:id', Controller.edit);

// Xóa khuyến mãi
router.delete('/delete/:id', Controller.delete);


module.exports = router;