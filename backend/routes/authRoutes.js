const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Kullanıcı adı ve şifre ile giriş ucu
router.post('/login', authController.login); // Doğru fonksiyona gittiğinden emin ol

module.exports = router;