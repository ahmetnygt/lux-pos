const express = require('express');
const router = express.Router();
const printController = require('../controllers/printerController');

// API Uçları
router.get('/', printController.printReceipt);

module.exports = router;