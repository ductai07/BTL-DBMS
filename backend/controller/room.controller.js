const Model = require('../model/associations');
const { Op } = require('sequelize');

// Lấy danh sách phòng với tìm kiếm, sắp xếp, phân trang và lọc theo rạp
module.exports.index = async (req, res) => {
    try {
        // Lấy các tham số từ query
        const { SearchKey, SearchValue, SortKey, SortValue, Page, Limit, cinemaId } = req.query;

        // Khởi tạo các biến mặc định
        let where = {};
        let order = [];
        let page = Page ? parseInt(Page) : 1;
        let limit = Limit ? parseInt(Limit) : 10;
        let offset = (page - 1) * limit;

        // Lọc theo rạp nếu có
        if (cinemaId) {
            where.cinema_id = cinemaId;
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
            order = [['id', 'ASC']]; // Sắp xếp mặc định
        }

        // Thực hiện truy vấn
        const { count, rows } = await Model.Room.findAndCountAll({
            where,
            order,
            limit,
            offset,
            include: [
                {
                    model: Model.Cinema,
                    attributes: ['id', 'name', 'address']
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
            message: 'Error retrieving rooms',
            error: error.message
        });
    }
};

// Xem chi tiết phòng
module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id;
        
        // Tìm phòng kèm thông tin rạp
        const room = await Model.Room.findByPk(id, {
            include: [
                {
                    model: Model.Cinema,
                    attributes: ['id', 'name', 'address', 'status']
                }
            ]
        });
        
        if (!room) {
            return res.status(404).json({
                message: 'Room not found'
            });
        }
        
        // Đếm số ghế của phòng
        const seatCount = await Model.Seat.count({
            where: { room_id: id }
        });
        
        // Đếm số lịch chiếu sắp tới
        const upcomingShowtimes = await Model.ShowTime.count({
            where: {
                room_id: id,
                showDate: {
                    [Op.gte]: new Date()
                }
            }
        });
        
        res.status(200).json({
            data: {
                ...room.get({ plain: true }),
                actualSeatCount: seatCount,
                upcomingShowtimes
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving room details',
            error: error.message
        });
    }
};

// Đổi trạng thái phòng
module.exports.changeStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body;

        const room = await Model.Room.findByPk(id);
        
        if (!room) {
            return res.status(404).json({
                message: 'Room not found'
            });
        }

        // Kiểm tra nếu status hợp lệ
        const validStatus = ['Hoạt động', 'Đang bảo trì', 'Đóng cửa'];
        if (!status || !validStatus.includes(status)) {
            return res.status(400).json({
                message: 'Invalid status. Must be one of: Hoạt động, Đang bảo trì, Đóng cửa'
            });
        }

        // Nếu đổi sang trạng thái Đóng cửa hoặc Bảo trì, kiểm tra lịch chiếu
        if ((status === 'Đóng cửa' || status === 'Đang bảo trì') && room.status === 'Hoạt động') {
            // Kiểm tra xem có lịch chiếu sắp tới trong phòng này không
            const upcomingShowtimes = await Model.ShowTime.count({
                where: {
                    room_id: id,
                    showDate: { [Op.gte]: new Date() }
                }
            });
            
            if (upcomingShowtimes > 0) {
                return res.status(400).json({
                    message: `Cannot change status to ${status}. There are ${upcomingShowtimes} upcoming showtimes for this room.`
                });
            }
        }

        // Nếu trạng thái không thay đổi
        if (room.status === status) {
            return res.status(200).json({
                message: 'Status remained unchanged',
                data: room
            });
        }

        // Cập nhật trạng thái
        await room.update({ status });

        res.status(200).json({
            message: 'Room status updated successfully',
            data: room
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating room status',
            error: error.message
        });
    }
};

// Thêm phòng mới
module.exports.add = async (req, res) => {
    try {
        const { name, type, seatCount, status, cinema_id } = req.body;

        // Kiểm tra xem rạp có tồn tại không
        const cinema = await Model.Cinema.findByPk(cinema_id);
        if (!cinema) {
            return res.status(400).json({
                message: 'Cinema not found'
            });
        }

        // Kiểm tra nếu status hợp lệ
        const validStatus = ['Hoạt động', 'Đang bảo trì', 'Đóng cửa'];
        if (status && !validStatus.includes(status)) {
            return res.status(400).json({
                message: 'Invalid status. Must be one of: Hoạt động, Đang bảo trì, Đóng cửa'
            });
        }

        // Kiểm tra tên phòng có bị trùng trong rạp
        const existingRoom = await Model.Room.findOne({
            where: {
                name,
                cinema_id
            }
        });

        if (existingRoom) {
            return res.status(400).json({
                message: 'A room with this name already exists in the cinema'
            });
        }

        const room = await Model.Room.create({
            name,
            type,
            seatCount: seatCount || 0,
            status: status || 'Hoạt động',
            cinema_id
        });

        res.status(201).json({
            message: 'Room created successfully',
            data: room
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating room',
            error: error.message
        });
    }
};

// Sửa thông tin phòng
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, type, seatCount, status, cinema_id } = req.body;

        const room = await Model.Room.findByPk(id);
        
        if (!room) {
            return res.status(404).json({
                message: 'Room not found'
            });
        }

        // Nếu thay đổi rạp, kiểm tra rạp mới có tồn tại không
        if (cinema_id && cinema_id !== room.cinema_id) {
            const cinema = await Model.Cinema.findByPk(cinema_id);
            if (!cinema) {
                return res.status(400).json({
                    message: 'Cinema not found'
                });
            }
        }

        // Kiểm tra nếu status hợp lệ
        const validStatus = ['Hoạt động', 'Đang bảo trì', 'Đóng cửa'];
        if (status && !validStatus.includes(status)) {
            return res.status(400).json({
                message: 'Invalid status. Must be one of: Hoạt động, Đang bảo trì, Đóng cửa'
            });
        }

        // Kiểm tra tên phòng có bị trùng trong rạp mới
        if (name && (name !== room.name || cinema_id !== room.cinema_id)) {
            const existingRoom = await Model.Room.findOne({
                where: {
                    name,
                    cinema_id: cinema_id || room.cinema_id,
                    id: { [Op.ne]: id } // Loại trừ phòng hiện tại
                }
            });

            if (existingRoom) {
                return res.status(400).json({
                    message: 'A room with this name already exists in the cinema'
                });
            }
        }

        // Cập nhật thông tin
        await room.update({
            name: name !== undefined ? name : room.name,
            type: type !== undefined ? type : room.type,
            seatCount: seatCount !== undefined ? seatCount : room.seatCount,
            status: status !== undefined ? status : room.status,
            cinema_id: cinema_id !== undefined ? cinema_id : room.cinema_id
        });

        res.status(200).json({
            message: 'Room updated successfully',
            data: room
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating room',
            error: error.message
        });
    }
};

// Xóa phòng
module.exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const room = await Model.Room.findByPk(id);
        
        if (!room) {
            return res.status(404).json({
                message: 'Room not found'
            });
        }

        // Kiểm tra xem phòng có lịch chiếu không
        const showtimeCount = await Model.ShowTime.count({
            where: { room_id: id }
        });

        if (showtimeCount > 0) {
            return res.status(400).json({
                message: 'Cannot delete room with existing showtimes',
                showtimeCount
            });
        }

        await room.destroy();

        res.status(200).json({
            message: 'Room deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting room',
            error: error.message
        });
    }
};

// Lấy danh sách ghế trong phòng
module.exports.getSeats = async (req, res) => {
    try {
        const roomId = req.params.id;
        const { SearchKey, SearchValue, SortKey, SortValue, Page, Limit } = req.query;
        
        // Kiểm tra phòng có tồn tại không
        const room = await Model.Room.findByPk(roomId);
        
        if (!room) {
            return res.status(404).json({
                message: 'Room not found'
            });
        }
        
        // Khởi tạo các biến mặc định
        let where = { room_id: roomId };
        let order = [];
        let page = Page ? parseInt(Page) : 1;
        let limit = Limit ? parseInt(Limit) : 50; // Thường số ghế trong phòng nhiều nên mặc định lấy 50
        let offset = (page - 1) * limit;
        
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
            order = [['position', 'ASC']]; // Sắp xếp theo vị trí ghế mặc định
        }
        
        // Thực hiện truy vấn
        const { count, rows } = await Model.Seat.findAndCountAll({
            where,
            order,
            limit,
            offset
        });
        
        // Tính toán thông tin phân trang
        const totalPages = Math.ceil(count / limit);
        const hasNext = page < totalPages;
        const hasPrevious = page > 1;
        
        res.status(200).json({
            data: {
                room: {
                    id: room.id,
                    name: room.name,
                    type: room.type
                },
                seats: rows
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
            message: 'Error retrieving seats',
            error: error.message
        });
    }
};

// Lấy lịch chiếu của phòng
module.exports.getShowtimes = async (req, res) => {
    try {
        const roomId = req.params.id;
        const { startDate, endDate, movieId, Page, Limit } = req.query;
        
        // Kiểm tra phòng có tồn tại không
        const room = await Model.Room.findByPk(roomId);
        
        if (!room) {
            return res.status(404).json({
                message: 'Room not found'
            });
        }
        
        // Khởi tạo các biến mặc định
        let where = { room_id: roomId };
        let page = Page ? parseInt(Page) : 1;
        let limit = Limit ? parseInt(Limit) : 10;
        let offset = (page - 1) * limit;
        
        // Lọc theo khoảng thời gian
        if (startDate && endDate) {
            where.showDate = {
                [Op.between]: [startDate, endDate]
            };
        } else if (startDate) {
            where.showDate = {
                [Op.gte]: startDate
            };
        } else if (endDate) {
            where.showDate = {
                [Op.lte]: endDate
            };
        } else {
            // Mặc định lấy từ hôm nay trở đi
            where.showDate = {
                [Op.gte]: new Date()
            };
        }
        
        // Lọc theo phim nếu có
        if (movieId) {
            where.movie_id = movieId;
        }
        
        // Thực hiện truy vấn
        const { count, rows } = await Model.ShowTime.findAndCountAll({
            where,
            order: [
                ['showDate', 'ASC'],
                ['startTime', 'ASC']
            ],
            limit,
            offset,
            include: [
                {
                    model: Model.Movie,
                    attributes: ['id', 'title', 'duration', 'poster', 'genre']
                }
            ]
        });
        
        // Tính toán thông tin phân trang
        const totalPages = Math.ceil(count / limit);
        const hasNext = page < totalPages;
        const hasPrevious = page > 1;
        
        res.status(200).json({
            data: {
                room: {
                    id: room.id,
                    name: room.name,
                    cinema_id: room.cinema_id
                },
                showtimes: rows
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
            message: 'Error retrieving showtimes',
            error: error.message
        });
    }
};