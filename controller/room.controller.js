const roomModel = require('../model/room.model');
const paginationHelper = require('../helper/pagination');

module.exports.index = async (req, res) => {
    try {
        // Lấy tất cả tham số query
        const { sortKey, sortValue, page = 1, limit = 10, searchKey, searchValue } = req.query;
        // Xác thực tham số tìm kiếm
        if (searchKey && !['name', 'type', 'status', 'cinema_id'].includes(searchKey)) {
            return res.status(400).json({ 
                error: 'Invalid search key. Valid options are: name, type, status, cinema_id' 
            });
        }
        // Xác thực tham số sắp xếp
        if (sortKey && !['id', 'seatCount'].includes(sortKey)) {
            return res.status(400).json({ 
                error: 'Invalid sort key. Valid options are: id, seatCount' 
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
        const count = await roomModel.countRooms(searchKey, searchValue);
        // Sử dụng helper pagination để tính toán
        const paginationInfo = paginationHelper(pageNumber, count, limitNumber);
        // Gọi hàm lấy dữ liệu với pagination
        const data = await roomModel.getRooms({
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
        const room = await roomModel.getRoomById(id);
        
        if (!room || room.length === 0) {
            return res.status(404).json({ error: 'Room not found' });
        }
        
        res.status(200).json(room[0]);
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
        if(status !== 'active' && status !== 'inactive' && status !== 'maintenance') {
            return res.status(400).json({ error: 'Status must be either active, inactive or maintenance' });
        }
        
        // Gọi model để cập nhật status
        const result = await roomModel.updateRoomStatus(id, status);
        
        if (!result) {
            return res.status(404).json({ error: 'Room not found' });
        }
        
        res.status(200).json({ message: 'Room status updated successfully' });
    } catch (error) {
        console.error('Error in changeStatus:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports.create = async (req, res) => {
    try {
        const { name, type, seatCount, status, cinema_id } = req.body;
        
        // Kiểm tra các trường bắt buộc
        if (!name || !type || !seatCount || !cinema_id) {
            return res.status(400).json({ 
                error: 'Missing required fields: name, type, seatCount, cinema_id' 
            });
        }
        
        // Kiểm tra seatCount có phải là số dương không
        if (isNaN(seatCount) || parseInt(seatCount) <= 0) {
            return res.status(400).json({ error: 'seatCount must be a positive number' });
        }
        
        // Tạo đối tượng phòng mới với xử lý trường không bắt buộc
        const roomData = {
            name,
            type,
            seatCount: parseInt(seatCount),
            status: status || 'active',
            cinema_id: parseInt(cinema_id)
        };
        
        // Gọi model để tạo phòng mới
        const newRoom = await roomModel.createRoom(roomData);
        
        if (!newRoom) {
            return res.status(400).json({ error: 'Failed to create room' });
        }
        
        res.status(201).json({ 
            message: 'Room created successfully', 
            room: newRoom 
        });
    } catch (error) {
        console.error('Error in create:', error);
        
        // Xử lý lỗi khóa ngoại
        if (error.message.includes('FOREIGN KEY')) {
            return res.status(400).json({ error: 'Cinema ID does not exist' });
        }
        
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, type, seatCount, status, cinema_id } = req.body;
        
        // Kiểm tra phòng có tồn tại không
        const existingRoom = await roomModel.getRoomById(id);
        if (!existingRoom || existingRoom.length === 0) {
            return res.status(404).json({ error: 'Room not found' });
        }
        
        // Kiểm tra các trường bắt buộc
        if (!name || !type || !seatCount || !cinema_id) {
            return res.status(400).json({ 
                error: 'Missing required fields: name, type, seatCount, cinema_id' 
            });
        }
        
        // Kiểm tra seatCount có phải là số dương không
        if (isNaN(seatCount) || parseInt(seatCount) <= 0) {
            return res.status(400).json({ error: 'seatCount must be a positive number' });
        }
        
        // Tạo đối tượng phòng với dữ liệu cập nhật
        const roomData = {
            name,
            type,
            seatCount: parseInt(seatCount),
            status: status || existingRoom[0].status,
            cinema_id: parseInt(cinema_id)
        };
        
        // Gọi model để cập nhật phòng
        const updatedRoom = await roomModel.updateRoom(id, roomData);
        
        if (!updatedRoom) {
            return res.status(400).json({ error: 'Failed to update room' });
        }
        
        res.status(200).json({ 
            message: 'Room updated successfully', 
            room: updatedRoom 
        });
    } catch (error) {
        console.error('Error in edit:', error);
        
        // Xử lý lỗi khóa ngoại
        if (error.message.includes('FOREIGN KEY')) {
            return res.status(400).json({ error: 'Cinema ID does not exist' });
        }
        
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        
        // Gọi model để xóa phòng
        const deletedRoom = await roomModel.deleteRoom(id);
        
        // Xử lý các trường hợp lỗi
        if (deletedRoom === null) {
            return res.status(404).json({ error: 'Room not found' });
        }
        
        if (deletedRoom === false) {
            return res.status(400).json({ error: 'Failed to delete room' });
        }
        
        // Trả về kết quả thành công
        res.status(200).json({ 
            message: 'Room deleted successfully', 
            room: deletedRoom 
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