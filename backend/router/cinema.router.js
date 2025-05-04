const express = require('express');
const router = express.Router();
const Controller = require('../controller/cinnema.controller');

// Lấy danh sách rạp với tìm kiếm, sắp xếp, phân trang
router.get('/', Controller.index);

// Xem chi tiết rạp
router.get('/detail/:id', Controller.detail);

// Đổi trạng thái rạp
router.patch('/change-status/:id', Controller.changeStatus);

// Thêm rạp mới
router.post('/add', Controller.add);

// Sửa thông tin rạp
router.patch('/edit/:id', Controller.edit);

// Xóa rạp
router.delete('/delete/:id', Controller.delete);

// Lấy phòng theo rạp
router.get('/room', Controller.getRooms);

module.exports = router;