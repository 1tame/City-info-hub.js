const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller.js');
const adminController = require('../controllers/admin.controller')



console.log(adminController.createAdmin); // Should not be undefined
console.log(authController);
console.log(authController.authenticateToken); // Should not be undefined


// Route to create a new admin (No authentication required for this route, assuming it's for initial setup)
router.post('/create', adminController.createAdmin);

// Route to get all admins (Protected route)
router.get('/admins',  adminController.getAllAdmins);

// Route to get an admin by ID (Protected route)
router.get('/admin/:id', adminController.getAdminById);

// Route to update an admin (Protected route)
router.put('/admin/:id',  adminController.updateAdmin);

// Route to delete an admin (Protected route)
router.delete('/admin/:id', adminController.deleteAdmin);

module.exports = router;