const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'mssql',
  host: 'localhost', // or '.' for local SQL Server
  database: 'QL', // your database name
  username: 'sa', // SQL Server sa account
  password: '111111', // your password
  dialectOptions: {
    options: {
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