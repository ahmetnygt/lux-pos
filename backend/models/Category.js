const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Category veri modeli tanımlaması
const Category = sequelize.define('Category', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    color_code: { type: DataTypes.STRING(20), defaultValue: '#FFFFFF' }
}, {
    tableName: 'categories',
    timestamps: false
});

module.exports = Category;