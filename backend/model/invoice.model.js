const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  createDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  totalDiscount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  paymentMethod: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  qrCode: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: true,
    validate: {
      isIn: [['Đã thanh toán', 'Chưa thanh toán', 'Đã hủy']]
    }
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  discount_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'Invoice',
  timestamps: false
});

module.exports = Invoice;