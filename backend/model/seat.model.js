const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Seat = sequelize.define('Seat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  position: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: true,
    validate: {
      isIn: [['Trống', 'Đã đặt', 'Bảo trì']]
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  room_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'Seat',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['room_id', 'position']
    }
  ]
});

module.exports = Seat;