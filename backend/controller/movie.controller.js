const Model = require('../model/associations');
const { Op } = require('sequelize');

// Lấy danh sách phim với tìm kiếm, sắp xếp, phân trang
module.exports.index = async (req, res) => {
    try {
        // Lấy các tham số từ query
        const { SearchKey, SearchValue, SortKey, SortValue, Page, Limit } = req.query;

        // Khởi tạo các biến mặc định
        let where = {};
        let order = [];
        let page = Page ? parseInt(Page) : 1;
        let limit = Limit ? parseInt(Limit) : 10;
        let offset = (page - 1) * limit;

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
            order = [['releaseDate', 'DESC']]; // Sắp xếp mặc định theo ngày phát hành mới nhất
        }

        // Thực hiện truy vấn
        const { count, rows } = await Model.Movie.findAndCountAll({
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
            message: 'Error retrieving movies',
            error: error.message
        });
    }
};

// Xem chi tiết phim
module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id;
        
        const movie = await Model.Movie.findByPk(id);
        
        if (!movie) {
            return res.status(404).json({
                message: 'Movie not found'
            });
        }
        
        // Đếm số suất chiếu cho phim
        const showtimeCount = await Model.ShowTime.count({
            where: { movie_id: id }
        });
        
        // Đếm số suất chiếu sắp tới
        const upcomingShowtimeCount = await Model.ShowTime.count({
            where: {
                movie_id: id,
                showDate: { [Op.gte]: new Date() }
            }
        });
        
        // Đếm số vé đã bán
        const soldTickets = await Model.Ticket.count({
            include: [
                {
                    model: Model.ShowTime,
                    where: { movie_id: id },
                    attributes: []
                }
            ]
        });
        
        res.status(200).json({
            data: {
                ...movie.get({ plain: true }),
                statistics: {
                    totalShowtimes: showtimeCount,
                    upcomingShowtimes: upcomingShowtimeCount,
                    soldTickets: soldTickets
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving movie details',
            error: error.message
        });
    }
};

// Thêm phim mới
module.exports.add = async (req, res) => {
    try {
        const {
            title,
            genre,
            duration,
            releaseDate,
            poster,
            trailer,
            description,
            ageRating,
            status,
            director,
            mainActor,
            language
        } = req.body;

        // Kiểm tra trạng thái hợp lệ
        const validStatus = ['Đang chiếu', 'Sắp chiếu', 'Ngừng chiếu'];
        if (status && !validStatus.includes(status)) {
            return res.status(400).json({
                message: 'Invalid status. Must be one of: Đang chiếu, Sắp chiếu, Ngừng chiếu'
            });
        }

        // Kiểm tra độ dài của title
        if (!title || title.trim() === '') {
            return res.status(400).json({
                message: 'Movie title is required'
            });
        }

        // Kiểm tra thời lượng phim
        if (duration !== undefined && (isNaN(duration) || duration <= 0)) {
            return res.status(400).json({
                message: 'Movie duration must be a positive number'
            });
        }

        const movie = await Model.Movie.create({
            title,
            genre,
            duration,
            releaseDate,
            poster,
            trailer,
            description,
            ageRating,
            status: status || 'Sắp chiếu', // Mặc định là sắp chiếu
            director,
            mainActor,
            language
        });

        res.status(201).json({
            message: 'Movie created successfully',
            data: movie
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating movie',
            error: error.message
        });
    }
};

// Sửa thông tin phim
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;
        const {
            title,
            genre,
            duration,
            releaseDate,
            poster,
            trailer,
            description,
            ageRating,
            status,
            director,
            mainActor,
            language
        } = req.body;

        const movie = await Model.Movie.findByPk(id);
        
        if (!movie) {
            return res.status(404).json({
                message: 'Movie not found'
            });
        }

        // Kiểm tra trạng thái hợp lệ
        const validStatus = ['Đang chiếu', 'Sắp chiếu', 'Ngừng chiếu'];
        if (status && !validStatus.includes(status)) {
            return res.status(400).json({
                message: 'Invalid status. Must be one of: Đang chiếu, Sắp chiếu, Ngừng chiếu'
            });
        }

        // Kiểm tra độ dài của title
        if (title !== undefined && title.trim() === '') {
            return res.status(400).json({
                message: 'Movie title cannot be empty'
            });
        }

        // Kiểm tra thời lượng phim
        if (duration !== undefined && (isNaN(duration) || duration <= 0)) {
            return res.status(400).json({
                message: 'Movie duration must be a positive number'
            });
        }

        // Cập nhật thông tin
        await movie.update({
            title: title !== undefined ? title : movie.title,
            genre: genre !== undefined ? genre : movie.genre,
            duration: duration !== undefined ? duration : movie.duration,
            releaseDate: releaseDate !== undefined ? releaseDate : movie.releaseDate,
            poster: poster !== undefined ? poster : movie.poster,
            trailer: trailer !== undefined ? trailer : movie.trailer,
            description: description !== undefined ? description : movie.description,
            ageRating: ageRating !== undefined ? ageRating : movie.ageRating,
            status: status !== undefined ? status : movie.status,
            director: director !== undefined ? director : movie.director,
            mainActor: mainActor !== undefined ? mainActor : movie.mainActor,
            language: language !== undefined ? language : movie.language
        });

        res.status(200).json({
            message: 'Movie updated successfully',
            data: movie
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating movie',
            error: error.message
        });
    }
};

// Xóa phim
module.exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const movie = await Model.Movie.findByPk(id);
        
        if (!movie) {
            return res.status(404).json({
                message: 'Movie not found'
            });
        }

        // Kiểm tra xem phim có lịch chiếu không
        const showtimeCount = await Model.ShowTime.count({
            where: { movie_id: id }
        });

        if (showtimeCount > 0) {
            return res.status(400).json({
                message: 'Cannot delete movie with existing showtimes',
                showtimeCount
            });
        }

        await movie.destroy();

        res.status(200).json({
            message: 'Movie deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting movie',
            error: error.message
        });
    }
};

// Lấy lịch chiếu của phim
module.exports.getShowtimes = async (req, res) => {
    try {
        const movieId = req.params.id;
        const { cinemaId, startDate, endDate, Page, Limit } = req.query;
        
        // Kiểm tra phim có tồn tại không
        const movie = await Model.Movie.findByPk(movieId);
        
        if (!movie) {
            return res.status(404).json({
                message: 'Movie not found'
            });
        }
        
        // Khởi tạo các biến mặc định
        let where = { movie_id: movieId };
        let page = Page ? parseInt(Page) : 1;
        let limit = Limit ? parseInt(Limit) : 10;
        let offset = (page - 1) * limit;
        
        // Lọc theo khoảng thời gian
        if (startDate && endDate) {
            where.showDate = {
                [Op.between]: [startDate, endDate]
            };
        } else if (startDate) {
            where.showDate = {
                [Op.gte]: startDate
            };
        } else if (endDate) {
            where.showDate = {
                [Op.lte]: endDate
            };
        } else {
            // Mặc định lấy từ hôm nay trở đi
            where.showDate = {
                [Op.gte]: new Date()
            };
        }
        
        // Khởi tạo các join conditions
        const roomInclude = {
            model: Model.Room,
            attributes: ['id', 'name', 'type', 'cinema_id']
        };
        
        // Nếu có lọc theo rạp
        if (cinemaId) {
            roomInclude.where = { cinema_id: cinemaId };
        }
        
        // Thực hiện truy vấn
        const { count, rows } = await Model.ShowTime.findAndCountAll({
            where,
            order: [
                ['showDate', 'ASC'],
                ['startTime', 'ASC']
            ],
            limit,
            offset,
            include: [
                roomInclude,
                {
                    model: Model.Room,
                    include: [
                        {
                            model: Model.Cinema,
                            attributes: ['id', 'name', 'address']
                        }
                    ]
                }
            ],
            distinct: true // Để count chính xác khi có include
        });
        
        // Tính toán thông tin phân trang
        const totalPages = Math.ceil(count / limit);
        const hasNext = page < totalPages;
        const hasPrevious = page > 1;
        
        // Lấy thông tin về số vé đã bán cho từng lịch chiếu
        const showtimeIds = rows.map(st => st.id);
        const ticketCounts = await Model.Ticket.findAll({
            attributes: [
                'showtime_id',
                [sequelize.fn('COUNT', sequelize.col('id')), 'ticketCount']
            ],
            where: {
                showtime_id: { [Op.in]: showtimeIds }
            },
            group: ['showtime_id'],
            raw: true
        });
        
        // Tạo map số vé theo showtime_id
        const ticketCountMap = {};
        ticketCounts.forEach(tc => {
            ticketCountMap[tc.showtime_id] = parseInt(tc.ticketCount);
        });
        
        // Thêm thông tin số vé đã bán vào kết quả
        const showtimesWithTickets = rows.map(st => {
            const plain = st.get({ plain: true });
            return {
                ...plain,
                soldTickets: ticketCountMap[st.id] || 0
            };
        });
        
        res.status(200).json({
            data: {
                movie: {
                    id: movie.id,
                    title: movie.title,
                    duration: movie.duration,
                    poster: movie.poster
                },
                showtimes: showtimesWithTickets
            },
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
            message: 'Error retrieving movie showtimes',
            error: error.message
        });
    }
};