const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Registration route
router.post('/register', userController.createUser);

// Login route
router.post('/login', userController.loginUser);

// Export the router
module.exports = router;
