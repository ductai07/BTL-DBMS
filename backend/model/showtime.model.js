const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const ShowTime = sequelize.define('ShowTime', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: true
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: true
  },
  showDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  room_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  movie_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'ShowTime',
  timestamps: false
});

module.exports = ShowTime;