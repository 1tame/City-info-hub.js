const express = require('express');
const router = express.Router();
const issuesController = require('../controllers/issues.controller');

// Route to report an issue
router.post('/report', issuesController.reportIssue);

// Route to get all issues (Admin only)
router.get('/all', issuesController.getAllIssues);

// Route to provide feedback on an issue
router.post('/feedback/:id', issuesController.provideFeedback);

// Route to get feedback for a specific issue
router.get('/feedback/:id', issuesController.getFeedbackByIssueId);


// Route to get feedback for a specific issue
router.get('/feedback-by-admin/:admin_id', issuesController.getFeedbackForAdminIssues);
module.exports = router;