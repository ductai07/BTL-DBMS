const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'mssql',
  host: 'CHINHPHAM', // hoặc '.' nếu cùng máy
  database: 'LMQ2', // tên DB của bạn
  username: 'sa', // tài khoản sa
  password: '2411', // mật khẩu
  dialectOptions: {
    options: {
      encrypt: false, // Không mã hóa kết nối (có thể bật lên nếu cần)
      trustServerCertificate: true,
      requestTimeout: 30000
    }
  },
  logging: console.log
});
sequelize
  .authenticate()
  .then(() => {
    console.log('Kết nối thành công đến SQL Server.');
  })
  .catch((err) => {
    console.error('Chi tiết lỗi kết nối:', err);
    console.error('Message:', err.message);
    console.error('Original error:', err.original);
  });

module.exports = sequelize;