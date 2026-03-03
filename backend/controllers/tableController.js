const Table = require('../models/Table');

// Sistemdeki tüm masaları getir
exports.getAllTables = async (req, res) => {
    try {
        console.log('Sistem Bilgisi: Masa haritası verileri talep ediliyor...');
        const tables = await Table.findAll();
        res.status(200).json(tables);
    } catch (error) {
        console.error('Sistem Hatası: Masalar getirilirken hata oluştu.', error);
        res.status(500).json({ message: 'Masalar yüklenemedi.' });
    }
};

// Yeni masa ekle (Admin paneli için)
exports.createTable = async (req, res) => {
    try {
        const { name, canvas_x, canvas_y } = req.body;
        const newTable = await Table.create({ name, canvas_x, canvas_y });
        console.log(`Sistem Bilgisi: Yeni masa oluşturuldu. ID: ${newTable.id}, İsim: ${newTable.name}`);
        res.status(201).json(newTable);
    } catch (error) {
        console.error('Sistem Hatası: Masa oluşturulurken hata meydana geldi.', error);
        res.status(500).json({ message: 'Masa oluşturulamadı.' });
    }
};

// Sürükle-bırak sonrası koordinatları güncelle
exports.updatePosition = async (req, res) => {
    try {
        const { id } = req.params;
        const { canvas_x, canvas_y } = req.body;

        await Table.update({ canvas_x, canvas_y }, { where: { id } });
        console.log(`Sistem Bilgisi: Masa konumu güncellendi. Masa ID: ${id}, Yeni X: ${canvas_x}, Yeni Y: ${canvas_y}`);

        res.status(200).json({ message: 'Konum başarıyla kaydedildi.' });
    } catch (error) {
        console.error('Sistem Hatası: Masa konumu güncellenemedi.', error);
        res.status(500).json({ message: 'Konum güncellenemedi.' });
    }
};