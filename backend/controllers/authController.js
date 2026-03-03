const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

// SİSTEM BİLGİSİ: Tekil ve Safkan PIN Giriş Motoru
exports.login = async (req, res) => {
    try {
        const { user_pin, pass_pin } = req.body;

        // PIN'ler üzerinden veritabanında adamımızı arıyoruz
        const user = await User.findOne({
            where: { user_pin, pass_pin }
        });

        // Adam yoksa veya PIN yanlışsa siktiri çek
        if (!user) {
            console.warn(`Güvenlik Uyarısı: Başarısız giriş denemesi. Hatalı PIN kombinasyonu.`);
            return res.status(401).json({ message: 'Kimlik doğrulama başarısız. PIN kodları hatalı.' });
        }

        // JWT (JSON Web Token) oluşturuyoruz (Güvenlik için)
        // DİKKAT: .env dosyasında JWT_SECRET tanımlı değilse patlamasın diye fallback koydum
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'lux_gizli_anahtar_1915',
            { expiresIn: '12h' } // 12 saat sonra otomatik çıkış atar
        );

        console.log(`Sistem Bilgisi: Başarılı giriş. Personel: ${user.name} ${user.surname}, Rol: ${user.role}`);

        // Frontend'in (Login.jsx) sike sike doğru sayfaya yönlendirmesi için verileri dönüyoruz
        res.status(200).json({
            message: 'Sisteme giriş başarılı.',
            token,
            id: user.id,
            username: `${user.name} ${user.surname}`, // Ekranda jilet gibi dursun diye ad-soyad birleştirdik
            role: user.role // BÜTÜN YÖNLENDİRME BÜYÜSÜ BU SATIRDA
        });

    } catch (error) {
        console.error('Sistem Hatası: Oturum açma işlemi sırasında sunucu hatası.', error);
        res.status(500).json({ message: 'Sunucu tarafında dahili bir hata oluştu.' });
    }
};