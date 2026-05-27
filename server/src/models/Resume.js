const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Resume = sequelize.define(
  'Resume',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    studentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true,
      field: 'student_id',
    },
    personal: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    education: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    experience: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    skills: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    languages: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    projects: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    completionPercentage: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: 'completion_percentage',
    },
    templateId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'template_id',
    },
    pdfUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'pdf_url',
    },
  },
  {
    tableName: 'Resumes',
    timestamps: true,
    updatedAt: 'updated_at',
    createdAt: 'created_at',
  },
);

module.exports = Resume;
