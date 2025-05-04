const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Room = sequelize.define('Room', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  seatCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: true,
    validate: {
      isIn: [['Hoạt động', 'Đang bảo trì', 'Đóng cửa']]
    }
  },
  cinema_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'Room',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['cinema_id', 'name']
    }
  ]
});

module.exports = Room;