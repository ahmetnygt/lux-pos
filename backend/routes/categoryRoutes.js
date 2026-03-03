const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

router.get('/', menuController.getAllCategories);
router.post('/', menuController.createCategory);

router.put('/:id', menuController.updateCategory);
router.delete('/:id', menuController.deleteCategory);

module.exports = router;