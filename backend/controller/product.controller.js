const Model = require('../model/associations');
const { Op } = require('sequelize');

// Lấy danh sách sản phẩm với tìm kiếm, sắp xếp, phân trang
module.exports.index = async (req, res) => {
    try {
        // Lấy các tham số từ query
        const { SearchKey, SearchValue, SortKey, SortValue, Page, Limit, minPrice, maxPrice } = req.query;

        // Khởi tạo các biến mặc định
        let where = {};
        let order = [];
        let page = Page ? parseInt(Page) : 1;
        let limit = Limit ? parseInt(Limit) : 10;
        let offset = (page - 1) * limit;

        // Lọc theo khoảng giá nếu có
        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {};
            if (minPrice !== undefined) {
                where.price[Op.gte] = parseFloat(minPrice);
            }
            if (maxPrice !== undefined) {
                where.price[Op.lte] = parseFloat(maxPrice);
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
            order = [['name', 'ASC']]; // Sắp xếp mặc định theo tên
        }

        // Thực hiện truy vấn
        const { count, rows } = await Model.Product.findAndCountAll({
            where,
            order,
            limit,
            offset
        });

        // Tính toán tổng giá trị tồn kho
        const totalInventoryValue = rows.reduce((sum, product) => {
            return sum + (product.price * product.quantity);
        }, 0);

        // Tính toán thông tin phân trang
        const totalPages = Math.ceil(count / limit);
        const hasNext = page < totalPages;
        const hasPrevious = page > 1;

        res.status(200).json({
            data: rows,
            inventoryValue: totalInventoryValue,
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
            message: 'Error retrieving products',
            error: error.message
        });
    }
};

// Xem chi tiết sản phẩm
module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id;
        
        const product = await Model.Product.findByPk(id);
        
        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }
        
        // Lấy lịch sử sử dụng sản phẩm (10 giao dịch gần nhất)
        const usageHistory = await Model.ProductUsage.findAll({
            where: { product_id: id },
            include: [
                {
                    model: Model.Invoice,
                    attributes: ['id', 'createDate', 'status']
                }
            ],
            order: [['id', 'DESC']],
            limit: 10
        });
        
        // Tính tổng giá trị tồn kho của sản phẩm này
        const inventoryValue = product.price * product.quantity;
        
        res.status(200).json({
            data: {
                ...product.get({ plain: true }),
                inventoryValue,
                recentUsage: usageHistory
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving product details',
            error: error.message
        });
    }
};

// Thêm sản phẩm mới
module.exports.add = async (req, res) => {
    try {
        const { name, price, unit, quantity, description } = req.body;

        // Kiểm tra tên sản phẩm
        if (!name || name.trim() === '') {
            return res.status(400).json({
                message: 'Product name is required'
            });
        }

        // Kiểm tra giá không âm
        if (price !== undefined && price < 0) {
            return res.status(400).json({
                message: 'Price cannot be negative'
            });
        }

        // Kiểm tra số lượng không âm
        if (quantity !== undefined && quantity < 0) {
            return res.status(400).json({
                message: 'Quantity cannot be negative'
            });
        }

        // Kiểm tra đơn vị
        if (!unit || unit.trim() === '') {
            return res.status(400).json({
                message: 'Unit is required'
            });
        }

        // Tạo sản phẩm mới
        const product = await Model.Product.create({
            name,
            price: price || 0,
            unit,
            quantity: quantity || 0,
            description
        });

        res.status(201).json({
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating product',
            error: error.message
        });
    }
};

// Sửa thông tin sản phẩm
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, price, unit, quantity, description } = req.body;

        const product = await Model.Product.findByPk(id);
        
        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        // Kiểm tra tên sản phẩm nếu được cung cấp
        if (name !== undefined && name.trim() === '') {
            return res.status(400).json({
                message: 'Product name cannot be empty'
            });
        }

        // Kiểm tra giá không âm
        if (price !== undefined && price < 0) {
            return res.status(400).json({
                message: 'Price cannot be negative'
            });
        }

        // Kiểm tra số lượng không âm
        if (quantity !== undefined && quantity < 0) {
            return res.status(400).json({
                message: 'Quantity cannot be negative'
            });
        }

        // Kiểm tra đơn vị nếu được cung cấp
        if (unit !== undefined && unit.trim() === '') {
            return res.status(400).json({
                message: 'Unit cannot be empty'
            });
        }

        // Cập nhật thông tin
        await product.update({
            name: name !== undefined ? name : product.name,
            price: price !== undefined ? price : product.price,
            unit: unit !== undefined ? unit : product.unit,
            quantity: quantity !== undefined ? quantity : product.quantity,
            description: description !== undefined ? description : product.description
        });

        res.status(200).json({
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating product',
            error: error.message
        });
    }
};

// Xóa sản phẩm
module.exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await Model.Product.findByPk(id);
        
        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        // Kiểm tra xem sản phẩm có đang được sử dụng trong hóa đơn không
        const usageCount = await Model.ProductUsage.count({
            where: { product_id: id }
        });

        if (usageCount > 0) {
            return res.status(400).json({
                message: `Cannot delete product. It is being used in ${usageCount} invoices.`,
                usageCount
            });
        }

        await product.destroy();

        res.status(200).json({
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting product',
            error: error.message
        });
    }
};