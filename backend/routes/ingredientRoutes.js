const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/ingredientController');

router.get('/', ingredientController.getAllIngredients);
router.post('/', ingredientController.createIngredient);

module.exports = router;