const Recipe = require('../models/Recipe');
const Product = require('../models/Product');
const Ingredient = require('../models/Ingredient');

exports.getProductRecipe = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.product_id, {
            include: [{ model: Ingredient, through: { attributes: ['amount_used'] } }]
        });
        if (!product) return res.status(404).json({ message: 'Yok' });
        res.status(200).json(product);
    } catch (error) { res.status(500).json({ message: 'Hata' }); }
};

exports.addIngredientToRecipe = async (req, res) => {
    try { res.status(201).json(await Recipe.create(req.body)); } catch (error) { res.status(500).json({ message: 'Hata' }); }
};

// YENİ: Reçeteden Hammadde Silme
exports.removeIngredientFromRecipe = async (req, res) => {
    try {
        const { product_id, ingredient_id } = req.params;
        await Recipe.destroy({ where: { product_id, ingredient_id } });
        res.status(200).json({ message: 'Formülden çıkarıldı.' });
    } catch (error) { res.status(500).json({ message: 'Silinemedi.' }); }
};