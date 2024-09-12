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

/*
// Route to check if session is still valid
router.get('/checkSession', (req, res) => {
    if (req.session.user) {
        // If user session exists, session is still valid
        res.json({ message: 'Session active' });
    } else {
        // Session has expired or user is not logged in
        res.status(401).json({ message: 'Session expired' });
    }
});
*/
router.get('/checkSession', authController.authenticateToken, (req, res) => {
  // Token is valid if this route is reached 
  res.json({ message: 'Session active', user: req.user }); 
});

module.exports = router;