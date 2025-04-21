const sql = require('mssql/msnodesqlv8');
const config = {
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=LMQ\\SQLEXPRESS;Database=QLRapChieuPhim;Trusted_Connection=Yes;',
    driver: 'msnodesqlv8'
};
module.exports.connect = async () => {
    try {
        let pool = await sql.connect(config);
        console.log('Connected to database successfully');
        return pool;
    } catch (error) {
        console.error('Database connection failed:', error);
        throw error;
    }
}