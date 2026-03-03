const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');

// API Uçları
router.get('/', tableController.getAllTables);
router.post('/', tableController.createTable);
router.put('/:id/position', tableController.updatePosition);

module.exports = router;