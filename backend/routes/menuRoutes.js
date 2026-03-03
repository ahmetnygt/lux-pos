const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// API Uçları
router.get('/', menuController.getFullMenu);
router.post('/category', menuController.createCategory);
router.post('/product', menuController.createProduct);

module.exports = router;