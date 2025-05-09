const Model = require('../model/associations');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Lấy danh sách lịch chiếu với tìm kiếm, sắp xếp, phân trang
module.exports.index = async (req, res) => {
    try {
        console.log("Endpoint: /showtime");
        console.log("Request query params:", req.query);
        
        // Lấy các tham số từ query
        const { SearchKey, SearchValue, SortKey, SortValue, Page, Limit, movie_id, cinema_id, date } = req.query;

        // Khởi tạo các biến mặc định
        let where = {};
        let order = [];
        let page = Page ? parseInt(Page) : 1;
        let limit = Limit ? parseInt(Limit) : 10;
        let offset = (page - 1) * limit;

        // Lọc theo phim nếu có
        if (movie_id) {
            where.movie_id = movie_id;
        }

        // Lọc theo ngày nếu có
        if (date) {
            where.showDate = date;
        }

        // Xử lý tìm kiếm
        if (SearchKey && SearchValue) {
            where = {
                ...where,
                [SearchKey]: {
                    [Op.like]: `%${SearchValue}%`
                }
            };
        }

        console.log("Final where clause:", where);
        console.log("Limit:", limit, "Offset:", offset);

        // Xử lý sắp xếp
        if (SortKey && SortValue) {
            order = [[SortKey, SortValue.toUpperCase()]];
        } else {
            order = [
                ['showDate', 'ASC'],
                ['startTime', 'ASC']
            ]; // Sắp xếp mặc định
        }

        // Khởi tạo các join conditions
        const includes = [
            {
                model: Model.Movie,
                attributes: ['id', 'title', 'duration', 'poster', 'genre']
            },
            {
                model: Model.Room,
                attributes: ['id', 'name', 'type'],
                include: [
                    {
                        model: Model.Cinema,
                        attributes: ['id', 'name', 'address']
                    }
                ]
            }
        ];

        // Nếu có lọc theo rạp, thêm điều kiện vào join
        if (cinema_id) {
            includes[1].include[0].where = { id: cinema_id };
            includes[1].include[0].required = true;
        }

        console.log("Starting main query...");
        
        // Thực hiện truy vấn với try/catch chi tiết
        let count = 0;
        let rows = [];
        
        try {
            // Thực hiện truy vấn
            const result = await Model.ShowTime.findAndCountAll({
                where,
                order,
                limit,
                offset,
                include: includes,
                distinct: true // Để count chính xác khi có include
            });
            
            count = result.count;
            rows = result.rows;
            
            console.log(`Query successful. Found ${count} showtimes.`);
        } catch (queryError) {
            console.error("Error in main showtime query:", queryError);
            
            // Fallback to simpler query if the complex one fails
            console.log("Attempting simpler query without joins...");
            try {
                const simpleResult = await Model.ShowTime.findAndCountAll({
                    where,
                    order,
                    limit,
                    offset
                });
                
                count = simpleResult.count;
                rows = simpleResult.rows;
                
                console.log(`Simple query successful. Found ${count} showtimes.`);
            } catch (simpleQueryError) {
                console.error("Even simple query failed:", simpleQueryError.message);
                
                // Return empty results instead of failing
                count = 0;
                rows = [];
            }
        }

        console.log(`Returning ${rows.length} showtime rows`);

        // Process showtimes to match expected frontend format
        const processedShowtimes = rows.map(showtime => {
            const plainShowtime = showtime.get ? showtime.get({ plain: true }) : showtime;
            
            // Extract related data from nested objects
            const movie = plainShowtime.Movie || {};
            const room = plainShowtime.Room || {};
            const cinema = room.Cinema || {};
            
            // Calculate showtime status based on date
            const status = determineShowtimeStatus(plainShowtime.showDate, plainShowtime.startTime);
            
            // Helper function to determine showtime status based on date
            function determineShowtimeStatus(showDate, startTime) {
                if (!showDate) return "Sắp chiếu";
                
                const today = new Date();
                const showtimeDate = new Date(showDate);
                
                // Reset today's time to 00:00:00 for date comparison
                today.setHours(0, 0, 0, 0);
                showtimeDate.setHours(0, 0, 0, 0);
                
                // If showtime is in the past
                if (showtimeDate < today) {
                    return "Đã chiếu";
                }
                
                // If showtime is in the future
                if (showtimeDate > today) {
                    return "Sắp chiếu";
                }
                
                // If showtime is today, check the time
                if (startTime) {
                    const now = new Date();
                    const [hours, minutes] = startTime.split(':').map(Number);
                    const showtimeToday = new Date();
                    showtimeToday.setHours(hours, minutes, 0, 0);
                    
                    if (now > showtimeToday) {
                        return "Đang chiếu";
                    } else {
                        return "Sắp chiếu";
                    }
                }
                
                return "Sắp chiếu";
            }
            
            // Format as needed for the frontend
            return {
                id: plainShowtime.id,
                movie_id: plainShowtime.movie_id,
                room_id: plainShowtime.room_id,
                showDate: plainShowtime.showDate,
                startTime: plainShowtime.startTime,
                endTime: plainShowtime.endTime,
                // Include these fields even if null to prevent frontend errors
                Movie: movie,
                Room: room,
                status: status
            };
        });

        // Tính toán thông tin phân trang
        const totalPages = Math.ceil(count / limit);
        const hasNext = page < totalPages;
        const hasPrevious = page > 1;

        const response = {
            data: processedShowtimes,
            pagination: {
                total: count,
                totalPages,
                currentPage: page,
                pageSize: limit,
                hasNext,
                hasPrevious
            }
        };

        console.log("Response pagination:", response.pagination);
        res.status(200).json(response);
    } catch (error) {
        console.error("Global error in showtime index:", error);
        res.status(500).json({
            message: 'Error retrieving showtimes',
            error: error.message,
            data: [],
            pagination: {
                total: 0,
                totalPages: 0,
                currentPage: 1,
                pageSize: 10,
                hasNext: false,
                hasPrevious: false
            }
        });
    }
};

// Simple showtime endpoint without complex joins (for fallback)
module.exports.simple = async (req, res) => {
    try {
        console.log("Endpoint: /showtime/simple");
        console.log("Request query params:", req.query);
        
        const { Page, Limit } = req.query;
        let page = Page ? parseInt(Page) : 1;
        let limit = Limit ? parseInt(Limit) : 10;
        let offset = (page - 1) * limit;
        
        console.log("Page:", page, "Limit:", limit, "Offset:", offset);
        
        // Simple query directly against the model
        const showtimes = await Model.ShowTime.findAll({
            limit,
            offset,
            order: [
                ['showDate', 'ASC'],
                ['startTime', 'ASC']
            ]
        });
        
        // Count total for pagination
        const count = await Model.ShowTime.count();
        
        // Convert to plain objects and add calculated status
        const plainShowtimes = showtimes.map(st => {
            const plain = st.get ? st.get({ plain: true }) : st;
            return {
                ...plain,
                status: determineShowtimeStatus(plain.showDate, plain.startTime)
            };
        });
        
        console.log(`Simple query found ${plainShowtimes.length} showtimes`);
        
        // Calculate pagination
        const totalPages = Math.ceil(count / limit);
        
        res.status(200).json({
            data: plainShowtimes,
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
        console.error("Error in simple showtime endpoint:", error);
        res.status(500).json({
            message: 'Error retrieving simple showtimes',
            error: error.message,
            data: [], // Return empty array instead of failing
            pagination: {
                total: 0,
                totalPages: 0,
                currentPage: 1,
                pageSize: 10,
                hasNext: false,
                hasPrevious: false
            }
        });
    }
};

// Xem chi tiết lịch chiếu
module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id;
        
        const showtime = await Model.ShowTime.findByPk(id, {
            include: [
                {
                    model: Model.Movie,
                    attributes: ['id', 'title', 'duration', 'poster', 'genre', 'director', 'ageRating']
                },
                {
                    model: Model.Room,
                    attributes: ['id', 'name', 'type', 'seatCount'],
                    include: [
                        {
                            model: Model.Cinema,
                            attributes: ['id', 'name', 'address']
                        }
                    ]
                }
            ]
        });
        
        if (!showtime) {
            return res.status(404).json({
                message: 'Showtime not found'
            });
        }
        
        // Đếm số vé đã bán
        const soldTickets = await Model.Ticket.count({
            where: { showtime_id: id }
        });
        
        // Đếm tổng số ghế trong phòng
        const totalSeats = await Model.Seat.count({
            where: { room_id: showtime.room_id }
        });
        
        // Tính tỷ lệ lấp đầy
        const occupancyRate = totalSeats > 0 ? ((soldTickets / totalSeats) * 100).toFixed(2) + '%' : '0.00%';
        
        res.status(200).json({
            data: {
                ...showtime.get({ plain: true }),
                statistics: {
                    soldTickets,
                    totalSeats,
                    occupancyRate
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving showtime details',
            error: error.message
        });
    }
};

// Thêm lịch chiếu mới - phiên bản đơn giản hóa tận dụng trigger
module.exports.add = async (req, res) => {
    try {
        const { showDate, startTime, room_id, movie_id } = req.body;

        // Kiểm tra dữ liệu đầu vào cơ bản
        if (!showDate || !startTime || !room_id || !movie_id) {
            return res.status(400).json({
                message: 'Missing required fields: showDate, startTime, room_id, movie_id'
            });
        }

        // Kiểm tra room và movie tồn tại
        const [room, movie] = await Promise.all([
            Model.Room.findByPk(room_id),
            Model.Movie.findByPk(movie_id)
        ]);

        if (!room) return res.status(404).json({ message: 'Room not found' });
        if (!movie) return res.status(404).json({ message: 'Movie not found' });
        if (room.status !== 'Hoạt động') {
            return res.status(400).json({ message: `Cannot add showtime. Room status is ${room.status}` });
        }

        // Sửa đoạn code trong module.exports.add
try {
    // Đơn giản chỉ thêm bản ghi mới
    // Trigger trg_ManageShowTime sẽ tự động:
    // 1. Tính giờ kết thúc (endTime) dựa trên thời lượng phim
    // 2. Kiểm tra trùng lịch và báo lỗi nếu có
    await sequelize.query(
        `INSERT INTO ShowTime (showDate, startTime, room_id, movie_id)
         VALUES (?, ?, ?, ?)`,
        {
            replacements: [showDate, startTime, room_id, movie_id],
            type: sequelize.QueryTypes.INSERT
        }
    );
    
    res.status(201).json({
        success: true,
        message: 'Showtime created successfully'
    });
} catch (error) {
    // Trigger sẽ trả về lỗi chi tiết nếu trùng lịch
    // Kiểm tra nếu lỗi từ trigger trùng lịch
    if (error.message.includes('trùng lặp') || error.message.includes('conflict')) {
        return res.status(409).json({
            success: false,
            message: 'Lịch chiếu bị trùng với lịch chiếu khác',
            detail: error.message
        });
    }
    // Lỗi khác
    return res.status(500).json({
        success: false,
        message: 'Error creating showtime',
        error: error.message
    });
}
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Sửa thông tin lịch chiếu
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;
        const { showDate, startTime, room_id, movie_id } = req.body;

        const showtime = await Model.ShowTime.findByPk(id);
        
        if (!showtime) {
            return res.status(404).json({
                message: 'Showtime not found'
            });
        }

        // Kiểm tra xem có vé đã được bán cho lịch chiếu này hay không
        const ticketCount = await Model.Ticket.count({
            where: { showtime_id: id }
        });

        if (ticketCount > 0) {
            return res.status(400).json({
                message: `Cannot edit showtime. ${ticketCount} tickets have been sold for this showtime.`
            });
        }

        // Nếu thay đổi phòng, kiểm tra phòng mới có tồn tại không
        if (room_id && room_id !== showtime.room_id) {
            const room = await Model.Room.findByPk(room_id);
            if (!room) {
                return res.status(400).json({
                    message: 'Room not found'
                });
            }
            
            // Kiểm tra trạng thái phòng mới
            if (room.status !== 'Hoạt động') {
                return res.status(400).json({
                    message: `Cannot change to this room. Room status is ${room.status}`
                });
            }
        }

        // Nếu thay đổi phim, kiểm tra phim mới có tồn tại không
        if (movie_id && movie_id !== showtime.movie_id) {
            const movie = await Model.Movie.findByPk(movie_id);
            if (!movie) {
                return res.status(400).json({
                    message: 'Movie not found'
                });
            }
        }

        try {
            // Cập nhật thông tin - trigger trg_ManageShowTime sẽ kiểm tra trùng lịch
            // và tự động tính lại endTime nếu startTime hoặc movie_id thay đổi
            await showtime.update({
                showDate: showDate || showtime.showDate,
                startTime: startTime || showtime.startTime,
                room_id: room_id || showtime.room_id,
                movie_id: movie_id || showtime.movie_id
            });

            // Tải lại showtime sau khi cập nhật để có endTime đã được tính lại
            const updatedShowtime = await Model.ShowTime.findByPk(id);

            res.status(200).json({
                message: 'Showtime updated successfully',
                data: updatedShowtime
            });
        } catch (error) {
            // Nếu có lỗi từ trigger trg_ManageShowTime (ví dụ: trùng lịch)
            return res.status(400).json({
                message: error.message
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error updating showtime',
            error: error.message
        });
    }
};

// Xóa lịch chiếu
module.exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const showtime = await Model.ShowTime.findByPk(id);
        
        if (!showtime) {
            return res.status(404).json({
                message: 'Showtime not found'
            });
        }

        // Kiểm tra xem có vé đã được bán cho lịch chiếu này hay không
        const ticketCount = await Model.Ticket.count({
            where: { showtime_id: id }
        });

        if (ticketCount > 0) {
            return res.status(400).json({
                message: `Cannot delete showtime. ${ticketCount} tickets have been sold for this showtime.`
            });
        }

        await showtime.destroy();

        res.status(200).json({
            message: 'Showtime deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting showtime',
            error: error.message
        });
    }
};

// Lấy vé đã bán theo lịch chiếu
module.exports.getTickets = async (req, res) => {
    try {
        const showtimeId = req.params.id;
        const { Page, Limit } = req.query;
        
        // Kiểm tra lịch chiếu có tồn tại không
        const showtime = await Model.ShowTime.findByPk(showtimeId, {
            include: [
                {
                    model: Model.Movie,
                    attributes: ['id', 'title']
                },
                {
                    model: Model.Room,
                    attributes: ['id', 'name'],
                    include: [
                        {
                            model: Model.Cinema,
                            attributes: ['id', 'name']
                        }
                    ]
                }
            ]
        });
        
        if (!showtime) {
            return res.status(404).json({
                message: 'Showtime not found'
            });
        }
        
        // Khởi tạo phân trang
        let page = Page ? parseInt(Page) : 1;
        let limit = Limit ? parseInt(Limit) : 20;
        let offset = (page - 1) * limit;
        
        // Lấy danh sách vé đã bán
        const { count, rows } = await Model.Ticket.findAndCountAll({
            where: { showtime_id: showtimeId },
            include: [
                {
                    model: Model.Seat,
                    attributes: ['id', 'position', 'type', 'price']
                },
                {
                    model: Model.Invoice,
                    attributes: ['id', 'createDate', 'status', 'paymentMethod']
                }
            ],
            limit,
            offset,
            order: [['id', 'ASC']]
        });
        
        // Tính toán thống kê
        const totalIncome = rows.reduce((sum, ticket) => sum + Number(ticket.price), 0);
        
        // Tính toán thông tin phân trang
        const totalPages = Math.ceil(count / limit);
        const hasNext = page < totalPages;
        const hasPrevious = page > 1;
        
        res.status(200).json({
            data: {
                showtime: {
                    id: showtime.id,
                    showDate: showtime.showDate,
                    startTime: showtime.startTime,
                    endTime: showtime.endTime,
                    movie: showtime.Movie,
                    room: showtime.Room
                },
                tickets: rows,
                statistics: {
                    totalTickets: count,
                    totalIncome: totalIncome
                }
            },
            pagination: {
                total: count,
                totalPages,
                currentPage: page,
                pageSize: limit,
                hasNext,
                hasPrevious
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving tickets for showtime',
            error: error.message
        });
    }
};

// Lấy danh sách ghế theo lịch chiếu (để hiển thị sơ đồ ghế)
module.exports.getSeats = async (req, res) => {
    try {
        const showtimeId = req.params.id;
        
        // Kiểm tra lịch chiếu có tồn tại không
        const showtime = await Model.ShowTime.findByPk(showtimeId);
        
        if (!showtime) {
            return res.status(404).json({
                message: 'Showtime not found'
            });
        }
        
        // Lấy thông tin phòng của lịch chiếu
        const room = await Model.Room.findByPk(showtime.room_id);
        
        if (!room) {
            return res.status(404).json({
                message: 'Room information not found'
            });
        }
        
        // Lấy tất cả ghế trong phòng
        const seats = await Model.Seat.findAll({
            where: { room_id: room.id },
            attributes: ['id', 'position', 'type', 'status', 'price'],
            order: [['position', 'ASC']]
        });
        
        // Lấy danh sách ghế đã bán cho lịch chiếu này
        const soldSeats = await Model.Ticket.findAll({
            where: { showtime_id: showtimeId },
            attributes: ['seat_id']
        });
        
        // Danh sách ID ghế đã bán
        const soldSeatIds = soldSeats.map(ticket => ticket.seat_id);
        
        // Thêm thông tin trạng thái đặt chỗ vào mỗi ghế
        const seatsWithBookingStatus = seats.map(seat => {
            const seatData = seat.get({ plain: true });
            return {
                ...seatData,
                isBooked: soldSeatIds.includes(seat.id)
            };
        });
        
        res.status(200).json({
            data: {
                room: {
                    id: room.id,
                    name: room.name,
                    type: room.type,
                    seatCount: room.seatCount
                },
                seats: seatsWithBookingStatus
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving seats for showtime',
            error: error.message
        });
    }
};

// Lấy thông tin phim và phòng của lịch chiếu
module.exports.getInfo = async (req, res) => {
    try {
        const showtimeId = req.params.id;
        
        const showtime = await Model.ShowTime.findByPk(showtimeId, {
            include: [
                {
                    model: Model.Movie,
                    attributes: ['id', 'title', 'duration', 'poster', 'genre', 'director', 'mainActor', 'description', 'ageRating']
                },
                {
                    model: Model.Room,
                    attributes: ['id', 'name', 'type', 'seatCount'],
                    include: [
                        {
                            model: Model.Cinema,
                            attributes: ['id', 'name', 'address']
                        }
                    ]
                }
            ]
        });
        
        if (!showtime) {
            return res.status(404).json({
                message: 'Showtime not found'
            });
        }
        
        res.status(200).json({
            data: showtime
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving showtime information',
            error: error.message
        });
    }
};

// Lấy danh sách các ngày chiếu
module.exports.getDates = async (req, res) => {
    try {
        const { futureOnly } = req.query;
        
        // Build the query to get unique dates
        let query = `SELECT DISTINCT showDate FROM ShowTime`;
        
        // If futureOnly is true, get only future dates
        if (futureOnly === 'true') {
            query += ` WHERE showDate >= CONVERT(date, GETDATE())`;
        }
        
        // Order dates
        query += ` ORDER BY showDate ASC`;
        
        // Execute the query
        const dates = await sequelize.query(query, {
            type: sequelize.QueryTypes.SELECT
        });
        
        // Format dates for display if needed
        const formattedDates = dates.map(item => {
            const date = item.showDate;
            // Keep the original format for easy filtering
            return date;
        });
        
        res.status(200).json({
            success: true,
            data: formattedDates
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving showtime dates',
            error: error.message
        });
    }
};