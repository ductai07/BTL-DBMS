const database = require('../config/database');
const phimModel = require('../model/phim.model');
module.exports.index = async (req, res) => {
    try {
        const info = await phimModel.getAllPhim(database.pool);
        res.status(200).json(info);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
