const Category = require('../models/Category');
const Product = require('../models/Product');

exports.getFullMenu = async (req, res) => {
    try {
        const categories = await Category.findAll({ include: [{ model: Product, required: false }] });
        res.status(200).json(categories);
    } catch (error) { res.status(500).json({ message: 'Menü yüklenemedi.' }); }
};

exports.getAllCategories = async (req, res) => {
    try { res.status(200).json(await Category.findAll()); } catch (error) { res.status(500).json({ message: 'Hata' }); }
};

exports.getAllProducts = async (req, res) => {
    try { res.status(200).json(await Product.findAll({ include: [{ model: Category, attributes: ['name'] }] })); }
    catch (error) { res.status(500).json({ message: 'Hata' }); }
};

exports.createCategory = async (req, res) => {
    try { res.status(201).json(await Category.create(req.body)); } catch (error) { res.status(500).json({ message: 'Hata' }); }
};
// YENİ: Kategori Düzenle ve Sil
exports.updateCategory = async (req, res) => {
    try { await Category.update(req.body, { where: { id: req.params.id } }); res.status(200).json({ message: 'OK' }); } catch (error) { res.status(500).json({ message: 'Hata' }); }
};
exports.deleteCategory = async (req, res) => {
    try { await Category.destroy({ where: { id: req.params.id } }); res.status(200).json({ message: 'OK' }); } catch (error) { res.status(500).json({ message: 'İçinde ürün var silinemez!' }); }
};

exports.createProduct = async (req, res) => {
    try { res.status(201).json(await Product.create(req.body)); } catch (error) { res.status(500).json({ message: 'Hata' }); }
};
// YENİ: Ürün Düzenle ve Sil
exports.updateProduct = async (req, res) => {
    try { await Product.update(req.body, { where: { id: req.params.id } }); res.status(200).json({ message: 'OK' }); } catch (error) { res.status(500).json({ message: 'Hata' }); }
};
exports.deleteProduct = async (req, res) => {
    try { await Product.destroy({ where: { id: req.params.id } }); res.status(200).json({ message: 'OK' }); } catch (error) { res.status(500).json({ message: 'Hata' }); }
};