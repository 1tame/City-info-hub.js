const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller'); 

// ... other routes ...

// Create a new user
router.post('/register', usersController.createUser); 

// Get all users
router.get('/', usersController.getAllUsers); 

// Get a user by ID
router.get('/:id', usersController.getUserById); 

// Update a user
router.put('/:id', usersController.updateUser); 

// Update user details
router.patch('/:id', usersController.updateUserDetails);

// Delete a user
router.delete('/:id', usersController.deleteUser); 

module.exports = router;