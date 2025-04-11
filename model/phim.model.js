const database = require('../config/database');
module.exports.getAllPhim = async () => {
    try {
        const pool = await database.connect();
        const result = await pool.request().query('SELECT * FROM tblPhim');
        return result.recordset;
    } catch (error) {
        throw new Error('Error fetching data from database: ' + error.message);
    }
}