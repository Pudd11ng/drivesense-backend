const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/auth');

// Registration route
router.post('/register', validateRegistration, authController.register);

// Login route
router.post('/login', validateLogin, authController.login);

// Logout route
router.post('/logout', authController.logout);

module.exports = router;