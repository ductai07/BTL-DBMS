const express = require('express');
const router = express.Router();
const Controller = require('../controller/movie.controller');

// Lấy danh sách phim với tìm kiếm, sắp xếp, phân trang
router.get('/', Controller.index);

// Xem chi tiết phim
router.get('/detail/:id', Controller.detail);

// Thêm phim mới
router.post('/add', Controller.add);

// Sửa thông tin phim
router.patch('/edit/:id', Controller.edit);

// Xóa phim
router.delete('/delete/:id', Controller.delete);

// Lấy lịch chiếu của phim
router.get('/showtimes/:id', Controller.getShowtimes);

module.exports = router;