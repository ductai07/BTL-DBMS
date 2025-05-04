const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  bookingDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  qrCode: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  showtime_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  seat_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  invoice_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'Ticket',
  timestamps: false
});

module.exports = Ticket;