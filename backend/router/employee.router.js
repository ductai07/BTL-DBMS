const express = require('express');
const router = express.Router();
const Controller = require('../controller/employee.controller');

// Lấy danh sách nhân viên
router.get('/', Controller.index);

// Xem chi tiết thông tin nhân viên
router.get('/detail/:id', Controller.detail);

// Thêm nhân viên mới
router.post('/add', Controller.add);

// Cập nhật thông tin nhân viên
router.patch('/update/:id', Controller.update);

// Xóa nhân viên
router.delete('/delete/:id', Controller.delete);



module.exports = router;