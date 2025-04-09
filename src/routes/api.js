const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

const userController = new UserController();

router.get('/users/:id', userController.getUserProfile);
router.get('/users', userController.getAllUsers);

module.exports = router;