const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Role tablosu veri modeli tanımlaması
const Role = sequelize.define('Role', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false
    }
}, {
    tableName: 'roles',
    timestamps: false // createdAt ve updatedAt alanlarının devre dışı bırakılması
});

module.exports = Role;