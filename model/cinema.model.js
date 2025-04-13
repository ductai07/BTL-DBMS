const database = require('../config/database');
module.exports.getCinemas = async (options = {}) => {
    try {
        const { status, sortKey, sortValue, skip = 0, limit = 10 } = options;
        const pool = await database.connect();
        const request = pool.request();
        // Xây dựng câu truy vấn động
        let query = 'SELECT * FROM Cinema';
        // Thêm điều kiện WHERE nếu có status
        if (status !== undefined && status !== null && status !== '') {
            query += ' WHERE status = @status';
            request.input('status', status);
        }
        // Thêm sắp xếp nếu có sortKey và sortValue
        if (sortKey && sortValue) {
            // Danh sách các cột hợp lệ để tránh SQL injection
            const validColumns = ['id', 'name', 'address', 'status'];
            if (!validColumns.includes(sortKey)) {
                throw new Error(`Invalid sort column: ${sortKey}`);
            }
            // Xác định hướng sắp xếp
            const sortDirection = sortValue.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
            query += ` ORDER BY ${sortKey} ${sortDirection}`;
        } else {
            // Mặc định sắp xếp theo id
            query += ' ORDER BY id ASC';
        }
        // Thêm phân trang - sử dụng skip từ helper pagination
        query += ' OFFSET @skip ROWS FETCH NEXT @limit ROWS ONLY';
        request.input('skip', skip);
        request.input('limit', limit);
        
        const result = await request.query(query);
        return result.recordset;
    } catch (error) {
        throw new Error('Error fetching cinemas: ' + error.message);
    }
}
module.exports.getCinemaById = async (id) => {
    try {
        const pool = await database.connect();
        const result = await pool.request()
            .input('id', id)
            .query('SELECT * FROM Cinema WHERE id = @id');
        return result.recordset;
    } catch (error) {
        throw new Error('Error fetching data from database: ' + error.message);
    }
}
module.exports.countCinemas = async () => {
    try {
        const pool = await database.connect();
        let query = 'SELECT COUNT(*) AS total FROM Cinema';
        const result = await pool.request().query(query);
        return result.recordset[0].total;
    } catch (error) {
        throw new Error('Error counting cinemas: ' + error.message);
    }
}
module.exports.updateCinemaStatus = async (id, status) => {
    try {
        const pool = await database.connect();
        const result = await pool.request()
            .input('id', id)
            .input('status', status)
            .query('UPDATE Cinema SET status = @status WHERE id = @id');
        return result.rowsAffected[0] > 0; // Trả về true nếu có bản ghi được cập nhật
    } catch (error) {
        throw new Error('Error updating cinema status: ' + error.message);
    }
}
module.exports.createCinema = async (cinemaData) => {
    try {
        const pool = await database.connect();
        const result = await pool.request()
            .input('name', cinemaData.name)
            .input('address', cinemaData.address)
            .input('note', cinemaData.note)
            .input('status', cinemaData.status)
            .query('INSERT INTO Cinema (name, address,note, status) VALUES (@name, @address, @status , @note)');
        return result.rowsAffected[0] > 0; // Trả về true nếu có bản ghi được thêm mới
    } catch (error) {
        throw new Error('Error creating cinema: ' + error.message);
    }
}
module.exports.updateCinema = async (id, cinemaData) => {
    try {
        const pool = await database.connect();
        const result = await pool.request()
            .input('id', id)
            .input('name', cinemaData.name)
            .input('address', cinemaData.address)
            .input('note', cinemaData.note)
            .input('status', cinemaData.status)
            .query('UPDATE Cinema SET name = @name, address = @address, note = @note, status = @status WHERE id = @id');
        return result.rowsAffected[0] > 0; // Trả về true nếu có bản ghi được cập nhật
    } catch (error) {
        throw new Error('Error updating cinema: ' + error.message);
    }
}
module.exports.deleteCinema = async (id) => {
    try {
        const pool = await database.connect();
        const result = await pool.request()
            .input('id', id)
            .query('DELETE FROM Cinema WHERE id = @id');
        return result.rowsAffected[0] > 0; // Trả về true nếu có bản ghi được xóa
    } catch (error) {
        throw new Error('Error deleting cinema: ' + error.message);
    }
}