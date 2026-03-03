const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Masanın aktif hesabını getirir
router.get('/table/:table_id', orderController.getActiveOrder);

// Masaya yeni içki/ürün çakar
router.post('/table/:table_id/add-item', orderController.addItemToOrder);

router.post('/table/:table_id/pay', orderController.processPayment);

// Sepetteki tüm ürünleri tek pakette alır
router.post('/table/:table_id/add-multiple', orderController.addMultipleItemsToOrder);

// Kasa ekranındaki canlı özet panelini besler
router.get('/summary/live', orderController.getLiveSummary);

module.exports = router;