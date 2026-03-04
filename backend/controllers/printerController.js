// SİSTEM BİLGİSİ: Bulut sunucu yazıcıya dokunmaz, sadece dükkandaki ajana sinyal fırlatır!
exports.printReceipt = async (req, res) => {
    try {
        const receiptData = req.body;

        // Socket.io ile 'printReceipt' kanalından fiş verisini tüm dünyaya (dükkana) yayınla
        req.app.get('io').emit('printReceipt', receiptData);

        console.log(`Sistem Bilgisi: ${receiptData.table_name} masasının fiş sinyali dükkana fırlatıldı.`);
        res.status(200).json({ message: 'Yazdırma sinyali dükkana iletildi.' });
    } catch (error) {
        console.error('Yazdırma Sinyali Hatası:', error);
        res.status(500).json({ message: 'Sinyal gönderilemedi.' });
    }
};