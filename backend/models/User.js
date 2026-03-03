const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
    name: { type: DataTypes.STRING, allowNull: false },
    surname: { type: DataTypes.STRING, allowNull: false },
    // SİSTEM BİLGİSİ: Özel 4 haneli PIN kolonları
    user_pin: { type: DataTypes.STRING(4), allowNull: false, unique: true },
    pass_pin: { type: DataTypes.STRING(4), allowNull: false },
    role: { type: DataTypes.ENUM('Admin', 'Kasa', 'Garson'), defaultValue: 'Garson' }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = User;