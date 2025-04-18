const database = require('../config/database');

module.exports.getRooms = async (options = {}) => {
    try {
        const { sortKey, sortValue, searchKey, searchValue, skip = 0, limit = 10 } = options;
        const pool = await database.connect();
        const request = pool.request();
        
        // Xây dựng câu truy vấn động
        let query = `
            SELECT r.*, c.name as cinema_name 
            FROM Room r
            LEFT JOIN Cinema c ON r.cinema_id = c.id
        `;
        let whereConditions = [];
        // Thêm điều kiện tìm kiếm nếu có searchKey và searchValue
        if (searchKey && searchValue !== undefined) {
            const validColumns = ['name', 'type', 'status'];
            
            if (validColumns.includes(searchKey)) {
                whereConditions.push(`r.${searchKey} LIKE @searchValue`);
                request.input('searchValue', `%${searchValue}%`);
            } 
            else if (searchKey === 'cinema_id' && !isNaN(searchValue)) {
                whereConditions.push(`r.cinema_id = @cinemaId`);
                request.input('cinemaId', parseInt(searchValue));
            }
        }
        // Gộp tất cả điều kiện với WHERE
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }
        // Thêm sắp xếp nếu có sortKey và sortValue
        if (sortKey && sortValue) {
            // Danh sách các cột hợp lệ để tránh SQL injection
            const validColumns = ['id', 'seatCount'];
            if (!validColumns.includes(sortKey)) {
                throw new Error(`Invalid sort column: ${sortKey}`);
            }
            // Xác định hướng sắp xếp
            const sortDirection = sortValue.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
            query += ` ORDER BY r.${sortKey} ${sortDirection}`;
        } else {
            // Mặc định sắp xếp theo id
            query += ' ORDER BY r.id ASC';
        }
        // Thêm phân trang
        query += ' OFFSET @skip ROWS FETCH NEXT @limit ROWS ONLY';
        request.input('skip', skip);
        request.input('limit', limit);
        const result = await request.query(query);
        return result.recordset;
    } catch (error) {
        throw new Error('Error fetching rooms: ' + error.message);
    }
}

module.exports.countRooms = async (searchKey, searchValue) => {
    try {
        const pool = await database.connect();
        const request = pool.request();
        
        let query = 'SELECT COUNT(*) AS total FROM Room r';
        let whereConditions = [];
        
        // Thêm điều kiện tìm kiếm nếu có searchKey và searchValue
        if (searchKey && searchValue !== undefined) {
            const validColumns = ['name', 'type', 'status'];
            
            if (validColumns.includes(searchKey)) {
                whereConditions.push(`r.${searchKey} LIKE @searchValue`);
                request.input('searchValue', `%${searchValue}%`);
            }
            else if (searchKey === 'cinema_id' && !isNaN(searchValue)) {
                whereConditions.push(`r.cinema_id = @cinemaId`);
                request.input('cinemaId', parseInt(searchValue));
            }
        }
        
        // Gộp tất cả điều kiện với WHERE
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }
        
        const result = await request.query(query);
        return result.recordset[0].total;
    } catch (error) {
        throw new Error('Error counting rooms: ' + error.message);
    }
}

module.exports.getRoomById = async (id) => {
    try {
        const pool = await database.connect();
        const result = await pool.request()
            .input('id', id)
            .query(`
                SELECT r.*, c.name as cinema_name 
                FROM Room r
                LEFT JOIN Cinema c ON r.cinema_id = c.id
                WHERE r.id = @id
            `);
        return result.recordset;
    } catch (error) {
        throw new Error('Error fetching room details: ' + error.message);
    }
}

module.exports.updateRoomStatus = async (id, status) => {
    try {
        const pool = await database.connect();
        const result = await pool.request()
            .input('id', id)
            .input('status', status)
            .query('UPDATE Room SET status = @status WHERE id = @id');
        
        return result.rowsAffected[0] > 0; // Trả về true nếu có bản ghi được cập nhật
    } catch (error) {
        throw new Error('Error updating room status: ' + error.message);
    }
}

module.exports.createRoom = async (roomData) => {
    try {
        const pool = await database.connect();
        
        // Sử dụng SCOPE_IDENTITY() để lấy ID vừa được tạo
        const result = await pool.request()
            .input('name', roomData.name)
            .input('type', roomData.type)
            .input('seatCount', roomData.seatCount)
            .input('status', roomData.status || 'active')
            .input('cinema_id', roomData.cinema_id)
            .query(`
                INSERT INTO Room (name, type, seatCount, status, cinema_id)
                VALUES (@name, @type, @seatCount, @status, @cinema_id);
                SELECT SCOPE_IDENTITY() AS id;
            `);
        
        // Lấy ID vừa được tạo
        const newId = result.recordset[0].id;
        
        // Truy vấn để lấy toàn bộ thông tin của bản ghi mới
        const newRoom = await pool.request()
            .input('id', newId)
            .query(`
                SELECT r.*, c.name as cinema_name 
                FROM Room r
                LEFT JOIN Cinema c ON r.cinema_id = c.id
                WHERE r.id = @id
            `);
        
        // Trả về đối tượng room đầy đủ
        return newRoom.recordset[0];
    } catch (error) {
        throw new Error('Error creating room: ' + error.message);
    }
}

module.exports.updateRoom = async (id, roomData) => {
    try {
        const pool = await database.connect();
        
        // Cập nhật thông tin phòng
        const updateResult = await pool.request()
            .input('id', id)
            .input('name', roomData.name)
            .input('type', roomData.type)
            .input('seatCount', roomData.seatCount)
            .input('status', roomData.status)
            .input('cinema_id', roomData.cinema_id)
            .query(`
                UPDATE Room 
                SET name = @name,
                    type = @type,
                    seatCount = @seatCount,
                    status = @status,
                    cinema_id = @cinema_id
                WHERE id = @id
            `);
        
        // Kiểm tra xem có bản ghi nào được cập nhật không
        if (updateResult.rowsAffected[0] === 0) {
            return false;
        }
        
        // Lấy thông tin phòng sau khi cập nhật
        const result = await pool.request()
            .input('id', id)
            .query(`
                SELECT r.*, c.name as cinema_name 
                FROM Room r
                LEFT JOIN Cinema c ON r.cinema_id = c.id
                WHERE r.id = @id
            `);
        
        return result.recordset[0];
    } catch (error) {
        throw new Error('Error updating room: ' + error.message);
    }
}

module.exports.deleteRoom = async (id) => {
    try {
        // Lưu trữ thông tin phòng trước khi xóa (để trả về)
        const pool = await database.connect();
        
        // Lấy thông tin phòng trước khi xóa
        const roomInfo = await pool.request()
            .input('id', id)
            .query(`
                SELECT r.*, c.name as cinema_name 
                FROM Room r
                LEFT JOIN Cinema c ON r.cinema_id = c.id
                WHERE r.id = @id
            `);
        
        if (roomInfo.recordset.length === 0) {
            return null; // Không tìm thấy phòng
        }
        
        // Thực hiện xóa phòng
        const deleteResult = await pool.request()
            .input('id', id)
            .query('DELETE FROM Room WHERE id = @id');
        
        // Kiểm tra kết quả xóa
        if (deleteResult.rowsAffected[0] === 0) {
            return false; // Không có phòng nào bị xóa
        }
        
        // Trả về thông tin phòng đã xóa
        return roomInfo.recordset[0];
    } catch (error) {
        // Xử lý lỗi ràng buộc khóa ngoại
        if (error.message.includes('REFERENCE constraint') || error.message.includes('foreign key')) {
            throw new Error('Cannot delete this room because it is referenced by other records (seats, showtimes, etc.)');
        }
        throw new Error('Error deleting room: ' + error.message);
    }
}