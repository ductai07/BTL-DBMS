const seatModel = require('../model/seat.model');
const paginationHelper = require('../helper/pagination');
module.exports.index = async (req, res) => {
    try {
        // Lấy tất cả tham số query
        const { sortKey, sortValue, page = 1, limit = 10, searchKey, searchValue } = req.query;
        // Xác thực tham số tìm kiếm
        if (searchKey && !['position', 'type', 'status', 'room_id'].includes(searchKey)) {
            return res.status(400).json({ 
                error: 'Invalid search key. Valid options are: position, type, status, room_id' 
            });
        }
        // Xác thực tham số sắp xếp
        if (sortKey && !['id', 'position', 'price'].includes(sortKey)) {
            return res.status(400).json({ 
                error: 'Invalid sort key. Valid options are: id, position, price' 
            });
        }
        if (sortValue && !['asc', 'desc'].includes(sortValue.toLowerCase())) {
            return res.status(400).json({ 
                error: 'Invalid sort value. Valid options are: asc, desc' 
            });
        }
        // Xác thực tham số phân trang
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 10;
        if (pageNumber < 1) {
            return res.status(400).json({ error: 'Page must be a positive number' });
        }
        if (limitNumber < 1 || limitNumber > 100) {
            return res.status(400).json({ error: 'Limit must be between 1 and 100' });
        }
        // Lấy tổng số bản ghi để tính phân trang
        const count = await seatModel.countSeats(searchKey, searchValue);
        // Sử dụng helper pagination để tính toán
        const paginationInfo = paginationHelper(pageNumber, count, limitNumber);
        // Gọi hàm lấy dữ liệu với pagination
        const data = await seatModel.getSeats({
            sortKey,
            sortValue,
            searchKey,
            searchValue,
            skip: paginationInfo.skip,
            limit: paginationInfo.limitItems
        });
        // Trả về kết quả với thông tin phân trang
        res.status(200).json(data);
    } catch (error) {
        console.error('Error in index:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id;
        const seat = await seatModel.getSeatById(id);
        if (!seat || seat.length === 0) {
            return res.status(404).json({ error: 'Seat not found' });
        }
        res.status(200).json(seat[0]);
    } catch (error) {
        console.error('Error in detail:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
module.exports.changeStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const status = req.body.status;
        // Kiểm tra status có được cung cấp không
        if (status === undefined || status === null) {
            return res.status(400).json({ error: 'Status is required' });
        }
        // Kiểm tra status có hợp lệ không
        if(status !== 'active' && status !== 'inactive') {
            return res.status(400).json({ error: 'Status must be either "active" hoặc "inactive"' });
        }
        // Gọi model để cập nhật status
        const result = await seatModel.updateSeatStatus(id, status);
        if (!result) {
            return res.status(404).json({ error: 'Seat not found' });
        }
        res.status(200).json({ message: 'Seat status updated successfully' });
    } catch (error) {
        console.error('Error in changeStatus:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
module.exports.create = async (req, res) => {
    try {
        const { position, type, status, price, room_id } = req.body;
        
        // Kiểm tra các trường bắt buộc
        if (!position || !type || !price || !room_id) {
            return res.status(400).json({ 
                error: 'Missing required fields: position, type, price, room_id' 
            });
        }
        // Kiểm tra price có phải là số dương không
        if (isNaN(price) || parseFloat(price) < 0) {
            return res.status(400).json({ error: 'Price must be a non-negative number' });
        }
        // Tạo đối tượng ghế mới với xử lý trường không bắt buộc
        const seatData = {
            position,
            type,
            status: status || 'Trống',
            price: parseFloat(price),
            room_id: parseInt(room_id)
        };
        
        // Gọi model để tạo ghế mới
        const newSeat = await seatModel.createSeat(seatData);
        if (!newSeat) {
            return res.status(400).json({ error: 'Failed to create seat' });
        }
        res.status(201).json({ 
            message: 'Seat created successfully', 
            seat: newSeat 
        });
    } catch (error) {
        console.error('Error in create:', error);
        // Xử lý lỗi khóa ngoại
        if (error.message.includes('FOREIGN KEY')) {
            return res.status(400).json({ error: 'Room ID does not exist' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;
        const { position, type, status, price, room_id } = req.body;
        
        // Kiểm tra ghế có tồn tại không
        const existingSeat = await seatModel.getSeatById(id);
        if (!existingSeat || existingSeat.length === 0) {
            return res.status(404).json({ error: 'Seat not found' });
        }
        // Kiểm tra các trường bắt buộc
        if (!position || !type || !status || !price || !room_id) {
            return res.status(400).json({ 
                error: 'Missing required fields: position, type, status, price, room_id' 
            });
        }
        // Kiểm tra price có phải là số dương không
        if (isNaN(price) || parseFloat(price) < 0) {
            return res.status(400).json({ error: 'Price must be a non-negative number' });
        }
        // Tạo đối tượng ghế với dữ liệu cập nhật
        const seatData = {
            position,
            type,
            status,
            price: parseFloat(price),
            room_id: parseInt(room_id)
        };
        // Gọi model để cập nhật ghế
        const updatedSeat = await seatModel.updateSeat(id, seatData);
        if (!updatedSeat) {
            return res.status(400).json({ error: 'Failed to update seat' });
        }
        res.status(200).json({ 
            message: 'Seat updated successfully', 
            seat: updatedSeat 
        });
    } catch (error) {
        console.error('Error in edit:', error);
        // Xử lý lỗi khóa ngoại
        if (error.message.includes('FOREIGN KEY')) {
            return res.status(400).json({ error: 'Room ID does not exist' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
module.exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        // Gọi model để xóa ghế
        const deletedSeat = await seatModel.deleteSeat(id);
        // Xử lý các trường hợp lỗi
        if (deletedSeat === null) {
            return res.status(404).json({ error: 'Seat not found' });
        }
        if (deletedSeat === false) {
            return res.status(400).json({ error: 'Failed to delete seat' });
        }
        // Trả về kết quả thành công
        res.status(200).json({ 
            message: 'Seat deleted successfully', 
            seat: deletedSeat 
        });
    } catch (error) {
        console.error('Error in delete:', error);
        // Xử lý lỗi ràng buộc khóa ngoại
        if (error.message.includes('referenced by other records')) {
            return res.status(400).json({ 
                error: error.message
            });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
}