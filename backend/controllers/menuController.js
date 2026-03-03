const Category = require('../models/Category');
const Product = require('../models/Product');

// Tüm menüyü (Kategoriler ve içindeki ürünlerle birlikte) getir
exports.getFullMenu = async (req, res) => {
    try {
        console.log('Sistem Bilgisi: Kapsamlı menü verisi talep ediliyor...');
        const categories = await Category.findAll({
            include: [{ model: Product, required: false }] // Ürünü olmayan kategoriler de gelsin
        });
        res.status(200).json(categories);
    } catch (error) {
        console.error('Sistem Hatası: Menü verileri getirilirken hata oluştu.', error);
        res.status(500).json({ message: 'Menü yüklenemedi.' });
    }
};

// Yeni Kategori Ekle (Örn: Kokteyller, Şişeler)
exports.createCategory = async (req, res) => {
    try {
        const { name, color_code } = req.body;
        const newCategory = await Category.create({ name, color_code });
        console.log(`Sistem Bilgisi: Yeni kategori eklendi. ID: ${newCategory.id}, İsim: ${newCategory.name}`);
        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Sistem Hatası: Kategori oluşturulurken hata meydana geldi.', error);
        res.status(500).json({ message: 'Kategori oluşturulamadı.' });
    }
};

// Yeni Ürün Ekle (Örn: Chivas Regal 70cl, Long Island)
exports.createProduct = async (req, res) => {
    try {
        const { category_id, name, price } = req.body;
        const newProduct = await Product.create({ category_id, name, price });
        console.log(`Sistem Bilgisi: Yeni ürün eklendi. Ürün: ${newProduct.name}, Fiyat: ₺${newProduct.price}`);
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Sistem Hatası: Ürün sisteme eklenirken hata meydana geldi.', error);
        res.status(500).json({ message: 'Ürün eklenemedi.' });
    }
};