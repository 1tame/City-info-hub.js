const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { isAuthenticated, isUser } = require('../middleware/auth.middleware.js');


// Only regular users can access this route
router.get('/index', isAuthenticated, isUser, (req, res) => {
    res.send('Welcome to the user dashboard');
  });

// Registration route
router.post('/register', userController.createUser);

// Login route
router.post('/login', userController.loginUser);

router.post('/like', userController.likePost);

router.post('/dislike', userController.dislikePost);



// Export the router
module.exports = router;
