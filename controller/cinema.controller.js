const cinemaModel = require('../model/cinema.model');
const paginationHelper = require('../helper/pagination');

module.exports.index = async (req, res) => {
    try {
        // Lấy tất cả tham số query, thêm searchKey và searchValue
        const { status, sortKey, sortValue, page = 1, limit = 10, searchKey, searchValue } = req.query;
        
        // Xác thực tham số tìm kiếm
        if (searchKey && !['name', 'address', 'note', 'status'].includes(searchKey)) {
            return res.status(400).json({ 
                error: 'Invalid search key. Valid options are: name, address, note, status' 
            });
        }
        
        // Chỉ xử lý tìm kiếm khi có cả key và value
        const hasSearch = searchKey && searchValue !== undefined;
        
        // Xác thực tham số sắp xếp (giữ nguyên)
        if (sortKey && !['id', 'name', 'address', 'status'].includes(sortKey)) {
            return res.status(400).json({ 
                error: 'Invalid sort key. Valid options are: id, name, address, status' 
            });
        }
        if (sortValue && !['asc', 'desc'].includes(sortValue.toLowerCase())) {
            return res.status(400).json({ 
                error: 'Invalid sort value. Valid options are: asc, desc' 
            });
        }
        
        // Xác thực tham số phân trang (giữ nguyên)
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 10;
        if (pageNumber < 1) {
            return res.status(400).json({ error: 'Page must be a positive number' });
        }
        if (limitNumber < 1 || limitNumber > 100) {
            return res.status(400).json({ error: 'Limit must be between 1 and 100' });
        }
        
        // Lấy tổng số bản ghi để tính phân trang, bổ sung params tìm kiếm
        const count = await cinemaModel.countCinemas(status, hasSearch ? { key: searchKey, value: searchValue } : null);
        
        // Sử dụng helper pagination để tính toán
        const paginationInfo = paginationHelper(pageNumber, count, limitNumber);
        
        // Gọi hàm lấy dữ liệu với pagination, bổ sung params tìm kiếm
        const data = await cinemaModel.getCinemas({
            status,
            sortKey,
            sortValue,
            search: hasSearch ? { key: searchKey, value: searchValue } : null,
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
        const info = await cinemaModel.getCinemaById(id);
        if (info.length === 0) {
            return res.status(404).json({ error: 'Cinema not found' });
        }
        else res.status(200).json(info[0]);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
module.exports.changeStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const status = req.body.status;
        if (status === undefined || status === null) {
            return res.status(400).json({ error: 'Status is required' });
        }
        if(status !== 'active' && status !== 'inactive'){
            return res.status(400).json({ error: 'Status must be either active or inactive' });
        }
        const result = await cinemaModel.updateCinemaStatus(id, status);
        if (!result) {
            return res.status(404).json({ error: 'Cinema not found' });
        }
        res.status(200).json({ message: 'Cinema status updated successfully' });
    } catch (error) {
        console.error('Error in changeStatus:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
module.exports.create = async (req, res) => {
    try {
        const { name, address,note, status} = req.body;
        if (!name || !address) {
            return res.status(400).json({ error: 'Name and address are required' });
        }
        const newCinema = await cinemaModel.createCinema({ name, address,note,status });
        if(!newCinema) {
            return res.status(400).json({ error: 'Failed to create cinema' });
        }
        res.status(201).json({ message: 'Cinema created successfully', cinema: newCinema });
    } catch (error) {
        console.error('Error in create:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, address,note,status } = req.body;
        if (!name || !address) {
            return res.status(400).json({ error: 'Name and address are required' });
        }
        const updatedCinema = await cinemaModel.updateCinema(id, { name, address,note,status });
        if (!updatedCinema) {
            return res.status(404).json({ error: 'Cinema not found' });
        }
        res.status(200).json({ message: 'Cinema updated successfully', cinema: updatedCinema });
    } catch (error) {
        console.error('Error in edit:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
module.exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const deletedCinema = await cinemaModel.deleteCinema(id);
        if (!deletedCinema) {
            return res.status(404).json({ error: 'Cinema not found' });
        }
        res.status(200).json({ message: 'Cinema deleted successfully' });
    } catch (error) {
        console.error('Error in delete:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}