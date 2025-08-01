const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller'); 

// Search endpoint
router.get('/', searchController.search); 

module.exports = router;