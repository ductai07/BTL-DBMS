const Model = require('../model/associations');
const { Op } = require('sequelize');

// Lấy danh sách ghế với tìm kiếm, sắp xếp, phân trang
module.exports.index = async (req, res) => {
    try {
        // Lấy các tham số từ query
        const { SearchKey, SearchValue, SortKey, SortValue, Page, Limit, roomId } = req.query;

        // Khởi tạo các biến mặc định
        let where = {};
        let order = [];
        let page = Page ? parseInt(Page) : 1;
        let limit = Limit ? parseInt(Limit) : 20; // Mặc định lấy 20 ghế
        let offset = (page - 1) * limit;

        // Lọc theo phòng nếu có
        if (roomId) {
            where.room_id = roomId;
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

        // Xử lý sắp xếp
        if (SortKey && SortValue) {
            order = [[SortKey, SortValue.toUpperCase()]];
        } else {
            order = [['position', 'ASC']]; // Sắp xếp theo vị trí mặc định
        }

        // Thực hiện truy vấn
        const { count, rows } = await Model.Seat.findAndCountAll({
            where,
            order,
            limit,
            offset,
            include: [
                {
                    model: Model.Room,
                    attributes: ['id', 'name', 'type'],
                    include: [
                        {
                            model: Model.Cinema,
                            attributes: ['id', 'name']
                        }
                    ]
                }
            ]
        });

        // Tính toán thông tin phân trang
        const totalPages = Math.ceil(count / limit);
        const hasNext = page < totalPages;
        const hasPrevious = page > 1;

        res.status(200).json({
            data: rows,
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
            message: 'Error retrieving seats',
            error: error.message
        });
    }
};

// Xem chi tiết ghế
module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id;
        
        const seat = await Model.Seat.findByPk(id, {
            include: [
                {
                    model: Model.Room,
                    attributes: ['id', 'name', 'type', 'cinema_id'],
                    include: [
                        {
                            model: Model.Cinema,
                            attributes: ['id', 'name']
                        }
                    ]
                }
            ]
        });
        
        if (!seat) {
            return res.status(404).json({
                message: 'Seat not found'
            });
        }
        
        // Kiểm tra xem ghế này có vé đã đặt không
        const ticketCount = await Model.Ticket.count({
            where: { seat_id: id }
        });
        
        res.status(200).json({
            data: {
                ...seat.get({ plain: true }),
                ticketCount
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving seat details',
            error: error.message
        });
    }
};

// Đổi trạng thái ghế
module.exports.changeStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body;

        const seat = await Model.Seat.findByPk(id);
        
        if (!seat) {
            return res.status(404).json({
                message: 'Seat not found'
            });
        }

        // Kiểm tra trạng thái hợp lệ
        const validStatus = ['Trống', 'Đã đặt', 'Bảo trì'];
        if (!status || !validStatus.includes(status)) {
            return res.status(400).json({
                message: 'Invalid status. Must be one of: Trống, Đã đặt, Bảo trì'
            });
        }

        // Nếu muốn chuyển sang 'Bảo trì' nhưng ghế đã đặt, kiểm tra
        if (status === 'Bảo trì' && seat.status === 'Đã đặt') {
            // Kiểm tra xem ghế này có vé đã đặt không
            const activeTickets = await Model.Ticket.count({
                where: { 
                    seat_id: id,
                    // Lọc vé thuộc showtime trong tương lai 
                    '$ShowTime.showDate$': { [Op.gte]: new Date() }
                },
                include: [
                    {
                        model: Model.ShowTime,
                        attributes: ['id', 'showDate']
                    }
                ]
            });
            
            if (activeTickets > 0) {
                return res.status(400).json({
                    message: `Cannot change status to ${status}. This seat has ${activeTickets} active tickets.`
                });
            }
        }

        // Nếu trạng thái không thay đổi
        if (seat.status === status) {
            return res.status(200).json({
                message: 'Status remained unchanged',
                data: seat
            });
        }

        // Cập nhật trạng thái
        await seat.update({ status });

        res.status(200).json({
            message: 'Seat status updated successfully',
            data: seat
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating seat status',
            error: error.message
        });
    }
};

// Thêm ghế mới
module.exports.add = async (req, res) => {
    try {
        const { position, type, price, status, room_id } = req.body;

        // Kiểm tra phòng có tồn tại không
        const room = await Model.Room.findByPk(room_id);
        if (!room) {
            return res.status(400).json({
                message: 'Room not found'
            });
        }

        // Kiểm tra trạng thái hợp lệ
        const validStatus = ['Trống', 'Đã đặt', 'Bảo trì'];
        if (status && !validStatus.includes(status)) {
            return res.status(400).json({
                message: 'Invalid status. Must be one of: Trống, Đã đặt, Bảo trì'
            });
        }

        // Kiểm tra vị trí ghế có bị trùng trong phòng không
        const existingSeat = await Model.Seat.findOne({
            where: {
                position,
                room_id
            }
        });

        if (existingSeat) {
            return res.status(400).json({
                message: 'A seat with this position already exists in the room'
            });
        }

        // Tạo ghế mới
        const seat = await Model.Seat.create({
            position,
            type,
            price,
            status: status || 'Trống', // Mặc định là Trống
            room_id
        });

        // Cập nhật số lượng ghế trong phòng
        await room.increment('seatCount');

        res.status(201).json({
            message: 'Seat created successfully',
            data: seat
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating seat',
            error: error.message
        });
    }
};

// Sửa thông tin ghế
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;
        const { position, type, price, status, room_id } = req.body;

        const seat = await Model.Seat.findByPk(id);
        
        if (!seat) {
            return res.status(404).json({
                message: 'Seat not found'
            });
        }

        // Nếu thay đổi phòng, kiểm tra phòng mới có tồn tại không
        if (room_id && room_id !== seat.room_id) {
            const newRoom = await Model.Room.findByPk(room_id);
            if (!newRoom) {
                return res.status(400).json({
                    message: 'Room not found'
                });
            }
            
            // Giảm số lượng ghế của phòng cũ
            const oldRoom = await Model.Room.findByPk(seat.room_id);
            if (oldRoom) {
                await oldRoom.decrement('seatCount');
            }
            
            // Tăng số lượng ghế của phòng mới
            await newRoom.increment('seatCount');
        }

        // Kiểm tra trạng thái hợp lệ
        const validStatus = ['Trống', 'Đã đặt', 'Bảo trì'];
        if (status && !validStatus.includes(status)) {
            return res.status(400).json({
                message: 'Invalid status. Must be one of: Trống, Đã đặt, Bảo trì'
            });
        }

        // Kiểm tra vị trí ghế có bị trùng trong phòng mới
        if (position && (position !== seat.position || room_id !== seat.room_id)) {
            const existingSeat = await Model.Seat.findOne({
                where: {
                    position,
                    room_id: room_id || seat.room_id,
                    id: { [Op.ne]: id } // Loại trừ ghế hiện tại
                }
            });

            if (existingSeat) {
                return res.status(400).json({
                    message: 'A seat with this position already exists in the room'
                });
            }
        }

        // Cập nhật thông tin
        await seat.update({
            position: position !== undefined ? position : seat.position,
            type: type !== undefined ? type : seat.type,
            price: price !== undefined ? price : seat.price,
            status: status !== undefined ? status : seat.status,
            room_id: room_id !== undefined ? room_id : seat.room_id
        });

        res.status(200).json({
            message: 'Seat updated successfully',
            data: seat
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating seat',
            error: error.message
        });
    }
};

// Xóa ghế
module.exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const seat = await Model.Seat.findByPk(id);
        
        if (!seat) {
            return res.status(404).json({
                message: 'Seat not found'
            });
        }

        // Kiểm tra xem ghế có vé nào không
        const ticketCount = await Model.Ticket.count({
            where: { seat_id: id }
        });

        if (ticketCount > 0) {
            return res.status(400).json({
                message: 'Cannot delete seat with existing tickets',
                ticketCount
            });
        }

        // Lưu lại room_id trước khi xóa để cập nhật số lượng ghế
        const roomId = seat.room_id;

        await seat.destroy();

        // Giảm số lượng ghế trong phòng
        if (roomId) {
            const room = await Model.Room.findByPk(roomId);
            if (room) {
                await room.decrement('seatCount');
            }
        }

        res.status(200).json({
            message: 'Seat deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting seat',
            error: error.message
        });
    }
};

// Kiểm tra tình trạng ghế theo lịch chiếu
module.exports.getSeatsByShowtime = async (req, res) => {
    try {
        const showtimeId = req.params.showtimeId;
        const { seatType, Page, Limit } = req.query;
        
        // Kiểm tra lịch chiếu có tồn tại không
        const showtime = await Model.ShowTime.findByPk(showtimeId, {
            include: [
                {
                    model: Model.Room,
                    attributes: ['id', 'name', 'type', 'cinema_id']
                },
                {
                    model: Model.Movie,
                    attributes: ['id', 'title', 'duration', 'poster']
                }
            ]
        });
        
        if (!showtime) {
            return res.status(404).json({
                message: 'Showtime not found'
            });
        }
        
        // Khởi tạo các biến phân trang
        let page = Page ? parseInt(Page) : 1;
        let limit = Limit ? parseInt(Limit) : 100; // Mặc định hiển thị 100 ghế
        let offset = (page - 1) * limit;
        
        // Khởi tạo điều kiện lọc
        let where = { room_id: showtime.room_id };
        
        // Lọc theo loại ghế nếu có
        if (seatType) {
            where.type = seatType;
        }
        
        // Lấy tất cả ghế trong phòng
        const { count, rows: seats } = await Model.Seat.findAndCountAll({
            where,
            order: [['position', 'ASC']],
            limit,
            offset
        });
        
        // Lấy tất cả vé đã đặt cho lịch chiếu này
        const bookedTickets = await Model.Ticket.findAll({
            where: { showtime_id: showtimeId },
            attributes: ['seat_id']
        });
        
        // Tạo map các ghế đã đặt
        const bookedSeatIds = new Set(bookedTickets.map(ticket => ticket.seat_id));
        
        // Kết hợp thông tin để tạo trạng thái ghế cho từng ghế
        const seatStatuses = seats.map(seat => {
            const seatData = seat.get({ plain: true });
            
            // Xác định trạng thái ghế cho lịch chiếu này
            let statusForShowtime;
            if (bookedSeatIds.has(seat.id)) {
                statusForShowtime = 'Đã đặt';
            } else if (seat.status === 'Bảo trì') {
                statusForShowtime = 'Bảo trì';
            } else {
                statusForShowtime = 'Trống';
            }
            
            return {
                ...seatData,
                statusForShowtime
            };
        });
        
        // Tính toán thông tin phân trang
        const totalPages = Math.ceil(count / limit);
        const hasNext = page < totalPages;
        const hasPrevious = page > 1;
        
        // Tính số ghế đã đặt
        const bookedSeatsCount = seatStatuses.filter(seat => seat.statusForShowtime === 'Đã đặt').length;
        
        res.status(200).json({
            data: {
                showtime: {
                    id: showtime.id,
                    startTime: showtime.startTime,
                    endTime: showtime.endTime,
                    showDate: showtime.showDate,
                    room: showtime.Room,
                    movie: showtime.Movie
                },
                seats: seatStatuses,
                statistics: {
                    totalSeats: count,
                    bookedSeats: bookedSeatsCount,
                    availableSeats: count - bookedSeatsCount,
                    occupancyRate: ((bookedSeatsCount / count) * 100).toFixed(2) + '%'
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
            message: 'Error retrieving seat statuses',
            error: error.message
        });
    }
};