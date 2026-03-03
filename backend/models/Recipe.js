const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Recipe = sequelize.define('Recipe', {
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ingredient_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    amount_used: {
        // Bu üründen 1 tane satılınca depodan kaç birim (cl, adet vb.) düşülecek?
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    tableName: 'recipes',
    timestamps: false // Reçetenin zaman damgasına pek ihtiyacı yok
});

module.exports = Recipe;