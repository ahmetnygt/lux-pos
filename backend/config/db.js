const { Sequelize } = require('sequelize');
require('dotenv').config();

// Sequelize örneğinin (instance) oluşturulması ve veritabanı konfigürasyonu
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false, // Konsol çıktılarında SQL sorgularının gizlenmesi
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// Veritabanı bağlantı testi
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Sistem Bilgisi: Veritabanı bağlantısı başarıyla kuruldu.');
    } catch (error) {
        console.error('Sistem Hatası: Veritabanı bağlantısı sağlanamadı.', error.message);
    }
};

testConnection();

module.exports = sequelize;