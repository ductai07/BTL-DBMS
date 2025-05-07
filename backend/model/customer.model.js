const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fullName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'Customer', // Ensure this matches exactly your SQL Server table name
  timestamps: false
});

module.exports = Customer;