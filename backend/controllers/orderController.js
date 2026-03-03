const { Op } = require('sequelize'); // BÜTÜN BÜYÜ İÇİN BUNU EN ÜSTE EKLE
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const Table = require('../models/Table');
const SystemLog = require('../models/SystemLog'); // SİSTEM BİLGİSİ: Kara Kutu eklendi

// Sistem Bilgisi: Masanın aktif (Açık) adisyonunu ve içindeki siparişleri getir
exports.getActiveOrder = async (req, res) => {
    try {
        const { table_id } = req.params;
        console.log(`Sistem Bilgisi: Masa ID ${table_id} için aktif adisyon sorgulanıyor...`);

        const order = await Order.findOne({
            where: { table_id, status: 'Açık' },
            include: [{
                model: OrderItem,
                include: [Product] // Ürün isimleri ve detayları da gelsin
            }]
        });

        if (!order) {
            return res.status(200).json(null); // Masada açık hesap yoksa boş dön
        }

        res.status(200).json(order);
    } catch (error) {
        console.error('Sistem Hatası: Adisyon sorgulama başarısız.', error);
        res.status(500).json({ message: 'Adisyon getirilemedi.' });
    }
};

// Sistem Bilgisi: Masaya yeni ürün ekle (Adisyon yoksa otomatik yaratır)
exports.addItemToOrder = async (req, res) => {
    try {
        const { table_id } = req.params;
        const { product_id, price, user_id } = req.body;

        console.log(`Sistem Bilgisi: Masa ID ${table_id} için sipariş talebi alındı.`);

        // 1. Önce masada 'Açık' bir adisyon var mı bak, yoksa sike sike yeni hesap aç
        let order = await Order.findOne({ where: { table_id, status: 'Açık' } });

        if (!order) {
            order = await Order.create({ table_id, user_id, status: 'Açık', total_amount: 0 });
            console.log(`Sistem Bilgisi: Yeni adisyon oluşturuldu. Adisyon ID: ${order.id}`);

            // SİSTEM BİLGİSİ: Masa artık boş değil, pavyon moduna (Dolu) geçiyor!
            await Table.update({ status: 'Dolu' }, { where: { id: table_id } });
        }

        // 2. Ürünü o adisyona ekle (Güncel fiyattan kilitliyoruz ki zam gelirse hesap şaşmasın)
        const orderItem = await OrderItem.create({
            order_id: order.id,
            product_id,
            price,
            quantity: 1,
            status: 'Siparişte'
        });

        // 3. Adisyonun toplam tutarını (total_amount) güncelle
        const newTotal = parseFloat(order.total_amount) + parseFloat(price);
        await order.update({ total_amount: newTotal });

        console.log(`Sistem Bilgisi: Sipariş adisyona işlendi. Güncel Toplam: ₺${newTotal}`);

        res.status(200).json({ message: 'Sipariş eklendi.', orderItem });
    } catch (error) {
        console.error('Sistem Hatası: Sipariş işlenirken kritik bir hata oluştu.', error);
        res.status(500).json({ message: 'Sipariş girilemedi.' });
    }
};

exports.processPayment = async (req, res) => {
    try {
        const { table_id } = req.params;
        const { pay_amount, selected_item_ids, payment_method } = req.body;

        const order = await Order.findOne({ where: { table_id, status: 'Açık' } });
        if (!order) return res.status(404).json({ message: 'Açık hesap bulunamadı.' });

        const table = await Table.findByPk(table_id);
        const tag = payment_method === 'Nakit' ? '(N)' : '(KK)'; // Nakit/Kart Mühürü

        let currentPaid = parseFloat(order.paid_amount) || 0;
        let totalAmount = parseFloat(order.total_amount);
        let amountToPay = parseFloat(pay_amount);

        // 1. Ürün seçerek ödendiyse
        if (selected_item_ids && selected_item_ids.length > 0) {
            await OrderItem.update({ status: 'Ödendi' }, { where: { id: selected_item_ids } });
            await SystemLog.create({ table_name: table.name, message: `💳 ${tag} Seçili ürünlerin ödemesi alındı.`, status: 'Ödendi' });
        }
        // 2. Ürün seçmeden sadece tutar yazılarak kısmi ödendiyse
        else if (amountToPay > 0 && (currentPaid + amountToPay) < totalAmount - 0.01) {
            await SystemLog.create({ table_name: table.name, message: `💰 ${tag} ₺${amountToPay} kısmi tahsilat yapıldı.`, status: 'Ödendi' });
        }

        const newPaidAmount = currentPaid + amountToPay;

        // 3. Hesap komple kapanıyorsa
        if (newPaidAmount >= totalAmount - 0.01) {
            await order.update({ paid_amount: totalAmount, status: 'Ödendi' });
            await Table.update({ status: 'Boş' }, { where: { id: table_id } });

            await SystemLog.create({ table_name: table.name, message: `✅ ${tag} HESAP KAPATILDI (Son Tahsilat: ₺${amountToPay})`, status: 'Kapatıldı' });

            return res.status(200).json({ message: 'Hesap tamamen kapatıldı.', isFullyPaid: true });
        } else {
            await order.update({ paid_amount: newPaidAmount });
            return res.status(200).json({ message: 'Kısmi ödeme alındı.', isFullyPaid: false, remaining: totalAmount - newPaidAmount });
        }
    } catch (error) {
        console.error('Sistem Hatası:', error);
        res.status(500).json({ message: 'Ödeme başarısız.' });
    }
};

exports.addMultipleItemsToOrder = async (req, res) => {
    try {
        const { table_id } = req.params;
        const { items, user_id } = req.body; // items = pendingItems dizisi

        console.log(`Sistem Bilgisi: Masa ID ${table_id} için toplu sipariş talebi alındı.`);

        // 1. Masada açık hesap var mı bak, yoksa sike sike 1 tane oluştur
        let order = await Order.findOne({ where: { table_id, status: 'Açık' } });

        if (!order) {
            order = await Order.create({ table_id, user_id, status: 'Açık', total_amount: 0 });
            await Table.update({ status: 'Dolu' }, { where: { id: table_id } });
            console.log(`Sistem Bilgisi: Yeni adisyon oluşturuldu. Adisyon ID: ${order.id}`);
        }

        // 2. Gelen ürünleri tek bir pakette topla
        let totalAddition = 0;
        const orderItemsData = [];

        for (const item of items) {
            for (let i = 0; i < item.quantity; i++) {
                orderItemsData.push({
                    order_id: order.id,
                    product_id: item.id,
                    price: item.price,
                    status: 'Siparişte' // Hazırlanıyor'u temizlemiştik hatırlarsan
                });
                totalAddition += parseFloat(item.price);
            }
        }

        // 3. Hepsini veritabanına tek seferde mermi gibi çak (Bulk Insert)
        await OrderItem.bulkCreate(orderItemsData);

        // 4. Adisyonun toplam tutarını tek seferde güncelle
        const newTotal = parseFloat(order.total_amount) + totalAddition;
        await order.update({ total_amount: newTotal });

        const table = await Table.findByPk(table_id);
        await SystemLog.create({
            table_name: table.name,
            message: `📝 ${items.length} çeşit ürün siparişi girildi.`,
            status: 'Siparişte'
        });

        console.log(`Sistem Bilgisi: ${orderItemsData.length} adet ürün tek seferde işlendi. Güncel Toplam: ₺${newTotal}`);
        res.status(200).json({ message: 'Siparişler başarıyla eklendi.' });

    } catch (error) {
        console.error('Sistem Hatası: Toplu sipariş işlenirken çöktü.', error);
        res.status(500).json({ message: 'Siparişler girilemedi.' });
    }
};

// Sistem Bilgisi: Sağ panel için Canlı Kasa Özeti ve İstihbarat Akışı
exports.getLiveSummary = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Bugünün başlangıcı (Gece 00:00)

        // 1. Masa Doluluk Oranları
        const tables = await Table.findAll();
        const totalTables = tables.length;
        const occupiedTables = tables.filter(t => t.status === 'Dolu' || t.status === 'Rezerve').length;

        // 2. Bugünün Finansal Özeti
        const ordersToday = await Order.findAll({
            where: { created_at: { [Op.gte]: today } }
        });

        let openAmount = 0;
        let paidAmount = 0;

        ordersToday.forEach(o => {
            if (o.status === 'Açık') {
                openAmount += (parseFloat(o.total_amount) - parseFloat(o.paid_amount || 0));
            }
            paidAmount += parseFloat(o.paid_amount || 0);
        });

        // 3. Matriks Akışı (Son 15 Sipariş Hareketi)
        // 3. Matriks Akışı (Sadece Kara Kutuyu - SystemLog okur, cillop gibi)
        const recentLogs = await SystemLog.findAll({
            limit: 15,
            order: [['created_at', 'DESC']]
        });

        const logs = recentLogs.map(log => ({
            id: `log-${log.id}`,
            time: log.created_at || log.createdAt, // Güvenlik zırhı
            table: log.table_name,
            message: log.message,
            status: log.status
        }));

        res.status(200).json({
            tables: { total: totalTables, occupied: occupiedTables },
            financials: { openAmount, paidAmount },
            logs // Yeni akıllı logları gönder
        });
    } catch (error) {
        console.error('Sistem Hatası: Canlı özet çekilemedi.', error);
        res.status(500).json({ message: 'Özet alınamadı' });
    }
};