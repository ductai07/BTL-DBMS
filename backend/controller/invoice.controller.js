const Model = require('../model/associations');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Lấy danh sách hóa đơn
module.exports.index = async (req, res) => {
    // Trong hàm index của controller
    try {
        // Lấy các tham số từ query
        const { SearchKey, SearchValue, SortKey, SortValue, Page, Limit, status } = req.query;
    
        // Khởi tạo các biến mặc định
        let where = {};
        let order = [['createDate', 'DESC']]; // Thêm khai báo biến order
    
        // Xử lý filter theo status
        if (status) {
            where.status = status; // Tìm kiếm chính xác
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
        }
    
        // Xử lý sắp xếp
        if (SortKey && SortValue) {
            order = [[SortKey, SortValue.toUpperCase()]]; // Lỗi: order chưa được khai báo
        } else {
            order = [['createDate', 'DESC']]; // Mặc định là thời gian tạo giảm dần
        }

        // Xử lý phan trang
        const page = parseInt(Page) || 1;
        const limit = parseInt(Limit) || 10;
        const offset = (page - 1) * limit;

        // Thực hiện truy vấn
        const { count, rows } = await Model.Invoice.findAndCountAll({
            where,
            order,
            limit,  // Biến chưa được khởi tạo
            offset, // Biến chưa được khởi tạo
            include: [
                {
                    model: Model.Customer,
                    attributes: ['id', 'fullName', 'phoneNumber']
                },
                {
                    model: Model.Employee,
                    attributes: ['id', 'fullName', 'position']
                },
                {
                    model: Model.Discount,
                    attributes: ['id', 'name', 'discountValue', 'type']
                }
            ]
        });

        // Tính toán thông tin phân trang
        const totalPages = Math.ceil(count / limit);
        const hasNext = page < totalPages; // Biến page chưa được khởi tạo
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
            message: 'Lỗi khi lấy danh sách hóa đơn',
            error: error.message
        });
    }
};

// Xem chi tiết hóa đơn
module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id;
        
        // Lấy thông tin hóa đơn
        const invoice = await Model.Invoice.findByPk(id, {
            include: [
                {
                    model: Model.Customer,
                    attributes: ['id', 'fullName', 'phoneNumber', 'email']
                },
                {
                    model: Model.Employee,
                    attributes: ['id', 'fullName', 'position']
                },
                {
                    model: Model.Discount,
                    attributes: ['id', 'name', 'discountValue', 'type', 'description']
                }
            ]
        });
        
        if (!invoice) {
            return res.status(404).json({
                message: 'Không tìm thấy hóa đơn'
            });
        }
        
        // Lấy danh sách vé của hóa đơn
        const tickets = await Model.Ticket.findAll({
            where: { invoice_id: id },
            include: [
                {
                    model: Model.ShowTime,
                    attributes: ['id', 'showDate', 'startTime', 'endTime'],
                    include: [
                        { 
                            model: Model.Movie, 
                            attributes: ['id', 'title', 'duration', 'poster'] 
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
                }
            ]
        });
        
        // Lấy danh sách sản phẩm của hóa đơn
        const products = await Model.ProductUsage.findAll({
            where: { invoice_id: id },
            include: [
                {
                    model: Model.Product,
                    attributes: ['id', 'name', 'unit', 'description']
                }
            ]
        });
        
        res.status(200).json({
            data: {
                invoice: invoice,
                tickets: tickets,
                products: products,
                totalTickets: tickets.length,
                totalProducts: products.reduce((sum, product) => sum + product.quantity, 0)
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi lấy chi tiết hóa đơn',
            error: error.message
        });
    }
};

// Tạo hóa đơn mới
module.exports.create = async (req, res) => {
    try {
        // Trong hàm create, sửa phần raw query
        const { customer_id, employee_id, discount_id, note, status } = req.body;
        
        // Sửa đoạn raw query để tạo hóa đơn
        const result = await sequelize.query(`
            INSERT INTO Invoice (
                createDate, 
                status, 
                customer_id, 
                employee_id, 
                discount_id, 
                note,
                totalDiscount,
                totalAmount
            )
            VALUES (
                GETDATE(), 
                N'${status || 'Chưa thanh toán'}', 
                ${customer_id || null}, 
                ${employee_id || null}, 
                ${discount_id || null},
                ${note ? `N'${note}'` : null},
                0,  -- Mặc định totalDiscount = 0
                0   -- Mặc định totalAmount = 0
            );
            
            SELECT SCOPE_IDENTITY() AS id;
        `, { type: sequelize.QueryTypes.RAW });
        
        const invoiceId = result[0][0].id;
        
        // Giảm số lượng mã giảm giá nếu có
        if (discount_id) {
            await sequelize.query(`
                UPDATE Discount
                SET quantity = quantity - 1
                WHERE id = ${discount_id}
            `, { type: sequelize.QueryTypes.UPDATE });
        }
        
        // Lấy thông tin hóa đơn vừa tạo
        const newInvoice = await Model.Invoice.findByPk(invoiceId, {
            include: [
                {
                    model: Model.Customer,
                    attributes: ['id', 'fullName', 'phoneNumber']
                },
                {
                    model: Model.Employee,
                    attributes: ['id', 'fullName', 'position']
                },
                {
                    model: Model.Discount,
                    attributes: ['id', 'name', 'discountValue', 'type']
                }
            ]
        });
        
        res.status(201).json({
            message: 'Tạo hóa đơn thành công',
            data: newInvoice
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi tạo hóa đơn',
            error: error.message
        });
    }
};

// Thêm vé vào hóa đơn
module.exports.addTicket = async (req, res) => {
    try {
        const invoiceId = req.params.id;
        // Chỉ lấy showtime_id và seat_id từ request, không lấy price
        const { showtime_id, seat_id } = req.body;
        
        // Kiểm tra hóa đơn tồn tại
        const invoice = await Model.Invoice.findByPk(invoiceId);
        if (!invoice) {
            return res.status(404).json({
                message: 'Hóa đơn không tồn tại'
            });
        }
        
        // Kiểm tra hóa đơn đã thanh toán chưa
        if (invoice.status !== 'Chưa thanh toán') {
            return res.status(400).json({
                message: `Không thể thêm vé vào hóa đơn có trạng thái "${invoice.status}"`
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
        
        // Lấy giá ghế nếu không được chỉ định
        const ticketPrice =  seat.price;
        
        try {
            // Sửa raw query để thêm vé, thay thế OUTPUT bằng SCOPE_IDENTITY()
            const result = await sequelize.query(`
                INSERT INTO Ticket (
                    bookingDate, 
                    price, 
                    showtime_id, 
                    seat_id, 
                    invoice_id
                )
                VALUES (
                    GETDATE(), 
                    ${ticketPrice}, 
                    ${showtime_id}, 
                    ${seat_id}, 
                    ${invoiceId}
                );
                
                SELECT SCOPE_IDENTITY() AS id;
            `, { type: sequelize.QueryTypes.RAW });
            
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
            
            // Lấy thông tin hóa đơn đã cập nhật
            const updatedInvoice = await Model.Invoice.findByPk(invoiceId, {
                attributes: ['id', 'totalAmount', 'totalDiscount']
            });
            
            res.status(201).json({
                message: 'Thêm vé vào hóa đơn thành công',
                data: {
                    ticket: newTicket,
                    invoice: updatedInvoice
                }
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
            message: 'Lỗi khi thêm vé vào hóa đơn',
            error: error.message
        });
    }
};

// Xóa vé khỏi hóa đơn
module.exports.removeTicket = async (req, res) => {
    try {
        const invoiceId = req.params.id;
        const ticketId = req.params.ticketId;
        
        // Kiểm tra hóa đơn tồn tại
        const invoice = await Model.Invoice.findByPk(invoiceId);
        if (!invoice) {
            return res.status(404).json({
                message: 'Hóa đơn không tồn tại'
            });
        }
        
        // Kiểm tra hóa đơn đã thanh toán chưa
        if (invoice.status !== 'Chưa thanh toán') {
            return res.status(400).json({
                message: `Không thể xóa vé từ hóa đơn có trạng thái "${invoice.status}"`
            });
        }
        
        // Kiểm tra vé tồn tại và thuộc hóa đơn này
        const ticket = await Model.Ticket.findOne({
            where: { 
                id: ticketId,
                invoice_id: invoiceId
            }
        });
        
        if (!ticket) {
            return res.status(404).json({
                message: 'Không tìm thấy vé trong hóa đơn này'
            });
        }
        
        // Lưu lại seat_id trước khi xóa vé
        const seatId = ticket.seat_id;
        
        // Sử dụng raw query để xóa vé, tránh lỗi với trigger
        await sequelize.query(`
            DELETE FROM Ticket WHERE id = ${ticketId}
        `, { type: sequelize.QueryTypes.DELETE });
        
        // Cập nhật trạng thái ghế thành "Trống"
        await sequelize.query(`
            UPDATE Seat SET status = N'Trống' WHERE id = ${seatId}
        `, { type: sequelize.QueryTypes.UPDATE });
        
        // Lấy thông tin hóa đơn đã cập nhật
        const updatedInvoice = await Model.Invoice.findByPk(invoiceId, {
            attributes: ['id', 'totalAmount', 'totalDiscount']
        });
        
        res.status(200).json({
            message: 'Xóa vé khỏi hóa đơn thành công',
            data: {
                invoice: updatedInvoice
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi xóa vé khỏi hóa đơn',
            error: error.message
        });
    }
};

// Thêm sản phẩm vào hóa đơn
module.exports.addProduct = async (req, res) => {
    try {
        const invoiceId = req.params.id;
        // Chỉ lấy product_id và quantity từ request, không lấy purchasePrice
        const { product_id, quantity } = req.body;
        
        // Kiểm tra hóa đơn tồn tại
        const invoice = await Model.Invoice.findByPk(invoiceId);
        if (!invoice) {
            return res.status(404).json({
                message: 'Hóa đơn không tồn tại'
            });
        }
        
        // Kiểm tra hóa đơn đã thanh toán chưa
        if (invoice.status !== 'Chưa thanh toán') {
            return res.status(400).json({
                message: `Không thể thêm sản phẩm vào hóa đơn có trạng thái "${invoice.status}"`
            });
        }
        
        // Kiểm tra sản phẩm
        const product = await Model.Product.findByPk(product_id);
        if (!product) {
            return res.status(400).json({
                message: 'Sản phẩm không tồn tại'
            });
        }
        
        // Kiểm tra số lượng
        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                message: 'Số lượng phải lớn hơn 0'
            });
        }
        
        // Kiểm tra tồn kho
        if (product.quantity < quantity) {
            return res.status(400).json({
                message: `Sản phẩm "${product.name}" chỉ còn ${product.quantity} ${product.unit}`
            });
        }
        
        try {
            const result = await sequelize.query(`
                -- Cập nhật số lượng sản phẩm trong kho
                UPDATE Product
                SET quantity = quantity - ${quantity}
                WHERE id = ${product_id};
                
                -- Thêm sản phẩm vào hóa đơn
                INSERT INTO ProductUsage (
                    quantity, 
                    purchasePrice, 
                    product_id, 
                    invoice_id
                )
                VALUES (
                    ${quantity}, 
                    ${product.price}, 
                    ${product_id}, 
                    ${invoiceId}
                );
                
                SELECT SCOPE_IDENTITY() AS id;
            `, { type: sequelize.QueryTypes.RAW });
            
            // Parse ID từ kết quả
            const productUsageId = result[0][0].id || result[0]?.id;
            
            // Lấy thông tin sản phẩm vừa thêm
            const productUsage = await Model.ProductUsage.findByPk(productUsageId, {
                include: [{
                    model: Model.Product,
                    attributes: ['id', 'name', 'unit']
                }]
            });
            
            // Lấy thông tin hóa đơn đã cập nhật
            const updatedInvoice = await Model.Invoice.findByPk(invoiceId, {
                attributes: ['id', 'totalAmount', 'totalDiscount']
            });
            
            res.status(201).json({
                message: 'Thêm sản phẩm vào hóa đơn thành công',
                data: {
                    productUsage: productUsage,
                    invoice: updatedInvoice
                }
            });
        } catch (error) {
            // Xử lý lỗi từ trigger
            if (error.message.includes('Không đủ số lượng trong kho')) {
                return res.status(400).json({
                    message: 'Không đủ số lượng sản phẩm trong kho',
                    detail: error.message
                });
            }
            throw error;
        }
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi thêm sản phẩm vào hóa đơn',
            error: error.message
        });
    }
};

// Xóa sản phẩm khỏi hóa đơn
module.exports.removeProduct = async (req, res) => {
    try {
        const invoiceId = req.params.id;
        const productUsageId = req.params.productUsageId;
        
        // Kiểm tra hóa đơn tồn tại
        const invoice = await Model.Invoice.findByPk(invoiceId);
        if (!invoice) {
            return res.status(404).json({
                message: 'Hóa đơn không tồn tại'
            });
        }
        
        // Kiểm tra hóa đơn đã thanh toán chưa
        if (invoice.status !== 'Chưa thanh toán') {
            return res.status(400).json({
                message: `Không thể xóa sản phẩm từ hóa đơn có trạng thái "${invoice.status}"`
            });
        }
        
        // Kiểm tra sản phẩm tồn tại và thuộc hóa đơn này
        const productUsage = await Model.ProductUsage.findOne({
            where: { 
                id: productUsageId,
                invoice_id: invoiceId
            },
            include: [{
                model: Model.Product
            }]
        });
        
        if (!productUsage) {
            return res.status(404).json({
                message: 'Không tìm thấy sản phẩm trong hóa đơn này'
            });
        }
        
        // Dùng raw query để xóa sản phẩm và cập nhật lại tồn kho
        await sequelize.query(`
            -- Cập nhật lại số lượng sản phẩm trong kho
            UPDATE Product
            SET quantity = quantity + ${productUsage.quantity}
            WHERE id = ${productUsage.product_id};
            
            -- Xóa sản phẩm khỏi hóa đơn
            DELETE FROM ProductUsage WHERE id = ${productUsageId};
        `, { type: sequelize.QueryTypes.RAW });
        
        // Lấy thông tin hóa đơn đã cập nhật
        const updatedInvoice = await Model.Invoice.findByPk(invoiceId, {
            attributes: ['id', 'totalAmount', 'totalDiscount']
        });
        
        res.status(200).json({
            message: 'Xóa sản phẩm khỏi hóa đơn thành công',
            data: {
                invoice: updatedInvoice
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi xóa sản phẩm khỏi hóa đơn',
            error: error.message
        });
    }
};

// Thanh toán hóa đơn
module.exports.payment = async (req, res) => {
    try {
        const id = req.params.id;
        const { paymentMethod } = req.body;
        
        if (!paymentMethod) {
            return res.status(400).json({
                message: 'Vui lòng cung cấp phương thức thanh toán'
            });
        }
        
        // Kiểm tra hóa đơn tồn tại
        const invoice = await Model.Invoice.findByPk(id);
        if (!invoice) {
            return res.status(404).json({
                message: 'Hóa đơn không tồn tại'
            });
        }
        
        // Kiểm tra hóa đơn chưa thanh toán
        if (invoice.status !== 'Chưa thanh toán') {
            return res.status(400).json({
                message: `Không thể thanh toán hóa đơn có trạng thái "${invoice.status}"`
            });
        }
        
        // Kiểm tra hóa đơn có vé hoặc sản phẩm nào không
        const ticketCount = await Model.Ticket.count({ where: { invoice_id: id } });
        const productCount = await Model.ProductUsage.count({ where: { invoice_id: id } });
        
        if (ticketCount === 0 && productCount === 0) {
            return res.status(400).json({
                message: 'Hóa đơn không có vé hoặc sản phẩm nào'
            });
        }
        
        // Cập nhật trạng thái hóa đơn
        await sequelize.query(`
            UPDATE Invoice
            SET status = N'Đã thanh toán', paymentMethod = N'${paymentMethod}'
            WHERE id = ${id}
        `, { type: sequelize.QueryTypes.UPDATE });
        
        // Lấy thông tin hóa Đơn đã thanh toán
        const updatedInvoice = await Model.Invoice.findByPk(id, {
            include: [
                {
                    model: Model.Customer,
                    attributes: ['id', 'fullName', 'phoneNumber']
                },
                {
                    model: Model.Employee,
                    attributes: ['id', 'fullName']
                },
                {
                    model: Model.Discount,
                    attributes: ['id', 'name', 'discountValue', 'type']
                }
            ]
        });
        
        res.status(200).json({
            message: 'Thanh toán hóa đơn thành công',
            data: updatedInvoice
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi thanh toán hóa đơn',
            error: error.message
        });
    }
};

// Xóa hóa đơn
// Xóa hóa đơn
// Xóa hóa đơn
module.exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        
        // Kiểm tra hóa đơn tồn tại
        const invoice = await Model.Invoice.findByPk(id);
        if (!invoice) {
            return res.status(404).json({
                message: 'Hóa đơn không tồn tại'
            });
        }
        
        // Xóa các sản phẩm trong hóa đơn (nếu có)
        await sequelize.query(`
            -- Cập nhật lại số lượng sản phẩm trong kho
            UPDATE Product
            SET quantity = quantity + PU.quantity
            FROM Product P
            INNER JOIN ProductUsage PU ON P.id = PU.product_id
            WHERE PU.invoice_id = ${id};
            
            -- Xóa sản phẩm khỏi hóa đơn
            DELETE FROM ProductUsage WHERE invoice_id = ${id};
        `, { type: sequelize.QueryTypes.RAW });
        
        // Xóa các vé trong hóa đơn (nếu có)
        await sequelize.query(`
            -- Cập nhật lại trạng thái ghế
            UPDATE Seat
            SET status = N'Trống'
            FROM Seat S
            INNER JOIN Ticket T ON S.id = T.seat_id
            WHERE T.invoice_id = ${id};
            
            -- Xóa vé khỏi hóa đơn
            DELETE FROM Ticket WHERE invoice_id = ${id};
        `, { type: sequelize.QueryTypes.RAW });
        
        // Xóa hóa đơn
        await Model.Invoice.destroy({ where: { id } });
        
        res.status(200).json({
            message: 'Xóa hóa đơn thành công'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi xóa hóa đơn',
            error: error.message
        });
    }
};
