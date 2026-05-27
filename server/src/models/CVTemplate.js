const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CVTemplate = sequelize.define('CVTemplate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  category: {
    type: DataTypes.ENUM('modern', 'classic', 'creative'),
    allowNull: false,
  },
  htmlTemplate: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  cssStyles: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  thumbnailUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'CV_Templates',
  timestamps: true,
});

module.exports = CVTemplate;
