const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Movie = sequelize.define('Movie', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  genre: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1
    }
  },
  releaseDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  poster: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  trailer: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ageRating: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: true,
    validate: {
      isIn: [['Đang chiếu', 'Sắp chiếu', 'Ngừng chiếu']]
    }
  },
  director: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  mainActor: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  language: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  tableName: 'Movie',
  timestamps: false
});

module.exports = Movie;