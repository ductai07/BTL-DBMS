const Model = require('../model/associations');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Lấy danh sách vé
module.exports.index = async (req, res) => {
    try {
        // Lấy các tham số từ query
        const { SearchKey, SearchValue, SortKey, SortValue, Page, Limit, status, showtimeId, movieId, cinemaId } = req.query;

        // Khởi tạo các biến mặc định
        let where = {};
        let order = [];
        let page = Page ? parseInt(Page) : 1;
        let limit = Limit ? parseInt(Limit) : 10;
        let offset = (page - 1) * limit;

        // Lọc theo lịch chiếu
        if (showtimeId) {
            where.showtime_id = showtimeId;
        }

        // Lọc theo phim
        if (movieId) {
            where['$ShowTime.movie_id$'] = movieId;
        }

        // Lọc theo rạp
        if (cinemaId) {
            where['$ShowTime.Room.cinema_id$'] = cinemaId;
        }

        // Lọc theo trạng thái hóa đơn
        if (status) {
            where['$Invoice.status$'] = status;
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
            order = [['bookingDate', 'DESC']]; // Mặc định là thời gian đặt giảm dần
        }

        // Thực hiện truy vấn
        const { count, rows } = await Model.Ticket.findAndCountAll({
            where,
            order,
            limit,
            offset,
            include: [
                {
                    model: Model.ShowTime,
                    attributes: ['id', 'showDate', 'startTime', 'endTime'],
                    include: [
                        {
                            model: Model.Movie,
                            attributes: ['id', 'title', 'poster']
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
                },
                {
                    model: Model.Seat,
                    attributes: ['id', 'position', 'type', 'price']
                },
                {
                    model: Model.Invoice,
                    attributes: ['id', 'status', 'createDate']
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
            message: 'Lỗi khi lấy danh sách vé',
            error: error.message
        });
    }
};

// Xem chi tiết vé
module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id;
        
        // Lấy thông tin vé
        const ticket = await Model.Ticket.findByPk(id, {
            include: [
                {
                    model: Model.ShowTime,
                    attributes: ['id', 'showDate', 'startTime', 'endTime'],
                    include: [
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
                    ]
                },
                {
                    model: Model.Seat,
                    attributes: ['id', 'position', 'type', 'price']
                },
                {
                    model: Model.Invoice,
                    attributes: ['id', 'createDate', 'status', 'paymentMethod', 'totalAmount'],
                    include: [
                        {
                            model: Model.Customer,
                            attributes: ['id', 'fullName', 'phoneNumber']
                        },
                        {
                            model: Model.Employee,
                            attributes: ['id', 'fullName']
                        }
                    ]
                }
            ]
        });
        
        if (!ticket) {
            return res.status(404).json({
                message: 'Vé không tồn tại'
            });
        }
        
        res.status(200).json({
            data: ticket
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi lấy chi tiết vé',
            error: error.message
        });
    }
};

// Thêm vé mới (không liên kết với hóa đơn)
module.exports.add = async (req, res) => {
    try {
        const { showtime_id, seat_id, price, invoice_id } = req.body;

        // Kiểm tra các trường bắt buộc
        if (!showtime_id || !seat_id) {
            return res.status(400).json({
                message: 'Lịch chiếu và ghế là bắt buộc'
            });
        }

        // Kiểm tra lịch chiếu
        const showtime = await Model.ShowTime.findByPk(showtime_id);
        if (!showtime) {
            return res.status(400).json({
                message: 'Lịch chiếu không tồn tại'
            });
        }

        // Kiểm tra ghế
        const seat = await Model.Seat.findByPk(seat_id);
        if (!seat) {
            return res.status(400).json({
                message: 'Ghế không tồn tại'
            });
        }

        // Kiểm tra ghế có thuộc phòng của lịch chiếu không
        if (seat.room_id !== showtime.room_id) {
            return res.status(400).json({
                message: 'Ghế không thuộc phòng của lịch chiếu này'
            });
        }

        // Kiểm tra ghế đã được đặt chưa
        if (seat.status === 'Đã đặt') {
            return res.status(400).json({
                message: 'Ghế đã được đặt, vui lòng chọn ghế khác'
            });
        }

        if (seat.status === 'Bảo trì') {
            return res.status(400).json({
                message: 'Ghế đang bảo trì, không thể đặt'
            });
        }

        // Kiểm tra hóa đơn nếu có
        if (invoice_id) {
            const invoice = await Model.Invoice.findByPk(invoice_id);
            if (!invoice) {
                return res.status(400).json({
                    message: 'Hóa đơn không tồn tại'
                });
            }

            if (invoice.status !== 'Chưa thanh toán') {
                return res.status(400).json({
                    message: `Không thể thêm vé vào hóa đơn có trạng thái "${invoice.status}"`
                });
            }
        }

        // Lấy giá ghế nếu không được chỉ định
        const ticketPrice = price || seat.price;
        
        try {
            // Sử dụng raw query để thêm vé, tránh lỗi với trigger trg_ManageTicketAndSeat
            const result = await sequelize.query(`
                INSERT INTO Ticket (
                    bookingDate, 
                    price, 
                    showtime_id, 
                    seat_id, 
                    invoice_id
                )
                OUTPUT INSERTED.id
                VALUES (
                    GETDATE(), 
                    ${ticketPrice}, 
                    ${showtime_id}, 
                    ${seat_id}, 
                    ${invoice_id || null}
                )
            `, { type: sequelize.QueryTypes.INSERT });
            
            const ticketId = result[0][0].id;
            
            // Cập nhật trạng thái ghế thành "Đã đặt"
            await sequelize.query(`
                UPDATE Seat 
                SET status = N'Đã đặt' 
                WHERE id = ${seat_id}
            `, { type: sequelize.QueryTypes.UPDATE });
            
            // Lấy thông tin vé vừa tạo
            const newTicket = await Model.Ticket.findByPk(ticketId, {
                include: [
                    {
                        model: Model.ShowTime,
                        attributes: ['id', 'showDate', 'startTime'],
                        include: [{ 
                            model: Model.Movie, 
                            attributes: ['id', 'title'] 
                        }]
                    },
                    {
                        model: Model.Seat,
                        attributes: ['id', 'position', 'type']
                    }
                ]
            });
            
            res.status(201).json({
                message: 'Tạo vé thành công',
                data: newTicket
            });
        } catch (error) {
            // Xử lý lỗi từ trigger
            if (error.message.includes('Không thể đặt các ghế')) {
                return res.status(400).json({
                    message: 'Ghế đã được đặt, vui lòng chọn ghế khác',
                    detail: error.message
                });
            }
            throw error;
        }
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi tạo vé',
            error: error.message
        });
    }
};

// Hủy vé
module.exports.cancel = async (req, res) => {
    try {
        const id = req.params.id;
        
        // Kiểm tra vé tồn tại
        const ticket = await Model.Ticket.findByPk(id, {
            include: [
                { model: Model.Invoice },
                { model: Model.Seat }
            ]
        });
        
        if (!ticket) {
            return res.status(404).json({
                message: 'Vé không tồn tại'
            });
        }
        
        // Kiểm tra vé thuộc hóa đơn đã thanh toán không được hủy
        if (ticket.Invoice && ticket.Invoice.status === 'Đã thanh toán') {
            return res.status(400).json({
                message: 'Không thể hủy vé đã thanh toán'
            });
        }
        
        // Lưu lại seat_id trước khi xóa vé
        const seatId = ticket.seat_id;
        const invoiceId = ticket.invoice_id;
        
        // Sử dụng raw query để xóa vé, tránh lỗi với trigger
        await sequelize.query(`
            DELETE FROM Ticket WHERE id = ${id}
        `, { type: sequelize.QueryTypes.DELETE });
        
        // Cập nhật trạng thái ghế thành "Trống"
        await sequelize.query(`
            UPDATE Seat SET status = N'Trống' WHERE id = ${seatId}
        `, { type: sequelize.QueryTypes.UPDATE });
        
        // Lấy thông tin hóa đơn đã cập nhật nếu có
        let updatedInvoice = null;
        if (invoiceId) {
            updatedInvoice = await Model.Invoice.findByPk(invoiceId, {
                attributes: ['id', 'totalAmount', 'totalDiscount']
            });
        }
        
        res.status(200).json({
            message: 'Hủy vé thành công',
            data: {
                invoice: updatedInvoice
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi hủy vé',
            error: error.message
        });
    }
};

// Lấy vé theo lịch chiếu
module.exports.getByShowtime = async (req, res) => {
    try {
        const showtimeId = req.params.showtimeId;
        const { Page, Limit } = req.query;

        // Kiểm tra lịch chiếu có tồn tại không
        const showtime = await Model.ShowTime.findByPk(showtimeId);
        if (!showtime) {
            return res.status(404).json({
                message: 'Lịch chiếu không tồn tại'
            });
        }

        // Khởi tạo các biến phân trang
        let page = Page ? parseInt(Page) : 1;
        let limit = Limit ? parseInt(Limit) : 20; // Mặc định hiển thị 20 vé
        let offset = (page - 1) * limit;

        // Thực hiện truy vấn
        const { count, rows } = await Model.Ticket.findAndCountAll({
            where: { showtime_id: showtimeId },
            include: [
                {
                    model: Model.Seat,
                    attributes: ['id', 'position', 'type', 'price']
                },
                {
                    model: Model.Invoice,
                    attributes: ['id', 'status', 'createDate']
                }
            ],
            limit,
            offset,
            order: [['id', 'ASC']]
        });

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
                    endTime: showtime.endTime
                },
                tickets: rows
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
            message: 'Lỗi khi lấy danh sách vé theo lịch chiếu',
            error: error.message
        });
    }
};