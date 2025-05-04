const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const ProductUsage = sequelize.define('ProductUsage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1
    }
  },
  purchasePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  invoice_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'ProductUsage',
  timestamps: false
});

module.exports = ProductUsage;