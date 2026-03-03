const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Table veri modeli tanımlaması
const Table = sequelize.define('Table', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(50), allowNull: false },
    canvas_x: { type: DataTypes.INTEGER, defaultValue: 0 },
    canvas_y: { type: DataTypes.INTEGER, defaultValue: 0 },
    status: { type: DataTypes.ENUM('Boş', 'Dolu', 'Rezerve'), defaultValue: 'Boş' }
}, {
    tableName: 'tables',
    timestamps: false
});

module.exports = Table;