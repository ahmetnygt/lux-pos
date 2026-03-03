const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Order = require('./Order');
const Product = require('./Product');

// Sistem Bilgisi: Sipariş Detayı (Adisyon Kalemleri) veri modeli tanımlaması
const OrderItem = sequelize.define('OrderItem', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    order_id: {
        type: DataTypes.INTEGER,
        references: { model: Order, key: 'id' }
    },
    product_id: {
        type: DataTypes.INTEGER,
        references: { model: Product, key: 'id' }
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false // O anki güncel fiyat buraya mühürlenir
    },
    status: {
        type: DataTypes.ENUM('Siparişte', 'Ödendi', 'İptal'), // Hazırlanıyor'u siktir ettik
        defaultValue: 'Siparişte'
    }
}, {
    tableName: 'order_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// İlişki Tanımlamaları
Order.hasMany(OrderItem, { foreignKey: 'order_id' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

Product.hasMany(OrderItem, { foreignKey: 'product_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id' });

module.exports = OrderItem;