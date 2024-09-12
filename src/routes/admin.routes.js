const express = require('express');
const router = express.Router();
const path = require('path'); // Add this line to import the path module
const authController = require('../controllers/auth.controller.js');
const adminController = require('../controllers/admin.controller')

const { isAuthenticated, hasRole } = require('../middleware/auth.middleware.js');



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


// Route for sys_admin dashboard
router.get('/sys-admin-dashboard.html', isAuthenticated, hasRole(['sys_admin']), (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'sysAdminHomePage.html'));
  });
  
  // Route for Event & Festival Admin dashboard
  router.get('/event-admin-dashboard.html', isAuthenticated, hasRole(['Event&festival-info admin']), (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'Festival_and_Event_Admin_Dashboard.html'));
  });
  
  // Route for Security Admin dashboard
  router.get('/security-admin-dashboard.html', isAuthenticated, hasRole(['Security-info Admin']), (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'Security_Admin_Dashboard.html'));
  });
  
  // Route for Health Sector Admin dashboard
  router.get('/health-sector-admin-dashboard.html', isAuthenticated, hasRole(['Health sector Admin']), (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'Health_Sector_Admin_Dashboard.html'));
  });
  
  // Route for Tourism Admin dashboard
  router.get('/tourism-admin-dashboard.html', isAuthenticated, hasRole(['Tourism-info Admin']), (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'Tourism_and_Hotel_Admin_Dashboard.html'));
  });
  
  // Route for Transportation Admin dashboard
  router.get('/transportation-admin-dashboard.html', isAuthenticated, hasRole(['Transportation Admin']), (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'Transportation_Admin_Dashboard.html'));
  });
  
  // Route for Water Supply Admin dashboard
  router.get('/water-supply-admin-dashboard.html', isAuthenticated, hasRole(['Water Supply Admin']), (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'Water_Supply_Admin_Dashboard.html'));
  });
  
  router.post('/reset-password', adminController.resetPassword);


module.exports = router;