const Recipe = require('../models/Recipe');
const Product = require('../models/Product');
const Ingredient = require('../models/Ingredient');

// Bir ürünün içindeki hammaddeleri (reçeteyi) getir
exports.getProductRecipe = async (req, res) => {
    try {
        const { product_id } = req.params;

        // Ürünü bul ve içindeki hammaddeleri miktar (amount_used) ile beraber çek
        const product = await Product.findByPk(product_id, {
            include: [{
                model: Ingredient,
                through: { attributes: ['amount_used'] } // Sadece kullanılan miktarı al
            }]
        });

        if (!product) return res.status(404).json({ message: 'Ürün bulunamadı.' });
        res.status(200).json(product);
    } catch (error) {
        console.error('Reçete Hatası:', error);
        res.status(500).json({ message: 'Reçete çekilemedi.' });
    }
};

// Ürüne yeni hammadde bağla (Örn: Votka Enerjiye -> 5 cl Votka ekle)
exports.addIngredientToRecipe = async (req, res) => {
    try {
        const { product_id, ingredient_id, amount_used } = req.body;
        const recipe = await Recipe.create({ product_id, ingredient_id, amount_used });
        res.status(201).json({ message: 'Reçete güncellendi', recipe });
    } catch (error) {
        console.error('Reçete Kayıt Hatası:', error);
        res.status(500).json({ message: 'Reçeteye ürün eklenemedi.' });
    }
};