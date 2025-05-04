const express = require('express');
const router = express.Router();
const Controller = require('../controller/seat.controller');

// Lấy danh sách ghế với tìm kiếm, sắp xếp, phân trang
router.get('/', Controller.index);

// Xem chi tiết ghế
router.get('/detail/:id', Controller.detail);

// Đổi trạng thái ghế
router.patch('/change-status/:id', Controller.changeStatus);

// Thêm ghế mới
router.post('/add', Controller.add);

// Sửa thông tin ghế
router.patch('/edit/:id', Controller.edit);

// Xóa ghế
router.delete('/delete/:id', Controller.delete);

// Kiểm tra tình trạng ghế theo lịch chiếu
router.get('/by-showtime/:showtimeId', Controller.getSeatsByShowtime);

module.exports = router;