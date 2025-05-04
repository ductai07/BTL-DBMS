const Model = require('../model/associations');
const { Op } = require('sequelize');

// Lấy danh sách rạp với tìm kiếm, sắp xếp, phân trang
module.exports.index = async (req, res) => {
    try {
        // Lấy các tham số từ query
        const { SearchKey, SearchValue, SortKey, SortValue, Page, Limit } = req.query;

        // Khởi tạo các biến mặc định
        let where = {};
        let order = [];
        let page = Page ? parseInt(Page) : 1;
        let limit = Limit ? parseInt(Limit) : 10;
        let offset = (page - 1) * limit;

        // Xử lý tìm kiếm
        if (SearchKey && SearchValue) {
            where = {
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
        const { count, rows } = await Model.Cinema.findAndCountAll({
            where,
            order,
            limit,
            offset,
        });

        // Tính toán thông tin phân trang
        const totalPages = Math.ceil(count / limit);
        const hasNext = page < totalPages;
        const hasPrevious = page > 1;

        res.status(200).json({
            data: rows,
            pagination: {
                total: count,
                totalPages: totalPages,
                currentPage: page,
                pageSize: limit,
                hasNext: hasNext,
                hasPrevious: hasPrevious
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving cinemas',
            error: error.message
        });
    }
};

// Xem chi tiết rạp
module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id;
        
        // Tìm rạp kèm theo số phòng
        const cinema = await Model.Cinema.findByPk(id);
        
        if (!cinema) {
            return res.status(404).json({
                message: 'Cinema not found'
            });
        }
        
        // Đếm số phòng thuộc rạp này
        const roomCount = await Model.Room.count({
            where: {
                cinema_id: id
            }
        });
        
        res.status(200).json({
            data: {
                ...cinema.get({ plain: true }),
                roomCount: roomCount
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving cinema details',
            error: error.message
        });
    }
};

// Đổi trạng thái rạp
module.exports.changeStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body;

        const cinema = await Model.Cinema.findByPk(id);
        
        if (!cinema) {
            return res.status(404).json({
                message: 'Cinema not found'
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
        if ((status === 'Đóng cửa' || status === 'Đang bảo trì') && cinema.status === 'Hoạt động') {
            // Lấy tất cả id phòng thuộc rạp này
            const rooms = await Model.Room.findAll({
                where: { cinema_id: id },
                attributes: ['id']
            });
            
            const roomIds = rooms.map(room => room.id);
            
            // Kiểm tra xem có lịch chiếu sắp tới trong các phòng của rạp không
            if (roomIds.length > 0) {
                const upcomingShowtimes = await Model.ShowTime.count({
                    where: {
                        room_id: { [Op.in]: roomIds },
                        showDate: { [Op.gte]: new Date() }
                    }
                });
                
                if (upcomingShowtimes > 0) {
                    return res.status(400).json({
                        message: `Cannot change status to ${status}. There are ${upcomingShowtimes} upcoming showtimes in this cinema.`
                    });
                }
            }
        }

        // Nếu trạng thái không thay đổi
        if (cinema.status === status) {
            return res.status(200).json({
                message: 'Status remained unchanged',
                data: cinema
            });
        }

        // Cập nhật trạng thái
        await cinema.update({ status });

        res.status(200).json({
            message: 'Cinema status updated successfully',
            data: cinema
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating cinema status',
            error: error.message
        });
    }
};

// Thêm rạp mới
module.exports.add = async (req, res) => {
    try {
        const { name, address, note, status } = req.body;

        // Kiểm tra nếu status hợp lệ
        const validStatus = ['Hoạt động', 'Đang bảo trì', 'Đóng cửa'];
        if (status && !validStatus.includes(status)) {
            return res.status(400).json({
                message: 'Invalid status. Must be one of: Hoạt động, Đang bảo trì, Đóng cửa'
            });
        }

        const cinema = await Model.Cinema.create({
            name,
            address,
            note,
            status: status || 'Hoạt động' // Giá trị mặc định
        });

        res.status(201).json({
            message: 'Cinema created successfully',
            data: cinema
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating cinema',
            error: error.message
        });
    }
};

// Sửa thông tin rạp
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, address, note, status } = req.body;

        const cinema = await Model.Cinema.findByPk(id);
        
        if (!cinema) {
            return res.status(404).json({
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

        // Cập nhật thông tin
        await cinema.update({
            name: name !== undefined ? name : cinema.name,
            address: address !== undefined ? address : cinema.address,
            note: note !== undefined ? note : cinema.note,
            status: status !== undefined ? status : cinema.status
        });

        res.status(200).json({
            message: 'Cinema updated successfully',
            data: cinema
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating cinema',
            error: error.message
        });
    }
};

// Xóa rạp
module.exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const cinema = await Model.Cinema.findByPk(id);
        
        if (!cinema) {
            return res.status(404).json({
                message: 'Cinema not found'
            });
        }

        await cinema.destroy();

        res.status(200).json({
            message: 'Cinema deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting cinema',
            error: error.message
        });
    }
};

// Lấy phòng theo rạp - Phiên bản đầy đủ với tìm kiếm, sắp xếp, phân trang
module.exports.getRooms = async (req, res) => {
    try {
        const cinemaId = req.query.cinemaId;
        const { SearchKey, SearchValue, SortKey, SortValue, Page, Limit } = req.query;

        if (!cinemaId) {
            return res.status(400).json({
                message: 'Cinema ID is required'
            });
        }

        // Tìm thông tin rạp
        const cinema = await Model.Cinema.findByPk(cinemaId);
        
        if (!cinema) {
            return res.status(404).json({
                message: 'Cinema not found'
            });
        }

        // Khởi tạo các biến mặc định
        let where = { cinema_id: cinemaId };
        let order = [];
        let page = Page ? parseInt(Page) : 1;
        let limit = Limit ? parseInt(Limit) : 10;
        let offset = (page - 1) * limit;

        // Xử lý tìm kiếm
        if (SearchKey && SearchValue) {
            where = {
                ...where,  // Giữ điều kiện cinema_id
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

        // Thực hiện truy vấn với phân trang - đã bỏ phần include seat
        const { count, rows } = await Model.Room.findAndCountAll({
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
                cinema: cinema,
                rooms: rows
            },
            pagination: {
                total: count,
                totalPages: totalPages,
                currentPage: page,
                pageSize: limit,
                hasNext: hasNext,
                hasPrevious: hasPrevious
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving rooms',
            error: error.message
        });
    }
};