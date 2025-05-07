const { Sequelize } = require('sequelize');
// <<<<<<< DieuPham
// const sequelize = new Sequelize('LMQ2', 'sa', '2411', {
//   dialect: 'mssql',
//   host: 'CHINHPHAM',
//   dialectOptions: {
//     options: {
//       instanceName: 'SQLEXPRESS',
//       encrypt: true,
//       trustServerCertificate: true, // Phù hợp cho môi trường phát triển
// =======

const sequelize = new Sequelize({
  dialect: 'mssql',
  host: 'CHINHPHAM', // or '.' for local SQL Server
  database: 'LMQ2', // your database name
  username: 'sa', // SQL Server sa account
  password: '2411', // your password
  dialectOptions: {
    options: {
      instanceName: 'SQLEXPRESS',
      encrypt: false,
      trustServerCertificate: true,
      requestTimeout: 30000
    }
  },
  define: {
    // Use this to specify schema for all models
    schema: 'dbo',
    // Ensure model names match table names exactly
    freezeTableName: true
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