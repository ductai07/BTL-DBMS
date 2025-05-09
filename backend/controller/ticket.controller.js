const Model = require('../model/associations');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Lấy danh sách vé
module.exports.index = async (req, res) => {
    try {
        // Lấy các tham số từ query
        const { SearchKey, SearchValue, SortKey, SortValue, Page, Limit, status, showtimeId, movieId, cinemaId, date } = req.query;

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

        // Lọc theo ngày chiếu
        if (date) {
            where['$ShowTime.showDate$'] = date;
        }

        // Lọc theo trạng thái hóa đơn
        if (status) {
            where['$Invoice.status$'] = status;
        }

        // Phần còn lại của hàm giữ nguyên
        // ...
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
            order = [['bookingDate', 'DESC']]; // Sắp xếp mặc định theo ngày đặt mới nhất
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
                    attributes: ['id', 'startTime', 'showDate', 'movie_id', 'room_id'],
                    include: [
                        {
                            model: Model.Movie,
                            attributes: ['id', 'title', 'poster']
                        },
                        {
                            model: Model.Room,
                            attributes: ['id', 'name', 'cinema_id'],
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
                    attributes: ['id', 'position', 'type', 'room_id']
                },
                {
                    model: Model.Invoice,
                    attributes: ['id', 'status', 'createDate', 'customer_id']
                }
            ]
        });

        // Tính toán thông tin phân trang
        const totalPages = Math.ceil(count / limit);
        const hasNext = page < totalPages;
        const hasPrevious = page > 1;

        // Format dữ liệu để gửi về client
        const formattedTickets = rows.map(ticket => {
            const data = ticket.get({ plain: true });
            return {
                id: data.id,
                movieTitle: data.ShowTime?.Movie?.title || 'Không xác định',
                roomName: data.ShowTime?.Room?.name || 'Không xác định',
                cinemaName: data.ShowTime?.Room?.Cinema?.name || 'Không xác định',
                seatNumber: data.Seat?.position || 'Không xác định',
                showDate: data.ShowTime?.showDate || null,
                showTime: data.ShowTime?.startTime || null,
                price: data.price || 0,
                status: data.Invoice?.status || 'Chưa thanh toán',
                bookingDate: data.bookingDate,
                // Thông tin chi tiết khác
                movieId: data.ShowTime?.Movie?.id || null,
                roomId: data.ShowTime?.Room?.id || null,
                cinemaId: data.ShowTime?.Room?.Cinema?.id || null,
                seatId: data.Seat?.id || null,
                showtimeId: data.showtime_id,
                invoiceId: data.invoice_id,
                qrCode: data.qrCode
            };
        });

        res.status(200).json({
            data: formattedTickets,
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
        
        const ticket = await Model.Ticket.findByPk(id, {
            include: [
                {
                    model: Model.ShowTime,
                    attributes: ['id', 'startTime', 'endTime', 'showDate'],
                    include: [
                        {
                            model: Model.Movie,
                            attributes: ['id', 'title', 'poster', 'duration']
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
                    attributes: ['id', 'position', 'type']
                },
                {
                    model: Model.Invoice,
                    attributes: ['id', 'totalAmount', 'status', 'createDate', 'customer_id'],
                    include: [
                        {
                            model: Model.Customer,
                            attributes: ['id', 'fullName', 'phoneNumber', 'email']
                        }
                    ]
                }
            ]
        });
        
        if (!ticket) {
            return res.status(404).json({
                message: 'Không tìm thấy vé'
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

// Thêm vé mới
module.exports.add = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { showtime_id, seat_id, price, invoice_id, bookingDate } = req.body;

        // Kiểm tra tham số bắt buộc
        if (!showtime_id || !seat_id) {
            return res.status(400).json({
                message: 'Thiếu thông tin lịch chiếu hoặc ghế ngồi'
            });
        }

        // Kiểm tra xem ghế đã được đặt trong lịch chiếu này chưa
        const existingTicket = await Model.Ticket.findOne({
            where: {
                showtime_id,
                seat_id
            },
            transaction
        });

        if (existingTicket) {
            await transaction.rollback();
            return res.status(400).json({
                message: 'Ghế này đã được đặt cho lịch chiếu đã chọn'
            });
        }

        // Tạo dữ liệu vé mới
        const ticketData = {
            showtime_id,
            seat_id,
            price: price || 0,
            invoice_id: invoice_id || null,
            bookingDate: bookingDate || new Date().toISOString().split('T')[0],
            qrCode: `TICKET-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        };

        // Sửa câu lệnh SQL để không thêm trường status
        const [result] = await sequelize.query(
            `DECLARE @OutputTable TABLE (id INT);
             INSERT INTO Ticket (showtime_id, seat_id, price, invoice_id, bookingDate, qrCode) 
             OUTPUT INSERTED.id INTO @OutputTable
             VALUES (:showtime_id, :seat_id, :price, :invoice_id, :bookingDate, :qrCode);
             SELECT id FROM @OutputTable;`,
            {
                replacements: ticketData,
                type: sequelize.QueryTypes.INSERT,
                transaction
            }
        );

        // Lấy ID của vé vừa tạo
        const newTicketId = result[0].id;

        // Commit transaction
        await transaction.commit();

        // Lấy thông tin vé vừa tạo kèm các thông tin liên quan
        const ticket = await Model.Ticket.findByPk(newTicketId, {
            include: [
                {
                    model: Model.ShowTime,
                    include: [
                        {
                            model: Model.Movie
                        },
                        {
                            model: Model.Room,
                            include: [
                                {
                                    model: Model.Cinema
                                }
                            ]
                        }
                    ]
                },
                {
                    model: Model.Seat
                }
            ]
        });

        res.status(201).json({
            message: 'Tạo vé thành công',
            data: ticket
        });
    } catch (error) {
        // Rollback transaction nếu có lỗi
        if (transaction) await transaction.rollback();
        
        console.error('Chi tiết lỗi khi tạo vé:', error);
        res.status(500).json({
            message: 'Lỗi khi tạo vé',
            error: error.message
        });
    }
};

// Cập nhật vé
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;
        const { showtime_id, seat_id, price, invoice_id } = req.body;

        const ticket = await Model.Ticket.findByPk(id);
        
        if (!ticket) {
            return res.status(404).json({
                message: 'Không tìm thấy vé'
            });
        }

        // Nếu thay đổi lịch chiếu và ghế, kiểm tra xem đã có vé nào cho cặp này chưa
        if ((showtime_id && showtime_id !== ticket.showtime_id) || 
            (seat_id && seat_id !== ticket.seat_id)) {
            
            const existingTicket = await Model.Ticket.findOne({
                where: {
                    showtime_id: showtime_id || ticket.showtime_id,
                    seat_id: seat_id || ticket.seat_id,
                    id: { [Op.ne]: id } // Loại trừ vé hiện tại
                }
            });

            if (existingTicket) {
                return res.status(400).json({
                    message: 'Ghế này đã được đặt cho lịch chiếu đã chọn'
                });
            }
        }

        // Cập nhật thông tin vé
        await ticket.update({
            showtime_id: showtime_id !== undefined ? showtime_id : ticket.showtime_id,
            seat_id: seat_id !== undefined ? seat_id : ticket.seat_id,
            price: price !== undefined ? price : ticket.price,
            invoice_id: invoice_id !== undefined ? invoice_id : ticket.invoice_id
        });

        // Lấy thông tin vé kèm các thông tin liên quan
        const updatedTicket = await Model.Ticket.findByPk(id, {
            include: [
                {
                    model: Model.ShowTime,
                    include: [
                        {
                            model: Model.Movie
                        },
                        {
                            model: Model.Room,
                            include: [
                                {
                                    model: Model.Cinema
                                }
                            ]
                        }
                    ]
                },
                {
                    model: Model.Seat
                }
            ]
        });

        res.status(200).json({
            message: 'Cập nhật vé thành công',
            data: updatedTicket
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi cập nhật vé',
            error: error.message
        });
    }
};

// Xóa vé
module.exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const ticket = await Model.Ticket.findByPk(id);
        
        if (!ticket) {
            return res.status(404).json({
                message: 'Không tìm thấy vé'
            });
        }

        await ticket.destroy();

        res.status(200).json({
            message: 'Xóa vé thành công'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi xóa vé',
            error: error.message
        });
    }
};

// Lấy danh sách vé theo lịch chiếu
module.exports.getTicketsByShowtime = async (req, res) => {
    try {
        const showtimeId = req.params.showtimeId;
        
        // Kiểm tra lịch chiếu
        const showtime = await Model.ShowTime.findByPk(showtimeId);
        if (!showtime) {
            return res.status(404).json({
                message: 'Không tìm thấy lịch chiếu'
            });
        }
        
        // Lấy tất cả vé của lịch chiếu này
        const tickets = await Model.Ticket.findAll({
            where: { showtime_id: showtimeId },
            include: [
                {
                    model: Model.Seat,
                    attributes: ['id', 'position', 'type']
                }
            ]
        });
        
        res.status(200).json({
            data: tickets
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi lấy danh sách vé theo lịch chiếu',
            error: error.message
        });
    }
};