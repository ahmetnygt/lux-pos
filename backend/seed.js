const bcrypt = require('bcryptjs');
const sequelize = require('./config/db');
const Role = require('./models/Role');
const User = require('./models/User');

const seedDatabase = async () => {
    try {
        console.log('Sistem Bilgisi: Veritabanı tohumlama (seeding) işlemi başlatılıyor...');

        // Veritabanı bağlantısının senkronize edilmesi
        await sequelize.sync({ alter: true });

        // 1. Temel Rollerin Oluşturulması
        const rolesData = [
            { name: 'Admin' },
            { name: 'Kasa' },
            { name: 'Barmen' },
            { name: 'Garson' }
        ];

        // Mevcut rolleri kontrol et, yoksa ekle (BulkCreate ile)
        const rolesCount = await Role.count();
        if (rolesCount === 0) {
            await Role.bulkCreate(rolesData);
            console.log('Sistem Bilgisi: Temel roller başarıyla oluşturuldu.');
        } else {
            console.log('Sistem Uyarısı: Roller zaten mevcut, atlanıyor.');
        }

        // 2. Varsayılan Yönetici (Admin) Hesabının Oluşturulması
        const adminRole = await Role.findOne({ where: { name: 'Admin' } });

        if (adminRole) {
            const adminExists = await User.findOne({ where: { username: 'altan' } });

            if (!adminExists) {
                // Şifrenin güvenli bir şekilde kriptolanması (Salt round: 10)
                const hashedPassword = await bcrypt.hash('LuxAdmin2026!', 10);

                await User.create({
                    username: 'altan',
                    password_hash: hashedPassword,
                    pin_code: '1923', // Acil durumlar veya hızlı testler için
                    role_id: adminRole.id,
                    is_active: true
                });
                console.log('Sistem Bilgisi: Varsayılan yönetici (Admin) hesabı başarıyla oluşturuldu.');
                console.log('Sistem Bilgisi: Kullanıcı Adı: altan | Geçici Şifre: LuxAdmin2026!');
            } else {
                console.log('Sistem Uyarısı: Yönetici hesabı zaten mevcut, atlanıyor.');
            }
        }

        console.log('Sistem Bilgisi: Tohumlama işlemi sorunsuz tamamlandı.');
        process.exit(0); // İşlem bitince scripti kapat

    } catch (error) {
        console.error('Sistem Hatası: Tohumlama işlemi sırasında kritik bir hata meydana geldi.', error);
        process.exit(1);
    }
};

// Fonksiyonu tetikle
seedDatabase();