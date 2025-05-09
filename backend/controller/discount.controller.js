const Model = require('../model/associations');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Lấy danh sách khuyến mãi với tìm kiếm, sắp xếp, phân trang
module.exports.index = async (req, res) => {
    try {
        console.log("Endpoint: /discount");
        console.log("Request query params:", req.query);
        
        // Lấy các tham số từ query
        const { SearchKey, SearchValue, SortKey, SortValue, Page, Limit, status } = req.query;

        // Khởi tạo các biến mặc định
        let where = {};
        let order = [];
        let page = Page ? parseInt(Page) : 1;
        let limit = Limit ? parseInt(Limit) : 10;
        let offset = (page - 1) * limit;

        // Xử lý lọc theo trạng thái
        console.log("Status filter:", status);
        
        if (status && status !== 'all') {
            const today = new Date();
            
            if (status === 'active') {
                // Đang hoạt động: startDate <= today <= endDate
                where = {
                    ...where,
                    startDate: { [Op.lte]: today },
                    endDate: { [Op.gte]: today }
                };
            } else if (status === 'expired') {
                // Đã kết thúc: endDate < today
                where = {
                    ...where,
                    endDate: { [Op.lt]: today }
                };
            } else if (status === 'upcoming') {
                // Sắp tới: startDate > today
                where = {
                    ...where,
                    startDate: { [Op.gt]: today }
                };
            }
        }

        // Xử lý tìm kiếm
        if (SearchKey && SearchValue) {
            try {
                where = {
                    ...where,
                    [SearchKey]: {
                        [Op.like]: `%${SearchValue}%`
                    }
                };
            } catch (error) {
                console.error("Error with search parameters:", error.message);
                // Continue without search if there's an error
            }
        }

        console.log("Final where clause:", where);
        console.log("Limit:", limit, "Offset:", offset);

        // Xử lý sắp xếp
        if (SortKey && SortValue) {
            order = [[SortKey, SortValue.toUpperCase()]];
        } else {
            // Default sorting by start date (newest first)
            order = [['startDate', 'DESC']];
        }

        console.log("Starting query for discounts...");
        
        // Thực hiện truy vấn
        const result = await Model.Discount.findAndCountAll({
            where,
            order,
            limit,
            offset
        });
        
        console.log(`Found ${result.count} discounts`);

        // Normalize the data structure for frontend
        const normalizedData = result.rows.map(item => {
            const plain = item.get ? item.get({ plain: true }) : item;
            
            // Calculate status based on dates
            const calculatedStatus = determineStatus(plain.startDate, plain.endDate);
            
            // Return a normalized discount object
            return {
                id: plain.id,
                name: plain.name || '',
                type: plain.type || 'percentage',
                description: plain.description || '',
                quantity: plain.quantity || 0,
                discountValue: plain.discountValue || 0,
                startDate: plain.startDate || new Date(),
                endDate: plain.endDate || new Date(),
                status: calculatedStatus
            };
        });

        console.log(`Returning ${normalizedData.length} promotions`);

        // Tính toán thông tin phân trang
        const totalPages = Math.ceil(result.count / limit);
        const hasNext = page < totalPages;
        const hasPrevious = page > 1;

        // Trả về kết quả
        res.status(200).json({
            data: normalizedData,
            pagination: {
                total: result.count,
                totalPages,
                currentPage: page,
                pageSize: limit,
                hasNext,
                hasPrevious
            }
        });
    } catch (error) {
        console.error("Global error in discount index:", error);
        res.status(500).json({
            message: 'Error retrieving discounts',
            error: error.message,
            data: [], // Return empty array instead of failing
            pagination: {
                total: 0,
                totalPages: 0,
                currentPage: 1,
                pageSize: 10,
                hasNext: false,
                hasPrevious: false
            }
        });
    }
};

// Helper function to determine promotion status
function determineStatus(startDate, endDate) {
    const today = new Date();
    startDate = startDate ? new Date(startDate) : null;
    endDate = endDate ? new Date(endDate) : null;
    
    if (!startDate || !endDate) return "unknown";
    
    if (today < startDate) return "upcoming";
    if (today > endDate) return "expired";
    return "active";
}

// Endpoint for getting just active promotions
module.exports.getActive = async (req, res) => {
    try {
        console.log("Endpoint: /discount/active");
        
        const today = new Date();
        
        // Get active discounts
        const discounts = await Model.Discount.findAll({
            where: {
                startDate: { [Op.lte]: today },
                endDate: { [Op.gte]: today }
            },
            order: [['startDate', 'DESC']]
        });
        
        const activeDiscounts = discounts.map(d => {
            const plain = d.get({ plain: true });
            return {
                ...plain,
                status: 'active'
            };
        });
        
        console.log(`Found ${activeDiscounts.length} active discounts`);
        
        res.status(200).json({
            data: activeDiscounts
        });
    } catch (error) {
        console.error("Error in getActive:", error.message);
        res.status(500).json({
            message: 'Error retrieving active promotions',
            error: error.message,
            data: [] // Return empty array instead of failing
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
        console.log('discountValue-BE:', discountValue);
        // Kiểm tra loại giảm giá hợp lệ
        if (type && type !== 'Fixed'.toLowerCase() && type !== 'Percentage'.toLowerCase()) {
            return res.status(400).json({
                message: 'Invalid discount type. Must be either "Fixed" or "Percentage"'
            });
        }

        // Kiểm tra giá trị khuyến mãi hợp lệ
        if (type === 'Percentage'.toLowerCase() && (discountValue < 0 || discountValue > 100)) {
            return res.status(400).json({
                message: 'Percentage discount must be between 0 and 100'
            });
        }

        if (type === 'Fixed'.toLowerCase() && discountValue < 0) {
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
            message: `Discount created successfully`,
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
        if (type && type !== 'Fixed'.toLowerCase() && type !== 'Percentage'.toLowerCase()) {
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

