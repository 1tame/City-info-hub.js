const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Route for admin login
router.post('/login', authController.loginAdmin);

// Define the logout route
router.post('/logout', authController.logout);

// Example of a protected route
router.get('/protected', authController.authenticateToken, (req, res) => {
    res.status(200).json({ message: 'This is a protected route.', user: req.user });
});

module.exports = router;