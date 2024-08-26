const db = require('../config/db.config');

// Report an issue (Admin Role)
exports.reportIssue = async (req, res) => {
    const { admin_id, issue_description } = req.body;

    if (!admin_id || !issue_description) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const connection = await db;
        const [result] = await connection.execute(
            'INSERT INTO issues (admin_id, issue_description, status, created_at) VALUES (?, ?, ?, NOW())',
            [admin_id, issue_description, 'open']
        );

        res.status(201).json({ message: 'Issue reported successfully.', issueId: result.insertId });
    } catch (err) {
        console.error('Error reporting issue:', err);
        res.status(500).json({ message: 'Error reporting issue.', error: err.message });
    }
};

// Get all issues (System Admin Role)
exports.getAllIssues = async (req, res) => {
    try {
        const connection = await db;
        const [issues] = await connection.execute('SELECT * FROM issues');

        res.status(200).json(issues);
    } catch (err) {
        console.error('Error fetching issues:', err);
        res.status(500).json({ message: 'Error fetching issues.', error: err.message });
    }
};

// Provide feedback on an issue (System Admin Role)
exports.provideFeedback = async (req, res) => {
    const { id } = req.params;
    const { admin_id, feedback_message } = req.body;

    if (!admin_id ||  !feedback_message) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const connection = await db;

        // Ensure the issue exists
        const [issue] = await connection.execute('SELECT * FROM issues WHERE id = ?', [id]);
        if (issue.length === 0) {
            return res.status(404).json({ message: 'Issue not found.' });
        }

        // Insert feedback
        await connection.execute(
            'INSERT INTO feedback (issue_id, admin_id, feedback_message, created_at) VALUES (?, ?, ?, NOW())',
            [id, admin_id, feedback_message]
        );

        // Optionally, update issue status
        await connection.execute(
            'UPDATE issues SET status = ? WHERE id = ?',
            ['in progress', id]
        );

        res.status(201).json({ message: 'Feedback provided successfully.' });
    } catch (err) {
        console.error('Error providing feedback:', err);
        res.status(500).json({ message: 'Error providing feedback.', error: err.message });
    }
};

// Get feedback for a specific issue (Admin Role)
exports.getFeedbackByIssueId = async (req, res) => {
    const { id } = req.params;

    try {
        const connection = await db;
        const [feedback] = await connection.execute('SELECT * FROM feedback WHERE issue_id = ?', [id]);

        if (feedback.length === 0) {
            return res.status(404).json({ message: 'No feedback found for this issue.' });
        }

        res.status(200).json(feedback);
    } catch (err) {
        console.error('Error fetching feedback:', err);
        res.status(500).json({ message: 'Error fetching feedback.', error: err.message });
    }
};