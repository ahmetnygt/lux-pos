const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');

router.get('/product/:product_id', recipeController.getProductRecipe);
router.post('/', recipeController.addIngredientToRecipe);

router.delete('/:product_id/:ingredient_id', recipeController.removeIngredientFromRecipe);

module.exports = router;