const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { isAuthenticated, isUser } = require('../middleware/auth.middleware.js'); // Assuming you have authentication middleware

// Only regular users can access this route (example)
router.get('/index', isAuthenticated, isUser, (req, res) => {
  res.send('Welcome to the user dashboard');
});

// Registration route
router.post('/register', userController.createUser);

// Login route
router.post('/login', userController.loginUser);

// Like Post Route
router.post('/like', userController.likePost);

// Dislike Post Route
router.post('/dislike', userController.dislikePost);

// Forgot Password Route 
router.post('/forgot-password', userController.forgotPassword); 

// Export the router
module.exports = router;