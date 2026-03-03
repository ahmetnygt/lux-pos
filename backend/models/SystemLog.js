const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SystemLog = sequelize.define('SystemLog', {
    table_name: { type: DataTypes.STRING },
    message: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING }
}, {
    tableName: 'system_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = SystemLog;