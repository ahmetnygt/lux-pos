const Ingredient = require('../models/Ingredient');

exports.getAllIngredients = async (req, res) => {
    try {
        const ingredients = await Ingredient.findAll({ order: [['name', 'ASC']] });
        res.status(200).json(ingredients);
    } catch (error) { res.status(500).json({ message: 'Hammaddeler çekilemedi.' }); }
};

exports.createIngredient = async (req, res) => {
    try {
        const { name, unit, stock_amount, critical_level } = req.body;

        // SİSTEM BİLGİSİ: Zeki Motor -> Aynı isimde mal varsa yeni satır açma, stoka ekle!
        let existing = await Ingredient.findOne({ where: { name } });
        if (existing) {
            existing.stock_amount = parseFloat(existing.stock_amount) + parseFloat(stock_amount);
            existing.critical_level = critical_level || existing.critical_level;
            await existing.save();
            return res.status(200).json(existing);
        }

        const newIngredient = await Ingredient.create({ name, unit, stock_amount, critical_level });
        res.status(201).json(newIngredient);
    } catch (error) { res.status(500).json({ message: 'Yeni hammadde eklenemedi.' }); }
};

// YENİ: Düzenleme
exports.updateIngredient = async (req, res) => {
    try {
        const { name, unit, stock_amount, critical_level } = req.body;
        await Ingredient.update({ name, unit, stock_amount, critical_level }, { where: { id: req.params.id } });
        res.status(200).json({ message: 'Güncellendi' });
    } catch (error) { res.status(500).json({ message: 'Güncellenemedi' }); }
};

// YENİ: Silme
exports.deleteIngredient = async (req, res) => {
    try {
        await Ingredient.destroy({ where: { id: req.params.id } });
        res.status(200).json({ message: 'Silindi' });
    } catch (error) { res.status(500).json({ message: 'Silinemedi, reçetelerde kullanılıyor olabilir.' }); }
};