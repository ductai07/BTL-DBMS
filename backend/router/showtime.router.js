const express = require('express');
const router = express.Router();
const Controller = require('../controller/showtime.controller');
const sequelize = require('../config/database');

// Lấy danh sách lịch chiếu với tìm kiếm, sắp xếp, phân trang
router.get('/', Controller.index);

// Get a simple list of showtimes without complex joins
router.get('/simple', async (req, res) => {
    try {
        // For pagination
        const { Page, Limit } = req.query;
        let page = Page ? parseInt(Page) : 1;
        let limit = Limit ? parseInt(Limit) : 10;
        let offset = (page - 1) * limit;
        
        // Use CONVERT to ensure proper time format
        const query = `
            SELECT 
                id, 
                CONVERT(VARCHAR(8), startTime, 108) as startTime, 
                CONVERT(VARCHAR(8), endTime, 108) as endTime, 
                showDate, 
                room_id, 
                movie_id
            FROM ShowTime
            ORDER BY id ASC
            OFFSET ${offset} ROWS
            FETCH NEXT ${limit} ROWS ONLY
        `;
        
        // Count total records for pagination
        const countQuery = `SELECT COUNT(*) as total FROM ShowTime`;
        
        // Execute the queries
        const [showtimes, countResult] = await Promise.all([
            sequelize.query(query, { type: sequelize.QueryTypes.SELECT }),
            sequelize.query(countQuery, { type: sequelize.QueryTypes.SELECT })
        ]);
        
        // Get the total count
        const count = countResult[0].total;
        const totalPages = Math.ceil(count / limit);
        
        // Return the raw data
        res.status(200).json({
            data: showtimes,
            pagination: {
                total: count,
                totalPages,
                currentPage: page,
                pageSize: limit,
                hasNext: page < totalPages,
                hasPrevious: page > 1
            }
        });
    } catch (error) {
        console.error("Simple showtime fetch error:", error);
        res.status(500).json({
            message: 'Error retrieving showtimes',
            error: error.message
        });
    }
});

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