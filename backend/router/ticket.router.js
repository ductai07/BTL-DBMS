const express = require('express');
const router = express.Router();
const Controller = require('../controller/ticket.controller');

// Lấy danh sách vé
router.get('/', Controller.index);

// Xem chi tiết vé
router.get('/detail/:id', Controller.detail);

// Thêm vé mới (không liên kết với hóa đơn)
router.post('/add', Controller.add);

// Hủy vé
router.delete('/cancel/:id', Controller.cancel);

// Lấy vé theo lịch chiếu
router.get('/by-showtime/:showtimeId', Controller.getByShowtime);

module.exports = router;