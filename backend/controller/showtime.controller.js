const Model = require('../model/associations');
const { Op } = require('sequelize');
const sequelize = require('../config/database'); // Thêm dòng này
// Lấy danh sách lịch chiếu với tìm kiếm, sắp xếp, phân trang
module.exports.index = async (req, res) => {
    try {
        // Lấy các tham số từ query
        const { SearchKey, SearchValue, SortKey, SortValue, Page, Limit, movie_id, cinema_id, date, status } = req.query;
        console.log("Request parameters:", { SearchKey, SearchValue, SortKey, SortValue, Page, Limit, movie_id, cinema_id, date, status });

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

        console.log("Initial where clause:", where);

        // Thêm điều kiện lọc trạng thái nếu có
        // Chỉ thêm nếu status field tồn tại trong database
        if (status && status !== 'all') {
            try {
                // Kiểm tra schema trước khi thêm điều kiện
                const showTimeModel = Model.ShowTime;
                const attributes = Object.keys(showTimeModel.rawAttributes);
                console.log("ShowTime attributes:", attributes);
                
                if (attributes.includes('status')) {
                    where.status = status;
                } else {
                    console.log("Status field not found in model, skipping filter");
                }
            } catch (err) {
                console.log("Error checking status field:", err.message);
            }
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

        // Xử lý sắp xếp
        if (SortKey && SortValue) {
            order = [[SortKey, SortValue.toUpperCase()]];
        } else {
            order = [
                ['showDate', 'ASC'],
                ['startTime', 'ASC']
            ]; // Sắp xếp mặc định
        }

        console.log("Order clause:", order);

        // Debug: log the ShowTime model structure
        console.log("ShowTime model structure:");
        const showTimeAttrs = Object.keys(Model.ShowTime.rawAttributes);
        console.log("ShowTime attributes:", showTimeAttrs);
        console.log("ShowTime associations:", Object.keys(Model.ShowTime.associations));

        // Debug: log the Room model structure
        console.log("Room model structure:");
        const roomAttrs = Object.keys(Model.Room.rawAttributes);
        console.log("Room attributes:", roomAttrs);
        
        // Kiểm tra các trường dữ liệu cho các model liên quan
        // Phòng (Room)
        let roomAttributes = ['id', 'name', 'type'];
        try {
            const RoomModel = Model.Room;
            if (roomAttrs.includes('capacity')) {
                roomAttributes.push('capacity');
            }
            if (roomAttrs.includes('seatCount')) {
                roomAttributes.push('seatCount');
            }
        } catch (err) {
            console.log("Error checking Room model attributes:", err.message);
        }

        console.log("Room attributes to include:", roomAttributes);

        // Khởi tạo các join conditions
        const includes = [
            {
                model: Model.Movie,
                attributes: ['id', 'title', 'duration', 'poster', 'genre']
            },
            {
                model: Model.Room,
                attributes: roomAttributes,
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
            console.error("Error details:", queryError.message);
            if (queryError.original) {
                console.error("Original error:", queryError.original.message);
                console.error("SQL state:", queryError.original.state);
            }
            if (queryError.sql) {
                console.error("Generated SQL:", queryError.sql);
            }
            if (queryError.parameters) {
                console.error("Query parameters:", queryError.parameters);
            }
            
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
                throw simpleQueryError; // Re-throw to be caught by outer catch
            }
        }

        console.log("Query completed, processing results...");

        // Đếm số vé đã bán cho mỗi lịch chiếu
        const showtimeIds = rows.map(showtime => showtime.id);
        let soldTicketCounts = {};
        
        if (showtimeIds.length > 0) {
            try {
                const ticketCounts = await Model.Ticket.findAll({
                    attributes: [
                        'showtime_id',
                        [sequelize.fn('COUNT', sequelize.col('id')), 'ticketCount']
                    ],
                    where: { showtime_id: { [Op.in]: showtimeIds } },
                    group: ['showtime_id'],
                    raw: true
                });
                
                // Chuyển đổi kết quả thành object để dễ truy cập
                ticketCounts.forEach(item => {
                    soldTicketCounts[item.showtime_id] = parseInt(item.ticketCount);
                });
                
                console.log("Ticket counts retrieved successfully");
            } catch (err) {
                console.log("Error counting tickets:", err.message);
                // Continue without ticket counts rather than failing completely
            }
        }

        // Định dạng lại dữ liệu cho frontend
        const formattedShowtimes = rows.map(showtime => {
            const plain = showtime.get({ plain: true });
            
            // Xác định trạng thái dựa trên ngày nếu không có trường status
            let status = "Unknown";
            try {
                if (plain.status) {
                    status = plain.status;
                } else {
                    // Tính toán trạng thái dựa trên ngày
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    const showtimeDate = new Date(plain.showDate);
                    
                    if (showtimeDate < today) {
                        status = "Đã chiếu";
                    } else if (showtimeDate > today) {
                        status = "Sắp chiếu";
                    } else {
                        status = "Đang chiếu";
                    }
                }
            } catch (err) {
                console.log("Error calculating status:", err.message);
            }
            
            // Xác định capacity từ room
            let roomCapacity = 0;
            if (plain.Room) {
                roomCapacity = plain.Room.capacity || plain.Room.seatCount || 0;
            }
            
            return {
                id: plain.id,
                title: plain.Movie?.title || "Unknown",
                cinema: plain.Room?.Cinema?.name || "Unknown",
                room: plain.Room?.name || "Unknown",
                date: plain.showDate,
                time: plain.startTime?.substring(0, 5) || "",
                status: status,
                tickets: {
                    sold: soldTicketCounts[plain.id] || 0,
                    total: roomCapacity
                },
                price: plain.price,
                // Thêm dữ liệu gốc để chi tiết
                originalData: plain
            };
        });

        console.log(`Formatted ${formattedShowtimes.length} showtimes for response`);

        // Tính toán thông tin phân trang
        const totalPages = Math.ceil(count / limit);
        const hasNext = page < totalPages;
        const hasPrevious = page > 1;

        const response = {
            data: formattedShowtimes,
            pagination: {
                total: count,
                totalPages,
                currentPage: page,
                pageSize: limit,
                hasNext,
                hasPrevious
            }
        };

        console.log("Sending response:", { 
            total: count, 
            totalPages, 
            currentPage: page,
            resultCount: formattedShowtimes.length 
        });

        res.status(200).json(response);
    } catch (error) {
        console.error("ShowTime index error:", error);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        
        if (error.original) {
            console.error("Original error:", error.original.message);
            console.error("SQL state:", error.original.state);
        }

        res.status(500).json({
            message: 'Error retrieving showtimes',
            error: error.message,
            details: error.original ? error.original.message : 'No additional details'
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