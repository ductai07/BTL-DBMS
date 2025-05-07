const express = require('express');
const router = express.Router();
const Controller = require('../controller/showtime.controller');

// Lấy danh sách lịch chiếu với tìm kiếm, sắp xếp, phân trang
router.get('/', Controller.index);

// Xem chi tiết lịch chiếu
router.get('/detail/:id', Controller.detail);

// Thêm lịch chiếu mới
router.post('/add', Controller.add);

// Sửa thông tin lịch chiếu
router.patch('/edit/:id', Controller.edit);

// Xóa lịch chiếu
router.delete('/delete/:id', Controller.delete);

// Lấy vé đã bán theo lịch chiếu
router.get('/tickets/:id', Controller.getTickets);

// Lấy danh sách ghế theo lịch chiếu (để hiển thị sơ đồ ghế)
router.get('/:id/seats', Controller.getSeats);

// Lấy thông tin phim và phòng của lịch chiếu
router.get('/:id/info', Controller.getInfo);

// Lấy danh sách các ngày chiếu
router.get('/dates', Controller.getDates);

module.exports = router;