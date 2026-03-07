const { Op } = require('sequelize');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const Table = require('../models/Table');
const SystemLog = require('../models/SystemLog');
// SİSTEM BİLGİSİ: Depo ve Formül modellerini mekana aldık
const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');

exports.getActiveOrder = async (req, res) => {
    try {
        const { table_id } = req.params;
        const order = await Order.findOne({
            where: { table_id, status: 'Açık' },
            include: [{
                model: OrderItem,
                include: [Product]
            }]
        });

        if (!order) return res.status(200).json(null);
        res.status(200).json(order);
    } catch (error) {
        console.error('Sistem Hatası: Adisyon sorgulama başarısız.', error);
        res.status(500).json({ message: 'Adisyon getirilemedi.' });
    }
};

exports.addItemToOrder = async (req, res) => {
    try {
        const { table_id } = req.params;
        const { product_id, price, user_id } = req.body;

        let order = await Order.findOne({ where: { table_id, status: 'Açık' } });

        if (!order) {
            order = await Order.create({ table_id, user_id, status: 'Açık', total_amount: 0 });
            await Table.update({ status: 'Dolu' }, { where: { id: table_id } });
        }

        const orderItem = await OrderItem.create({
            order_id: order.id,
            product_id,
            price,
            quantity: 1,
            status: 'Siparişte'
        });

        const newTotal = parseFloat(order.total_amount) + parseFloat(price);
        await order.update({ total_amount: newTotal });

        // ---------------------------------------------------------
        // BÜTÜN BÜYÜ BURADA: REÇETE MOTORU ATEŞLENİYOR (TEKLİ)
        // ---------------------------------------------------------
        const recipes = await Recipe.findAll({ where: { product_id } });
        for (const recipe of recipes) {
            const ingredient = await Ingredient.findByPk(recipe.ingredient_id);
            if (ingredient) {
                const newStock = parseFloat(ingredient.stock_amount) - parseFloat(recipe.amount_used);
                await ingredient.update({ stock_amount: newStock });

                // Kritik seviye ihlali varsa radara mermi gibi düş!
                if (newStock <= parseFloat(ingredient.critical_level)) {
                    await SystemLog.create({
                        table_name: 'SİSTEM UYARISI',
                        message: `⚠️ STOK ALARMI: ${ingredient.name} (${newStock.toFixed(2)} ${ingredient.unit} kaldı!)`,
                        status: 'Kapatıldı' // Kırmızı yazsın diye bu statüyü çaktık
                    });
                }
            }
        }
        // ---------------------------------------------------------

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
        const tag = payment_method === 'Nakit' ? '(N)' : '(KK)';

        let currentPaid = parseFloat(order.paid_amount) || 0;
        let totalAmount = parseFloat(order.total_amount);
        let discountAmount = parseFloat(order.discount_amount) || 0; // YENİ
        let amountToPay = parseFloat(pay_amount);

        if (selected_item_ids && selected_item_ids.length > 0) {
            await OrderItem.update({ status: 'Ödendi' }, { where: { id: selected_item_ids } });
            await SystemLog.create({ table_name: table.name, message: `💳 ${tag} Seçili ürünlerin ödemesi alındı.`, status: 'Ödendi' });
        }
        else if (amountToPay > 0 && (currentPaid + amountToPay) < totalAmount - 0.01) {
            await SystemLog.create({ table_name: table.name, message: `💰 ${tag} ₺${amountToPay} kısmi tahsilat yapıldı.`, status: 'Ödendi' });
        }

        const newPaidAmount = currentPaid + amountToPay;

        req.app.get('io').emit('updateTables');
        req.app.get('io').emit('updateDashboard');

        if (newPaidAmount >= (totalAmount - discountAmount) - 0.01) {
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
        const { items, user_id } = req.body;

        let order = await Order.findOne({ where: { table_id, status: 'Açık' } });

        if (!order) {
            order = await Order.create({ table_id, user_id, status: 'Açık', total_amount: 0 });
            await Table.update({ status: 'Dolu' }, { where: { id: table_id } });
        }

        let totalAddition = 0;
        const orderItemsData = [];

        for (const item of items) {
            for (let i = 0; i < item.quantity; i++) {
                orderItemsData.push({
                    order_id: order.id,
                    product_id: item.id,
                    price: item.price,
                    status: 'Siparişte'
                });
                totalAddition += parseFloat(item.price);
            }

            // ---------------------------------------------------------
            // BÜTÜN BÜYÜ BURADA: REÇETE MOTORU ATEŞLENİYOR (TOPLU)
            // ---------------------------------------------------------
            const recipes = await Recipe.findAll({ where: { product_id: item.id } });
            for (const recipe of recipes) {
                const ingredient = await Ingredient.findByPk(recipe.ingredient_id);
                if (ingredient) {
                    // Üründen kaç tane girildiyse reçeteyle çarpıp toptan düşüyor
                    const totalDeduction = parseFloat(recipe.amount_used) * item.quantity;
                    const newStock = parseFloat(ingredient.stock_amount) - totalDeduction;
                    await ingredient.update({ stock_amount: newStock });

                    // Kritik seviye ihlali varsa radara mermi gibi düş!
                    if (newStock <= parseFloat(ingredient.critical_level)) {
                        await SystemLog.create({
                            table_name: 'SİSTEM UYARISI',
                            message: `⚠️ STOK ALARMI: ${ingredient.name} (${newStock.toFixed(2)} ${ingredient.unit} kaldı!)`,
                            status: 'Kapatıldı' // Kırmızı yazsın diye
                        });
                    }
                }
            }
            // ---------------------------------------------------------
        }

        await OrderItem.bulkCreate(orderItemsData);

        const newTotal = parseFloat(order.total_amount) + totalAddition;
        await order.update({ total_amount: newTotal });

        const table = await Table.findByPk(table_id);
        await SystemLog.create({
            table_name: table.name,
            message: `📝 ${items.length} çeşit ürün siparişi girildi.`,
            status: 'Siparişte'
        });

        req.app.get('io').emit('updateTables');
        req.app.get('io').emit('updateDashboard');

        const personelAdi = req.user ? (req.user.name || req.user.username || req.user.role) : "Kasa / Sistem";

        // BAR/MUTFAK YAZICISINA SİPARİŞİ FIRLAT
        req.app.get('io').emit('printTicket', {
            table_name: table.name,
            items: items,
            waiter: personelAdi // BÜTÜN BÜYÜ BURADA: Pakete garsonu ekledik!
        });

        res.status(200).json({ message: 'Siparişler başarıyla eklendi.' });

    } catch (error) {
        console.error('Sistem Hatası: Toplu sipariş işlenirken çöktü.', error);
        res.status(500).json({ message: 'Siparişler girilemedi.' });
    }
};

exports.getLiveSummary = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tables = await Table.findAll();
        const totalTables = tables.length;
        const occupiedTables = tables.filter(t => t.status === 'Dolu' || t.status === 'Rezerve').length;

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

        const recentLogs = await SystemLog.findAll({
            limit: 15,
            order: [['created_at', 'DESC']]
        });

        const logs = recentLogs.map(log => ({
            id: `log-${log.id}`,
            time: log.created_at || log.createdAt,
            table: log.table_name,
            message: log.message,
            status: log.status
        }));

        res.status(200).json({
            tables: { total: totalTables, occupied: occupiedTables },
            financials: { openAmount, paidAmount },
            logs
        });
    } catch (error) {
        console.error('Sistem Hatası: Canlı özet çekilemedi.', error);
        res.status(500).json({ message: 'Özet alınamadı' });
    }
};

// SİSTEM BİLGİSİ: İskonto (Kıyak) Motoru
exports.applyDiscount = async (req, res) => {
    try {
        const { table_id } = req.params;
        const { discount_amount } = req.body;

        const order = await Order.findOne({ where: { table_id, status: 'Açık' } });
        if (!order) return res.status(404).json({ message: 'Açık hesap bulunamadı.' });

        const newDiscount = parseFloat(order.discount_amount || 0) + parseFloat(discount_amount);
        await order.update({ discount_amount: newDiscount });

        const table = await Table.findByPk(table_id);
        await SystemLog.create({ table_name: table.name, message: `✂️ ₺${parseFloat(discount_amount).toFixed(2)} İskonto uygulandı.`, status: 'Ödendi' });

        // Eğer adam o kadar büyük kıyak geçtiyse ki hesap sıfırlandıysa, masayı komple kapat!
        const currentPaid = parseFloat(order.paid_amount) || 0;
        const total = parseFloat(order.total_amount) || 0;
        if (currentPaid + newDiscount >= total - 0.01) {
            await order.update({ status: 'Ödendi' });
            await Table.update({ status: 'Boş' }, { where: { id: table_id } });
            await SystemLog.create({ table_name: table.name, message: `✅ HESAP KAPATILDI (Tamamen İskonto)`, status: 'Kapatıldı' });
            return res.status(200).json({ message: 'İskonto ile hesap kapandı.', isFullyPaid: true });
        }

        req.app.get('io').emit('updateDashboard');

        res.status(200).json({ message: 'İskonto eklendi', isFullyPaid: false });
    } catch (error) {
        console.error('İskonto Hatası:', error);
        res.status(500).json({ message: 'İskonto uygulanamadı.' });
    }
};

// SİSTEM BİLGİSİ: Yanlış girilen iskontoyu sıfırlama motoru
exports.removeDiscount = async (req, res) => {
    try {
        const { table_id } = req.params;
        const order = await Order.findOne({ where: { table_id, status: 'Açık' } });
        if (!order) return res.status(404).json({ message: 'Açık hesap bulunamadı.' });

        await order.update({ discount_amount: 0 });

        const table = await Table.findByPk(table_id);
        await SystemLog.create({ table_name: table.name, message: `🔄 İskonto iptal edildi (Sıfırlandı).`, status: 'Siparişte' });

        req.app.get('io').emit('updateDashboard');

        res.status(200).json({ message: 'İskonto sıfırlandı.' });
    } catch (error) {
        console.error('İskonto İptal Hatası:', error);
        res.status(500).json({ message: 'İskonto iptal edilemedi.' });
    }
};

exports.triggerPrintReceipt = async (req, res) => {
    try {
        req.app.get('io').emit('printReceipt', req.body);
        res.status(200).json({ message: 'Fiş sinyali dükkana gönderildi.' });
    } catch (error) {
        console.error('Yazdırma Sinyali Hatası:', error);
        res.status(500).json({ message: 'Sinyal gönderilemedi.' });
    }
};