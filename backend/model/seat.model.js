const database = require('../config/database');

module.exports.getSeats = async (options = {}) => {
    try {
        const { sortKey, sortValue, searchKey, searchValue, skip = 0, limit = 10 } = options;
        const pool = await database.connect();
        const request = pool.request();
        // Xây dựng câu truy vấn động
        let query = `
            SELECT s.*, r.name as room_name 
            FROM Seat s
            LEFT JOIN Room r ON s.room_id = r.id
        `;
        let whereConditions = [];
        // Thêm điều kiện tìm kiếm nếu có searchKey và searchValue
        if (searchKey && searchValue !== undefined) {
            const validColumns = ['position', 'type', 'status'];
            if (validColumns.includes(searchKey)) {
                whereConditions.push(`s.${searchKey} LIKE @searchValue`);
                request.input('searchValue', `%${searchValue}%`);
            } 
            else if (searchKey === 'room_id' && !isNaN(searchValue)) {
                whereConditions.push(`s.room_id = @roomId`);
                request.input('roomId', parseInt(searchValue));
            }
        }
        
        // Gộp tất cả điều kiện với WHERE
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }
        // Thêm sắp xếp nếu có sortKey và sortValue
        if (sortKey && sortValue) {
            // Danh sách các cột hợp lệ để tránh SQL injection
            const validColumns = ['id', 'position', 'price'];
            if (!validColumns.includes(sortKey)) {
                throw new Error(`Invalid sort column: ${sortKey}`);
            }
            // Xác định hướng sắp xếp
            const sortDirection = sortValue.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
            query += ` ORDER BY s.${sortKey} ${sortDirection}`;
        } else {
            // Mặc định sắp xếp theo id
            query += ' ORDER BY s.id ASC';
        }
        // Thêm phân trang
        query += ' OFFSET @skip ROWS FETCH NEXT @limit ROWS ONLY';
        request.input('skip', skip);
        request.input('limit', limit);
        const result = await request.query(query);
        return result.recordset;
    } catch (error) {
        throw new Error('Error fetching seats: ' + error.message);
    }
}
module.exports.countSeats = async (searchKey, searchValue) => {
    try {
        const pool = await database.connect();
        const request = pool.request();
        
        let query = 'SELECT COUNT(*) AS total FROM Seat s';
        let whereConditions = [];
        // Thêm điều kiện tìm kiếm nếu có searchKey và searchValue
        if (searchKey && searchValue !== undefined) {
            const validColumns = ['position', 'type', 'status'];
            
            if (validColumns.includes(searchKey)) {
                whereConditions.push(`s.${searchKey} LIKE @searchValue`);
                request.input('searchValue', `%${searchValue}%`);
            }
            else if (searchKey === 'room_id' && !isNaN(searchValue)) {
                whereConditions.push(`s.room_id = @roomId`);
                request.input('roomId', parseInt(searchValue));
            }
        }
        // Gộp tất cả điều kiện với WHERE
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }
        const result = await request.query(query);
        return result.recordset[0].total;
    } catch (error) {
        throw new Error('Error counting seats: ' + error.message);
    }
}
module.exports.getSeatById = async (id) => {
    try {
        const pool = await database.connect();
        const result = await pool.request()
            .input('id', id)
            .query(`
                SELECT s.*, r.name as room_name 
                FROM Seat s
                LEFT JOIN Room r ON s.room_id = r.id
                WHERE s.id = @id
            `);
        return result.recordset;
    } catch (error) {
        throw new Error('Error fetching seat details: ' + error.message);
    }
}
module.exports.updateSeatStatus = async (id, status) => {
    try {
        const pool = await database.connect();
        const result = await pool.request()
            .input('id', id)
            .input('status', status)
            .query('UPDATE Seat SET status = @status WHERE id = @id');
        
        return result.rowsAffected[0] > 0; // Trả về true nếu có bản ghi được cập nhật
    } catch (error) {
        throw new Error('Error updating seat status: ' + error.message);
    }
}
module.exports.createSeat = async (seatData) => {
    try {
        const pool = await database.connect();
        // Sử dụng SCOPE_IDENTITY() để lấy ID vừa được tạo
        const result = await pool.request()
            .input('position', seatData.position)
            .input('type', seatData.type)
            .input('status', seatData.status || 'Trống')
            .input('price', seatData.price)
            .input('room_id', seatData.room_id)
            .query(`
                INSERT INTO Seat (position, type, status, price, room_id)
                VALUES (@position, @type, @status, @price, @room_id);
                SELECT SCOPE_IDENTITY() AS id;
            `);
        // Lấy ID vừa được tạo
        const newId = result.recordset[0].id;
        // Truy vấn để lấy toàn bộ thông tin của bản ghi mới
        const newSeat = await pool.request()
            .input('id', newId)
            .query(`
                SELECT s.*, r.name as room_name 
                FROM Seat s
                LEFT JOIN Room r ON s.room_id = r.id
                WHERE s.id = @id
            `);
        // Trả về đối tượng seat đầy đủ
        return newSeat.recordset[0];
    } catch (error) {
        throw new Error('Error creating seat: ' + error.message);
    }
}
module.exports.updateSeat = async (id, seatData) => {
    try {
        const pool = await database.connect();
        // Cập nhật thông tin ghế
        const updateResult = await pool.request()
            .input('id', id)
            .input('position', seatData.position)
            .input('type', seatData.type)
            .input('status', seatData.status)
            .input('price', seatData.price)
            .input('room_id', seatData.room_id)
            .query(`
                UPDATE Seat 
                SET position = @position,
                    type = @type,
                    status = @status,
                    price = @price,
                    room_id = @room_id
                WHERE id = @id
            `);
        // Kiểm tra xem có bản ghi nào được cập nhật không
        if (updateResult.rowsAffected[0] === 0) {
            return false;
        }
        // Lấy thông tin ghế sau khi cập nhật
        const result = await pool.request()
            .input('id', id)
            .query(`
                SELECT s.*, r.name as room_name 
                FROM Seat s
                LEFT JOIN Room r ON s.room_id = r.id
                WHERE s.id = @id
            `);
        return result.recordset[0];
    } catch (error) {
        throw new Error('Error updating seat: ' + error.message);
    }
}
module.exports.deleteSeat = async (id) => {
    try {
        // Lưu trữ thông tin ghế trước khi xóa (để trả về)
        const pool = await database.connect();
        // Lấy thông tin ghế trước khi xóa
        const seatInfo = await pool.request()
            .input('id', id)
            .query(`
                SELECT s.*, r.name as room_name 
                FROM Seat s
                LEFT JOIN Room r ON s.room_id = r.id
                WHERE s.id = @id
            `);
        if (seatInfo.recordset.length === 0) {
            return null; // Không tìm thấy ghế
        }
        // Thực hiện xóa ghế
        const deleteResult = await pool.request()
            .input('id', id)
            .query('DELETE FROM Seat WHERE id = @id');
        // Kiểm tra kết quả xóa
        if (deleteResult.rowsAffected[0] === 0) {
            return false; // Không có ghế nào bị xóa
        }
        // Trả về thông tin ghế đã xóa
        return seatInfo.recordset[0];
    } catch (error) {
        // Xử lý lỗi ràng buộc khóa ngoại
        if (error.message.includes('REFERENCE constraint') || error.message.includes('foreign key')) {
            throw new Error('Cannot delete this seat because it is referenced by other records (tickets)');
        }
        throw new Error('Error deleting seat: ' + error.message);
    }
}