const express = require('express');
const router = express.Router();
const Controller = require('../controller/ticket.controller');

// Lấy danh sách vé với tìm kiếm, sắp xếp, phân trang
router.get('/', Controller.index);

// Xem chi tiết vé
router.get('/detail/:id', Controller.detail);

// Thêm vé mới
router.post('/add', Controller.add);

// Sửa thông tin vé
router.patch('/edit/:id', Controller.edit);

// Xóa vé
router.delete('/delete/:id', Controller.delete);

// Lấy danh sách vé theo lịch chiếu
router.get('/by-showtime/:showtimeId', Controller.getTicketsByShowtime);

module.exports = router;