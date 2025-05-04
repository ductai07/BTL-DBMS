const sequelize = require('../config/database');
const DataTypes = require('sequelize');
const Cinema = sequelize.define('Cinema', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        isIn: [['Hoạt động', 'Đang bảo trì', 'Đóng cửa']]
      }
    }
  }, {
    tableName: 'Cinema',
    timestamps: false
  });
module.exports = Cinema;

