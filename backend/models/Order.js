const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Table = require('./Table');
const User = require('./User');

// Sistem Bilgisi: Adisyon (Ana Sipariş) veri modeli tanımlaması
const Order = sequelize.define('Order', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    table_id: {
        type: DataTypes.INTEGER,
        references: { model: Table, key: 'id' }
    },
    user_id: {
        type: DataTypes.INTEGER,
        references: { model: User, key: 'id' } // Adisyonu hangi personel açtı
    },
    status: {
        type: DataTypes.ENUM('Açık', 'Ödendi', 'İptal'),
        defaultValue: 'Açık'
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    // SİSTEM BİLGİSİ: Parçalı ödemeleri takip etmek için yeni kolon
    paid_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    discount_amount: {
        type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00
    }
}, {
    tableName: 'orders',
    timestamps: true, // createdAt ve updatedAt otomatik tutulsun (Adisyon açılış saati için şart)
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// İlişki Tanımlamaları
Table.hasMany(Order, { foreignKey: 'table_id' });
Order.belongsTo(Table, { foreignKey: 'table_id' });

User.hasMany(Order, { foreignKey: 'user_id' });
Order.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Order;