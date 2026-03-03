const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Product = require('./Product');
const Recipe = require('./Recipe');

const Ingredient = sequelize.define('Ingredient', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    unit: {
        // cl, adet, kg, gr gibi birimler
        type: DataTypes.ENUM('cl', 'adet', 'kg', 'gr', 'lt'),
        allowNull: false
    },
    stock_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    critical_level: {
        // Stok bu seviyenin altına düşerse patrona uyarı verecek
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 10.00
    }
}, {
    tableName: 'ingredients',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

Product.belongsToMany(Ingredient, { through: Recipe, foreignKey: 'product_id' });
Ingredient.belongsToMany(Product, { through: Recipe, foreignKey: 'ingredient_id' });

module.exports = Ingredient;