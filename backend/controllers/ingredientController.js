const Ingredient = require('../models/Ingredient');

// Depodaki tüm malları listele
exports.getAllIngredients = async (req, res) => {
    try {
        const ingredients = await Ingredient.findAll({
            order: [['name', 'ASC']] // Harf sırasına göre jilet gibi diz
        });
        res.status(200).json(ingredients);
    } catch (error) {
        console.error('Depo Hatası:', error);
        res.status(500).json({ message: 'Hammaddeler çekilemedi.' });
    }
};

// Depoya yeni mal ekle (Örn: Votka, cl, 500)
exports.createIngredient = async (req, res) => {
    try {
        const { name, unit, stock_amount, critical_level } = req.body;
        const newIngredient = await Ingredient.create({ name, unit, stock_amount, critical_level });
        res.status(201).json(newIngredient);
    } catch (error) {
        console.error('Kayıt Hatası:', error);
        res.status(500).json({ message: 'Yeni hammadde eklenemedi.' });
    }
};