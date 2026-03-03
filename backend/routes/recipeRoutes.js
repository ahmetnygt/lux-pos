const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');

router.get('/product/:product_id', recipeController.getProductRecipe);
router.post('/', recipeController.addIngredientToRecipe);

module.exports = router;