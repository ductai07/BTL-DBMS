const movieModel = require('../model/movie.model');
const paginationHelper = require('../helper/pagination');

module.exports.index = async (req, res) => {
    try {
        // Lấy tất cả tham số query
        const { sortKey, sortValue, page = 1, limit = 10, searchKey, searchValue } = req.query;
        // Xác thực tham số tìm kiếm
        if (searchKey && !['genre', 'status', 'ageRating', 'director', 'mainActor'].includes(searchKey)) {
            return res.status(400).json({ 
                error: 'Invalid search key. Valid options are: genre, status, ageRating, director, mainActor' 
            });
        }
        // Xác thực tham số sắp xếp
        if (sortKey && !['id', 'duration', 'releaseDate'].includes(sortKey)) {
            return res.status(400).json({ 
                error: 'Invalid sort key. Valid options are: id, duration, releaseDate' 
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
        const count = await movieModel.countMovies(searchKey, searchValue);
        // Sử dụng helper pagination để tính toán
        const paginationInfo = paginationHelper(pageNumber, count, limitNumber);
        // Gọi hàm lấy dữ liệu với pagination
        const data = await movieModel.getMovies({
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
        const movie = await movieModel.getMovieById(id);
        
        if (!movie || movie.length === 0) {
            return res.status(404).json({ error: 'Movie not found' });
        }
        
        res.status(200).json(movie[0]);
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
            return res.status(400).json({ error: 'Status must be either active or inactive' });
        }
        // Gọi model để cập nhật status
        const result = await movieModel.updateMovieStatus(id, status);
        if (!result) {
            return res.status(404).json({ error: 'Movie not found' });
        }
        res.status(200).json({ message: 'Movie status updated successfully' });
    } catch (error) {
        console.error('Error in changeStatus:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
module.exports.create = async (req, res) => {
    try {
        const { 
            title, genre, duration, releaseDate, poster, trailer, description,
            ageRating, status, director, mainActor, origin, language 
        } = req.body;
        
        // Kiểm tra các trường bắt buộc
        if (!title || !genre || !duration || !releaseDate || !poster || 
            !status || !director || !mainActor || !origin || !language) {
            return res.status(400).json({ 
                error: 'Missing required fields: title, genre, duration, releaseDate, poster, status, director, mainActor, origin, language' 
            });
        }
        // Tạo đối tượng phim mới với xử lý trường không bắt buộc
        const movieData = {
            title,
            genre,
            duration,
            releaseDate,
            poster,
            trailer: trailer || 'Đang cập nhật',           // Optional
            description: description || "Đang cập nhật",    // Optional
            ageRating: ageRating || '16+',      // Default '16+'
            status,
            director,
            mainActor,
            origin,
            language
        };
        // Gọi model để tạo phim mới
        const newMovie = await movieModel.createMovie(movieData);
        if (!newMovie) {
            return res.status(400).json({ error: 'Failed to create movie' });
        }
        res.status(201).json({ 
            message: 'Movie created successfully', 
            movie: newMovie 
        });
    } catch (error) {
        console.error('Error in create:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;
        const { 
            title, genre, duration, releaseDate, poster, trailer, description,
            ageRating, status, director, mainActor, origin, language 
        } = req.body;
        
        // Kiểm tra phim có tồn tại không
        const existingMovie = await movieModel.getMovieById(id);
        if (!existingMovie || existingMovie.length === 0) {
            return res.status(404).json({ error: 'Movie not found' });
        }
        
        // Kiểm tra các trường bắt buộc
        if (!title || !genre || !duration || !releaseDate || !poster || 
            !status || !director || !mainActor || !origin || !language) {
            return res.status(400).json({ 
                error: 'Missing required fields: title, genre, duration, releaseDate, poster, status, director, mainActor, origin, language' 
            });
        }
        
        // Tạo đối tượng phim với dữ liệu cập nhật
        const movieData = {
            title,
            genre,
            duration,
            releaseDate,
            poster,
            trailer: trailer || null,
            description: description || null,
            ageRating: ageRating || '16+',
            status,
            director,
            mainActor,
            origin,
            language
        };
        // Gọi model để cập nhật phim
        const updatedMovie = await movieModel.updateMovie(id, movieData);
        if (!updatedMovie) {
            return res.status(400).json({ error: 'Failed to update movie' });
        }
        res.status(200).json({ 
            message: 'Movie updated successfully', 
            movie: updatedMovie 
        });
    } catch (error) {
        console.error('Error in edit:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
module.exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        // Gọi model để xóa phim
        const deletedMovie = await movieModel.deleteMovie(id);
        // Xử lý các trường hợp lỗi
        if (deletedMovie === null) {
            return res.status(404).json({ error: 'Movie not found' });
        }
        if (deletedMovie === false) {
            return res.status(400).json({ error: 'Failed to delete movie' });
        }
        // Trả về kết quả thành công
        res.status(200).json({ 
            message: 'Movie deleted successfully', 
            movie: deletedMovie 
        });
    } catch (error) {
        console.error('Error in delete:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
