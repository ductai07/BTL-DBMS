const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('LMQ', 'sa', '2411', {
  dialect: 'mssql',
  host: 'localhost',
  dialectOptions: {
    options: {
      instanceName: 'SQLEXPRESS',
      trustServerCertificate: true,
      encrypt: false,
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