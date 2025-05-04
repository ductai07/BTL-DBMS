const Model = require('../model/associations');
const { Op } = require('sequelize');

// Lấy danh sách khuyến mãi với tìm kiếm, sắp xếp, phân trang
module.exports.index = async (req, res) => {
    try {
        // Lấy các tham số từ query
        const { SearchKey, SearchValue, SortKey, SortValue, Page, Limit, status } = req.query;

        // Khởi tạo các biến mặc định
        let where = {};
        let order = [];
        let page = Page ? parseInt(Page) : 1;
        let limit = Limit ? parseInt(Limit) : 10;
        let offset = (page - 1) * limit;

        // Lọc theo trạng thái (đang hoạt động, hết hạn, chưa đến hạn)
        if (status) {
            const currentDate = new Date();
            
            if (status === 'active') {
                where = {
                    ...where,
                    startDate: { [Op.lte]: currentDate },
                    endDate: { [Op.gte]: currentDate },
                    quantity: { [Op.gt]: 0 }
                };
            } else if (status === 'expired') {
                where = {
                    ...where,
                    [Op.or]: [
                        { endDate: { [Op.lt]: currentDate } },
                        { quantity: 0 }
                    ]
                };
            } else if (status === 'upcoming') {
                where = {
                    ...where,
                    startDate: { [Op.gt]: currentDate }
                };
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

        // Xử lý sắp xếp
        if (SortKey && SortValue) {
            order = [[SortKey, SortValue.toUpperCase()]];
        } else {
            order = [['startDate', 'DESC']]; // Sắp xếp mặc định theo ngày bắt đầu mới nhất
        }

        // Thực hiện truy vấn
        const { count, rows } = await Model.Discount.findAndCountAll({
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
            message: 'Error retrieving discounts',
            error: error.message
        });
    }
};

// Xem chi tiết khuyến mãi
module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id;
        
        const discount = await Model.Discount.findByPk(id);
        
        if (!discount) {
            return res.status(404).json({
                message: 'Discount not found'
            });
        }
        
        // Đếm số hóa đơn đã sử dụng khuyến mãi này
        const invoiceCount = await Model.Invoice.count({
            where: { discount_id: id }
        });
        
        // Kiểm tra trạng thái khuyến mãi
        const currentDate = new Date();
        let status;
        
        if (discount.quantity <= 0) {
            status = 'Đã hết lượt';
        } else if (discount.endDate < currentDate) {
            status = 'Đã hết hạn';
        } else if (discount.startDate > currentDate) {
            status = 'Chưa đến hạn';
        } else {
            status = 'Đang hoạt động';
        }
        
        res.status(200).json({
            data: {
                ...discount.get({ plain: true }),
                usageCount: invoiceCount,
                remainingQuantity: discount.quantity,
                status: status
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving discount details',
            error: error.message
        });
    }
};

// Thêm khuyến mãi mới
module.exports.add = async (req, res) => {
    try {
        const {
            name,
            type,
            description,
            quantity,
            discountValue,
            startDate,
            endDate
        } = req.body;

        // Kiểm tra loại giảm giá hợp lệ
        if (type && type !== 'Fixed' && type !== 'Percentage') {
            return res.status(400).json({
                message: 'Invalid discount type. Must be either "Fixed" or "Percentage"'
            });
        }

        // Kiểm tra giá trị khuyến mãi hợp lệ
        if (type === 'Percentage' && (discountValue < 0 || discountValue > 100)) {
            return res.status(400).json({
                message: 'Percentage discount must be between 0 and 100'
            });
        }

        if (type === 'Fixed' && discountValue < 0) {
            return res.status(400).json({
                message: 'Fixed discount value cannot be negative'
            });
        }

        // Kiểm tra số lượng không âm
        if (quantity !== undefined && quantity < 0) {
            return res.status(400).json({
                message: 'Quantity cannot be negative'
            });
        }

        // Kiểm tra tên khuyến mãi không trùng
        const existingDiscount = await Model.Discount.findOne({
            where: { name }
        });

        if (existingDiscount) {
            return res.status(400).json({
                message: 'Discount name already exists'
            });
        }

        // Kiểm tra thời gian hợp lệ
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({
                message: 'Start date must be before end date'
            });
        }

        const discount = await Model.Discount.create({
            name,
            type,
            description,
            quantity: quantity || 0,
            discountValue,
            startDate,
            endDate
        });

        res.status(201).json({
            message: 'Discount created successfully',
            data: discount
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating discount',
            error: error.message
        });
    }
};

// Sửa thông tin khuyến mãi
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;
        const {
            name,
            type,
            description,
            quantity,
            discountValue,
            startDate,
            endDate
        } = req.body;

        const discount = await Model.Discount.findByPk(id);
        
        if (!discount) {
            return res.status(404).json({
                message: 'Discount not found'
            });
        }

        // Kiểm tra loại giảm giá hợp lệ
        if (type && type !== 'Fixed' && type !== 'Percentage') {
            return res.status(400).json({
                message: 'Invalid discount type. Must be either "Fixed" or "Percentage"'
            });
        }

        // Kiểm tra giá trị khuyến mãi hợp lệ
        if (type === 'Percentage' && (discountValue < 0 || discountValue > 100)) {
            return res.status(400).json({
                message: 'Percentage discount must be between 0 and 100'
            });
        }

        if (type === 'Fixed' && discountValue !== undefined && discountValue < 0) {
            return res.status(400).json({
                message: 'Fixed discount value cannot be negative'
            });
        }

        // Kiểm tra số lượng không âm
        if (quantity !== undefined && quantity < 0) {
            return res.status(400).json({
                message: 'Quantity cannot be negative'
            });
        }

        // Kiểm tra tên khuyến mãi không trùng (nếu sửa tên)
        if (name && name !== discount.name) {
            const existingDiscount = await Model.Discount.findOne({
                where: { 
                    name,
                    id: { [Op.ne]: id }
                }
            });

            if (existingDiscount) {
                return res.status(400).json({
                    message: 'Discount name already exists'
                });
            }
        }

        // Kiểm tra thời gian hợp lệ
        const newStartDate = startDate || discount.startDate;
        const newEndDate = endDate || discount.endDate;
        
        if (newStartDate && newEndDate && new Date(newStartDate) > new Date(newEndDate)) {
            return res.status(400).json({
                message: 'Start date must be before end date'
            });
        }

        // Cập nhật thông tin
        await discount.update({
            name: name !== undefined ? name : discount.name,
            type: type !== undefined ? type : discount.type,
            description: description !== undefined ? description : discount.description,
            quantity: quantity !== undefined ? quantity : discount.quantity,
            discountValue: discountValue !== undefined ? discountValue : discount.discountValue,
            startDate: startDate !== undefined ? startDate : discount.startDate,
            endDate: endDate !== undefined ? endDate : discount.endDate
        });

        res.status(200).json({
            message: 'Discount updated successfully',
            data: discount
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating discount',
            error: error.message
        });
    }
};

// Xóa khuyến mãi
module.exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const discount = await Model.Discount.findByPk(id);
        
        if (!discount) {
            return res.status(404).json({
                message: 'Discount not found'
            });
        }

        // Kiểm tra xem khuyến mãi có đang được sử dụng không
        const invoiceCount = await Model.Invoice.count({
            where: { discount_id: id }
        });

        if (invoiceCount > 0) {
            return res.status(400).json({
                message: `Cannot delete discount. It is being used in ${invoiceCount} invoices.`,
                invoiceCount
            });
        }

        await discount.destroy();

        res.status(200).json({
            message: 'Discount deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting discount',
            error: error.message
        });
    }
};

