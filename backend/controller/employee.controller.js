const Model = require('../model/associations');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Lấy danh sách nhân viên
module.exports.index = async (req, res) => {
    try {
        // Lấy các tham số từ query
        const { SearchKey, SearchValue, SortKey, SortValue, Page, Limit, position } = req.query;

        // Khởi tạo các biến mặc định
        let where = {};
        let order = [];
        let page = Page ? parseInt(Page) : 1;
        let limit = Limit ? parseInt(Limit) : 10;
        let offset = (page - 1) * limit;

        // Lọc theo vị trí làm việc
        if (position) {
            where.position = position;
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
        const { count, rows } = await Model.Employee.findAndCountAll({
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
            message: 'Lỗi khi lấy danh sách nhân viên',
            error: error.message
        });
    }
};

// Xem chi tiết thông tin nhân viên
module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id;
        
        const employee = await Model.Employee.findByPk(id, {
            attributes: {
                exclude: ['password'] // Loại bỏ mật khẩu khỏi kết quả
            }
        });
        
        if (!employee) {
            return res.status(404).json({
                message: 'Không tìm thấy nhân viên'
            });
        }
        
        // Đếm số hóa đơn đã xử lý bởi nhân viên
        const invoiceCount = await Model.Invoice.count({
            where: { employee_id: id }
        });
        
        // Tính tổng doanh thu từ các hóa đơn đã thanh toán mà nhân viên xử lý
        const totalRevenue = await Model.Invoice.sum('totalAmount', {
            where: { 
                employee_id: id,
                status: 'Đã thanh toán'
            }
        });
        
        res.status(200).json({
            data: {
                ...employee.get({ plain: true }),
                statistics: {
                    invoiceCount,
                    totalRevenue: totalRevenue || 0
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi lấy thông tin nhân viên',
            error: error.message
        });
    }
};

// Thêm nhân viên mới
module.exports.add = async (req, res) => {
    try {
        const { fullName, phoneNumber, position, email, username, password } = req.body;
        
        // Kiểm tra các trường bắt buộc
        if (!fullName || !phoneNumber || !position) {
            return res.status(400).json({
                message: 'Tên, số điện thoại và vị trí làm việc là bắt buộc'
            });
        }
        
        // Kiểm tra username đã tồn tại chưa (nếu có)
        if (username) {
            const existingUsername = await Model.Employee.findOne({ where: { username } });
            if (existingUsername) {
                return res.status(400).json({
                    message: 'Tên đăng nhập đã tồn tại'
                });
            }
        }
        
        // Sử dụng raw query để tránh vấn đề với triggers
        const result = await sequelize.query(`
            INSERT INTO Employee (fullName, phoneNumber, position, username, password, email)
            VALUES (N'${fullName}', '${phoneNumber}', N'${position}', ${username ? `'${username}'` : null}, ${password ? `'${password}'` : null}, ${email ? `'${email}'` : null});
            
            SELECT SCOPE_IDENTITY() AS id;
        `, { type: sequelize.QueryTypes.SELECT });
        
        const newEmployeeId = result[0]?.id;
        
        // Lấy thông tin nhân viên vừa tạo
        const newEmployee = await Model.Employee.findByPk(newEmployeeId, {
            attributes: {
                exclude: ['password']
            }
        });
        
        res.status(201).json({
            message: 'Thêm nhân viên thành công',
            data: newEmployee
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi thêm nhân viên',
            error: error.message
        });
    }
};

// Cập nhật thông tin nhân viên
module.exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const { fullName, phoneNumber, position, email, username, password } = req.body;
        
        const employee = await Model.Employee.findByPk(id);
        
        if (!employee) {
            return res.status(404).json({
                message: 'Không tìm thấy nhân viên'
            });
        }
        
        // Kiểm tra username nếu thay đổi
        if (username && username !== employee.username) {
            const existingUsername = await Model.Employee.findOne({ 
                where: { 
                    username,
                    id: { [Op.ne]: id } // Không tính chính nhân viên này
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
        
        if (position !== undefined) {
            updateFields.push("position = ?");
            updateValues.push(position);
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
            `UPDATE Employee SET ${updateFields.join(', ')} WHERE id = ?`,
            { 
                replacements: updateValues,
                type: sequelize.QueryTypes.UPDATE
            }
        );
        
        // Lấy thông tin đã cập nhật
        const updatedEmployee = await Model.Employee.findByPk(id, {
            attributes: {
                exclude: ['password']
            }
        });
        
        res.status(200).json({
            message: 'Cập nhật thông tin nhân viên thành công',
            data: updatedEmployee
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi cập nhật thông tin nhân viên',
            error: error.message
        });
    }
};

// Xóa nhân viên
module.exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        
        const employee = await Model.Employee.findByPk(id);
        
        if (!employee) {
            return res.status(404).json({
                message: 'Không tìm thấy nhân viên'
            });
        }
        
        // Kiểm tra nhân viên có liên quan đến hóa đơn hay không
        const hasInvoices = await Model.Invoice.count({
            where: { employee_id: id }
        });
        
        if (hasInvoices > 0) {
            return res.status(400).json({
                message: 'Không thể xóa nhân viên đã xử lý hóa đơn. Hãy cân nhắc vô hiệu hóa tài khoản thay vì xóa.'
            });
        }
        
        // Thực hiện xóa nhân viên
        await sequelize.query(
            `DELETE FROM Employee WHERE id = ?`,
            { 
                replacements: [id],
                type: sequelize.QueryTypes.DELETE
            }
        );
        
        res.status(200).json({
            message: 'Xóa nhân viên thành công'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi xóa nhân viên',
            error: error.message
        });
    }
};

