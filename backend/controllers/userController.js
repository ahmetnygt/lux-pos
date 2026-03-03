const User = require('../models/User');

// Tüm personeli getir
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            order: [['role', 'ASC'], ['name', 'ASC']] // Önce Adminler, sonra Kasa, sonra Garsonlar
        });
        res.status(200).json(users);
    } catch (error) {
        console.error('Sistem Hatası:', error);
        res.status(500).json({ message: 'Personel listesi çekilemedi.' });
    }
};

// Yeni personel işe al
exports.createUser = async (req, res) => {
    try {
        const { name, surname, user_pin, pass_pin, role } = req.body;

        // Bu kullanıcı PIN'i daha önce alınmış mı kontrol et
        const existingPin = await User.findOne({ where: { user_pin } });
        if (existingPin) {
            return res.status(400).json({ message: 'Bu Kullanıcı PİN kodu başka bir personelde kullanılıyor!' });
        }

        const newUser = await User.create({ name, surname, user_pin, pass_pin, role });
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Kayıt Hatası:', error);
        res.status(500).json({ message: 'Personel eklenemedi.' });
    }
};

// Personel bilgilerini (veya PIN'lerini) güncelle
exports.updateUser = async (req, res) => {
    try {
        const { name, surname, user_pin, pass_pin, role } = req.body;

        // PIN değişiyorsa başkasıyla çakışıyor mu diye bak (Kendisi hariç)
        const existingPin = await User.findOne({ where: { user_pin } });
        if (existingPin && existingPin.id !== parseInt(req.params.id)) {
            return res.status(400).json({ message: 'Bu Kullanıcı PİN kodu başka bir personelde kullanılıyor!' });
        }

        await User.update({ name, surname, user_pin, pass_pin, role }, { where: { id: req.params.id } });
        res.status(200).json({ message: 'Personel güncellendi.' });
    } catch (error) {
        res.status(500).json({ message: 'Güncelleme başarısız.' });
    }
};

// Personeli kov (Sistemden sil)
exports.deleteUser = async (req, res) => {
    try {
        await User.destroy({ where: { id: req.params.id } });
        res.status(200).json({ message: 'Personel sistemden silindi.' });
    } catch (error) {
        res.status(500).json({ message: 'Personel silinemedi (Adisyon geçmişi olabilir).' });
    }
};