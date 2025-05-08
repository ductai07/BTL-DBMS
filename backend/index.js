const express = require('express');
const cors = require('cors'); 
const app = express();
const port = 3000;
const sequelize = require('./config/database');
const models = require('./model/associations'); // Import all models with associations
const router = require('./router/index.router');

// <<<<<<< DieuPham
// app.use(cors());

// Middleware để xử lý CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Kiểm tra kết nối database khi khởi động
sequelize
  .authenticate()
  .then(() => {
    console.log('Kết nối thành công đến SQL Server.');
    // Log để kiểm tra các model đã được nạp
    console.log('Models loaded:', Object.keys(models));
  })
  .catch((err) => {
    console.error('Lỗi kết nối đến SQL Server:', err.message);
    console.error('Chi tiết lỗi:', err);
    process.exit(1);
  });

// Đăng ký các routes
router(app);

// Xử lý lỗi 404
app.use((req, res) => {
  res.status(404).json({ message: 'Không tìm thấy tài nguyên yêu cầu' });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});