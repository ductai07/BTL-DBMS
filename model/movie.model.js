const database = require('../config/database');

module.exports.getMovies = async (options = {}) => {
    try {
        const { sortKey, sortValue, searchKey, searchValue, skip = 0, limit = 10 } = options;
        const pool = await database.connect();
        const request = pool.request();
        // Xây dựng câu truy vấn động
        let query = 'SELECT * FROM Movie';
        let whereConditions = [];
        // Thêm điều kiện tìm kiếm nếu có searchKey và searchValue
        if (searchKey && searchValue !== undefined) {
            const validColumns = ['genre', 'status', 'ageRating', 'director', 'mainActor'];
            
            if (validColumns.includes(searchKey)) {
                whereConditions.push(`${searchKey} LIKE @searchValue`);
                request.input('searchValue', `%${searchValue}%`);
            }
        }
        // Gộp tất cả điều kiện với WHERE
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }
        // Thêm sắp xếp nếu có sortKey và sortValue
        if (sortKey && sortValue) {
            // Danh sách các cột hợp lệ để tránh SQL injection
            const validColumns = ['id', 'duration', 'releaseDate'];
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
        // Thêm phân trang
        query += ' OFFSET @skip ROWS FETCH NEXT @limit ROWS ONLY';
        request.input('skip', skip);
        request.input('limit', limit);
        const result = await request.query(query);
        return result.recordset;
    } catch (error) {
        throw new Error('Error fetching movies: ' + error.message);
    }
}
module.exports.countMovies = async (searchKey, searchValue) => {
    try {
        const pool = await database.connect();
        const request = pool.request();
        let query = 'SELECT COUNT(*) AS total FROM Movie';
        let whereConditions = [];
        // Thêm điều kiện tìm kiếm nếu có searchKey và searchValue
        if (searchKey && searchValue !== undefined) {
            const validColumns = ['genre', 'status', 'ageRating', 'director', 'mainActor'];
            if (validColumns.includes(searchKey)) {
                whereConditions.push(`${searchKey} LIKE @searchValue`);
                request.input('searchValue', `%${searchValue}%`);
            }
        }
        // Gộp tất cả điều kiện với WHERE
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }
        const result = await request.query(query);
        return result.recordset[0].total;
    } catch (error) {
        throw new Error('Error counting movies: ' + error.message);
    }
}
module.exports.getMovieById = async (id) => {
    try {
        const pool = await database.connect();
        const result = await pool.request()
            .input('id', id)
            .query('SELECT * FROM Movie WHERE id = @id');
        return result.recordset;
    } catch (error) {
        throw new Error('Error fetching movie details: ' + error.message);
    }
}
module.exports.updateMovieStatus = async (id, status) => {
    try {
        const pool = await database.connect();
        const result = await pool.request()
            .input('id', id)
            .input('status', status)
            .query('UPDATE Movie SET status = @status WHERE id = @id');
        
        return result.rowsAffected[0] > 0; // Trả về true nếu có bản ghi được cập nhật
    } catch (error) {
        throw new Error('Error updating movie status: ' + error.message);
    }
}
module.exports.createMovie = async (movieData) => {
    try {
        const pool = await database.connect();
        // Sử dụng SCOPE_IDENTITY() để lấy ID vừa được tạo
        const result = await pool.request()
            .input('title', movieData.title)
            .input('genre', movieData.genre)
            .input('duration', movieData.duration)
            .input('releaseDate', movieData.releaseDate)
            .input('poster', movieData.poster)
            .input('trailer', movieData.trailer)
            .input('description', movieData.description)
            .input('ageRating', movieData.ageRating)
            .input('status', movieData.status)
            .input('director', movieData.director)
            .input('mainActor', movieData.mainActor)
            .input('origin', movieData.origin)
            .input('language', movieData.language)
            .query(`
                INSERT INTO Movie (title, genre, duration, releaseDate, poster, trailer, description, 
                                  ageRating, status, director, mainActor, origin, language)
                VALUES (@title, @genre, @duration, @releaseDate, @poster, @trailer, @description,
                        @ageRating, @status, @director, @mainActor, @origin, @language);
                SELECT SCOPE_IDENTITY() AS id;
            `);
        // Lấy ID vừa được tạo
        const newId = result.recordset[0].id;
        // Truy vấn để lấy toàn bộ thông tin của bản ghi mới
        const newMovie = await pool.request()
            .input('id', newId)
            .query('SELECT * FROM Movie WHERE id = @id');
        // Trả về đối tượng movie đầy đủ
        return newMovie.recordset[0];
    } catch (error) {
        throw new Error('Error creating movie: ' + error.message);
    }
}
module.exports.updateMovie = async (id, movieData) => {
    try {
        const pool = await database.connect();
        
        // Cập nhật thông tin phim
        const updateResult = await pool.request()
            .input('id', id)
            .input('title', movieData.title)
            .input('genre', movieData.genre)
            .input('duration', movieData.duration)
            .input('releaseDate', movieData.releaseDate)
            .input('poster', movieData.poster)
            .input('trailer', movieData.trailer)
            .input('description', movieData.description)
            .input('ageRating', movieData.ageRating)
            .input('status', movieData.status)
            .input('director', movieData.director)
            .input('mainActor', movieData.mainActor)
            .input('origin', movieData.origin)
            .input('language', movieData.language)
            .query(`
                UPDATE Movie 
                SET title = @title,
                    genre = @genre,
                    duration = @duration,
                    releaseDate = @releaseDate,
                    poster = @poster,
                    trailer = @trailer,
                    description = @description,
                    ageRating = @ageRating,
                    status = @status,
                    director = @director,
                    mainActor = @mainActor,
                    origin = @origin,
                    language = @language
                WHERE id = @id
            `);
        
        // Kiểm tra xem có bản ghi nào được cập nhật không
        if (updateResult.rowsAffected[0] === 0) {
            return false;
        }
        
        // Lấy thông tin phim sau khi cập nhật
        const result = await pool.request()
            .input('id', id)
            .query('SELECT * FROM Movie WHERE id = @id');
        
        return result.recordset[0];
    } catch (error) {
        throw new Error('Error updating movie: ' + error.message);
    }
}
// Thêm vào cuối file hiện tại
module.exports.deleteMovie = async (id) => {
    try {
        // Lưu trữ thông tin phim trước khi xóa (để trả về)
        const pool = await database.connect();
        // Lấy thông tin phim trước khi xóa
        const movieInfo = await pool.request()
            .input('id', id)
            .query('SELECT * FROM Movie WHERE id = @id');
        if (movieInfo.recordset.length === 0) {
            return null; // Không tìm thấy phim
        }
        // Thực hiện xóa phim
        const deleteResult = await pool.request()
            .input('id', id)
            .query('DELETE FROM Movie WHERE id = @id');
        // Kiểm tra kết quả xóa
        if (deleteResult.rowsAffected[0] === 0) {
            return false; // Không có phim nào bị xóa
        }
        // Trả về thông tin phim đã xóa
        return movieInfo.recordset[0];
    } catch (error) {
        throw new Error('Error deleting movie: ' + error.message);
    }
}