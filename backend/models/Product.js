const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Category = require('./Category');

// Product veri modeli tanımlaması
const Product = sequelize.define('Product', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    category_id: {
        type: DataTypes.INTEGER,
        references: { model: Category, key: 'id' }
    },
    name: { type: DataTypes.STRING(100), allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
    tableName: 'products',
    timestamps: false
});

// İlişki Tanımlamaları: Bir kategorinin birden fazla ürünü olabilir.
Category.hasMany(Product, { foreignKey: 'category_id' });
Product.belongsTo(Category, { foreignKey: 'category_id' });

module.exports = Product;