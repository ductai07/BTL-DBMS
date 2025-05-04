const express = require('express');
const router = express.Router();
const Controller = require('../controller/room.controller');

// Lấy danh sách phòng với tìm kiếm, sắp xếp, phân trang
router.get('/', Controller.index);

// Xem chi tiết phòng
router.get('/detail/:id', Controller.detail);

// Đổi trạng thái phòng
router.patch('/change-status/:id', Controller.changeStatus);

// Thêm phòng mới
router.post('/add', Controller.add);

// Sửa thông tin phòng
router.patch('/edit/:id', Controller.edit);

// Xóa phòng
router.delete('/delete/:id', Controller.delete);

// Lấy ghế trong phòng
router.get('/seats/:id', Controller.getSeats);

// Lấy lịch chiếu của phòng
router.get('/showtimes/:id', Controller.getShowtimes);

module.exports = router;