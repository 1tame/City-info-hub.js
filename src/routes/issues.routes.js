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

// Serve the view-reaction.html page
router.get('/view-reaction', (req, res) => {
    res.sendFile(path.join(__dirname, '../public','../view-reaction.html'));
});
// Like Post Route
//router.post('/like', issuesController.likePost);

// Dislike Post Route
//router.post('/dislike', issuesController.dislikePost);
//router.get('/feedback/reaction', issuesController.handleFeedbackReaction)
// Route to handle like/dislike feedback
//router.post("/feedback/like", issuesController.likeOrDislikeFeedback);
console.log('1');

router.post('/feedbackk/reaction', issuesController.handleFeedbackReaction);

// Route to get feedback for a specific issue
router.get('/feedback-by-admin/:admin_id', issuesController.getFeedbackForAdminIssues);

// Route to get all feedback with details
router.get('/all-feedback-details', issuesController.getAllFeedbackWithDetails); 
router.get('/issues-feedback-reactions', issuesController.getFeedbackWithReaction); 


module.exports = router;