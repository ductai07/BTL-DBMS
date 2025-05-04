const Model = require('../model/associations');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Lấy danh sách khách hàng
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
        const { count, rows } = await Model.Customer.findAndCountAll({
            where,
            order,
            limit,
            offset,
            attributes: {
                exclude: ['password'] // Loại bỏ mật khẩu khỏi kết quả
            }
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
            message: 'Lỗi khi lấy danh sách khách hàng',
            error: error.message
        });
    }
};

// Xem chi tiết thông tin khách hàng
module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id;
        
        const customer = await Model.Customer.findByPk(id, {
            attributes: {
                exclude: ['password'] // Loại bỏ mật khẩu khỏi kết quả
            }
        });
        
        if (!customer) {
            return res.status(404).json({
                message: 'Không tìm thấy khách hàng'
            });
        }
        
        // Đếm số hóa đơn của khách hàng
        const invoiceCount = await Model.Invoice.count({
            where: { customer_id: id }
        });
        
        // Tính tổng chi tiêu của khách hàng
        const totalSpending = await Model.Invoice.sum('totalAmount', {
            where: { 
                customer_id: id,
                status: 'Đã thanh toán'
            }
        });
        
        res.status(200).json({
            data: {
                ...customer.get({ plain: true }),
                statistics: {
                    invoiceCount,
                    totalSpending: totalSpending || 0
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi lấy thông tin khách hàng',
            error: error.message
        });
    }
};

// Thêm khách hàng mới
module.exports.add = async (req, res) => {
    try {
        const { fullName, phoneNumber, email, username, password } = req.body;
        
        // Kiểm tra các trường bắt buộc
        if (!fullName || !phoneNumber) {
            return res.status(400).json({
                message: 'Tên và số điện thoại là bắt buộc'
            });
        }
        
        // Kiểm tra username đã tồn tại chưa (nếu có)
        if (username) {
            const existingUsername = await Model.Customer.findOne({ where: { username } });
            if (existingUsername) {
                return res.status(400).json({
                    message: 'Tên đăng nhập đã tồn tại'
                });
            }
        }
        
        // Sử dụng raw query để tránh vấn đề với triggers
        const result = await sequelize.query(`
            INSERT INTO Customer (fullName, phoneNumber, username, password, email)
            VALUES (N'${fullName}', '${phoneNumber}', ${username ? `'${username}'` : null}, ${password ? `'${password}'` : null}, ${email ? `'${email}'` : null});
            
            SELECT SCOPE_IDENTITY() AS id;
        `, { type: sequelize.QueryTypes.SELECT });
        
        const newCustomerId = result[0]?.id;
        
        // Lấy thông tin khách hàng vừa tạo
        const newCustomer = await Model.Customer.findByPk(newCustomerId, {
            attributes: {
                exclude: ['password']
            }
        });
        
        res.status(201).json({
            message: 'Thêm khách hàng thành công',
            data: newCustomer
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi thêm khách hàng',
            error: error.message
        });
    }
};

// Cập nhật thông tin khách hàng
module.exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const { fullName, phoneNumber, email, username, password } = req.body;
        
        const customer = await Model.Customer.findByPk(id);
        
        if (!customer) {
            return res.status(404).json({
                message: 'Không tìm thấy khách hàng'
            });
        }
        
        // Kiểm tra username nếu thay đổi
        if (username && username !== customer.username) {
            const existingUsername = await Model.Customer.findOne({ 
                where: { 
                    username,
                    id: { [Op.ne]: id } // Không tính chính khách hàng này
                } 
            });
            
            if (existingUsername) {
                return res.status(400).json({
                    message: 'Tên đăng nhập đã tồn tại'
                });
            }
        }
        
        // Xây dựng câu lệnh SQL để cập nhật
        let updateFields = [];
        let updateValues = [];
        
        if (fullName !== undefined) {
            updateFields.push("fullName = ?");
            updateValues.push(fullName);
        }
        
        if (phoneNumber !== undefined) {
            updateFields.push("phoneNumber = ?");
            updateValues.push(phoneNumber);
        }
        
        if (email !== undefined) {
            updateFields.push("email = ?");
            updateValues.push(email);
        }
        
        if (username !== undefined) {
            updateFields.push("username = ?");
            updateValues.push(username);
        }
        
        if (password !== undefined) {
            updateFields.push("password = ?");
            updateValues.push(password);
        }
        
        // Nếu không có trường nào được cập nhật
        if (updateFields.length === 0) {
            return res.status(400).json({
                message: 'Không có thông tin nào được cập nhật'
            });
        }
        
        // Thêm tham số ID vào mảng values
        updateValues.push(id);
        
        // Thực hiện truy vấn cập nhật
        await sequelize.query(
            `UPDATE Customer SET ${updateFields.join(', ')} WHERE id = ?`,
            { 
                replacements: updateValues,
                type: sequelize.QueryTypes.UPDATE
            }
        );
        
        // Lấy thông tin đã cập nhật
        const updatedCustomer = await Model.Customer.findByPk(id, {
            attributes: {
                exclude: ['password']
            }
        });
        
        res.status(200).json({
            message: 'Cập nhật thông tin khách hàng thành công',
            data: updatedCustomer
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi cập nhật thông tin khách hàng',
            error: error.message
        });
    }
};

// Xóa khách hàng
module.exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        
        const customer = await Model.Customer.findByPk(id);
        
        if (!customer) {
            return res.status(404).json({
                message: 'Không tìm thấy khách hàng'
            });
        }
        
        // Kiểm tra khách hàng có hóa đơn hay không
        const hasInvoices = await Model.Invoice.count({
            where: { customer_id: id }
        });
        
        if (hasInvoices > 0) {
            return res.status(400).json({
                message: 'Không thể xóa khách hàng đã có hóa đơn. Hãy cân nhắc vô hiệu hóa thay vì xóa.'
            });
        }
        
        // Thực hiện xóa khách hàng
        await sequelize.query(
            `DELETE FROM Customer WHERE id = ?`,
            { 
                replacements: [id],
                type: sequelize.QueryTypes.DELETE
            }
        );
        
        res.status(200).json({
            message: 'Xóa khách hàng thành công'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi xóa khách hàng',
            error: error.message
        });
    }
};