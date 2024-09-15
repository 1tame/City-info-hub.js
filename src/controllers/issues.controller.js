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

        res.status(200).json({ message: 'Issue reported successfully.', issueId: result.insertId });
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

        res.status(200).json({ message: 'Feedback provided successfully.' });
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


// issues.controller.js

//handles reaction
exports.handleFeedbackReaction = async (req, res) => {
  console.log('2');
  const { feedbackId, adminId, action } = req.body;  // Destructure the request body

  console.log("Received Data:", req.body);  // Log the incoming request body

  // Check if all required fields are provided
  if (!feedbackId || !adminId || !action) {
    console.log(feedbackId , adminId , action);
    

    console.error("Validation Error: Missing feedbackId, adminId, or action");
    return res.status(400).json({ message: "All fields are required." });
  }


  try {
    const connection = await db;
    await connection.beginTransaction();

    // Check if the admin already reacted to this feedback
    const [existingReaction] = await connection.execute(
      "SELECT * FROM feedback_likes WHERE feedback_id = ? AND admin_id = ?",
      [feedbackId, adminId]
    );

    if (existingReaction.length > 0) {
      // Remove the existing reaction
      const previousAction = existingReaction[0].action;

      await connection.execute(
        "DELETE FROM feedback_likes WHERE feedback_id = ? AND admin_id = ?",
        [feedbackId, adminId]
      );

      if (previousAction === 'like') {
        await connection.execute(
          "UPDATE feedback SET likes = likes - 1 WHERE id = ?",
          [feedbackId]
        );
      } else if (previousAction === 'dislike') {
        await connection.execute(
          "UPDATE feedback SET dislikes = dislikes - 1 WHERE id = ?",
          [feedbackId]
        );
      }
    }

    // Insert the new like or dislike
    if (action === 'like') {
      await connection.execute(
        "INSERT INTO feedback_likes (feedback_id, admin_id, action) VALUES (?, ?, ?)",
        [feedbackId, adminId, 'like']
      );
      await connection.execute(
        "UPDATE feedback SET likes = likes + 1 WHERE id = ?",
        [feedbackId]
      );
    } else if (action === 'dislike') {
      await connection.execute(
        "INSERT INTO feedback_likes (feedback_id, admin_id, action) VALUES (?, ?, ?)",
        [feedbackId, adminId, 'dislike']
      );
      await connection.execute(
        "UPDATE feedback SET dislikes = dislikes + 1 WHERE id = ?",
        [feedbackId]
      );
    }

    // Commit transaction
    await connection.commit();

    // Fetch updated feedback data
    const [updatedFeedback] = await connection.execute(
      "SELECT * FROM feedback WHERE id = ?",
      [feedbackId]
    );

    res.status(200).json({
      message: `Feedback ${action}d successfully.`,
      ...updatedFeedback[0],
    });
  } catch (error) {
    console.log('3');
    console.error(`Error handling feedback reaction: ${action}`, error);

    // Rollback transaction if any error occurs
    if (connection) {
      await connection.rollback();
    }

    res.status(500).json({ message: `Error handling feedback ${action}.` });
  
  }
};


// Get feedback provided by a specific admin (Admin Role)
exports.getFeedbackByAdminId = async (req, res) => {
    const { admin_id } = req.params;

    try {
        const connection = await db;
        const [feedback] = await connection.execute(
            'SELECT * FROM feedback WHERE admin_id = ?',
            [admin_id]
        );

        if (feedback.length === 0) {
            return res.status(404).json({ message: 'No feedback found for this admin.' });
        }

        res.status(200).json(feedback);
    } catch (err) {
        console.error('Error fetching feedback:', err);
        res.status(500).json({ message: 'Error fetching feedback.', error: err.message });
    }
};
// Get feedback for issues reported by a specific admin (Admin Role)
exports.getFeedbackForAdminIssues = async (req, res) => {
    const { admin_id } = req.params;

    try {
        const connection = await db;
        
        // Get the issues reported by the specific admin
        const [issues] = await connection.execute(
            'SELECT id FROM issues WHERE admin_id = ?',
            [admin_id]
        );

        if (issues.length === 0) {
            return res.status(404).json({ message: 'No issues found for this admin.' });
        }

        // Extract the issue IDs
        const issueIds = issues.map(issue => issue.id);

        // Get feedback for those issues
        const [feedback] = await connection.execute(
            `SELECT * FROM feedback WHERE issue_id IN (${issueIds.join(',')})`
        );

        if (feedback.length === 0) {
            return res.status(404).json({ message: 'No feedback found for the issues reported by this admin.' });
        }

        res.status(200).json(feedback);
    } catch (err) {
        console.error('Error fetching feedback:', err);
        res.status(500).json({ message: 'Error fetching feedback.', error: err.message });
    }
};
// Get feedback along with issue details for issues reported by a specific admin (Admin Role)
exports.getFeedbackForAdminIssues = async (req, res) => {
    const { admin_id } = req.params;

    try {
        const connection = await db;
        
        // Get issues and feedback for those issues reported by the specific admin
        const [results] = await connection.execute(
            `SELECT i.id AS issue_id, i.issue_description, i.status, i.created_at AS issue_created_at, 
                    f.id AS feedback_id, f.feedback_message, f.created_at AS feedback_created_at, f.admin_id AS feedback_admin_id
             FROM issues i
             INNER JOIN feedback f ON i.id = f.issue_id
             WHERE i.admin_id = ?`,
            [admin_id]
        );
        

        if (results.length === 0) {
            return res.status(404).json({ message: 'No issues or feedback found for this admin.' });
        }

        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching feedback and issues:', err);
        res.status(500).json({ message: 'Error fetching feedback and issues.', error: err.message });
    }
};




// ... your other controller functions ...

// Get all feedback with issue details and reactions
exports.getAllFeedbackWithDetails = async (req, res) => {
    try {
        const connection = await db;

        const [results] = await connection.execute(
            `SELECT 
                i.id AS issue_id, 
                i.issue_description, 
                i.status, 
                i.created_at AS issue_created_at, 
                f.id AS feedback_id, 
                f.feedback_message, 
                f.created_at AS feedback_created_at, 
                f.admin_id AS feedback_admin_id,
                SUM(CASE WHEN fl.action = 'like' THEN 1 ELSE 0 END) as likes,
                SUM(CASE WHEN fl.action = 'dislike' THEN 1 ELSE 0 END) as dislikes
            FROM issues i
            INNER JOIN feedback f ON i.id = f.issue_id
            LEFT JOIN feedback_likes fl ON f.id = fl.feedback_id 
            GROUP BY f.id;` // No WHERE clause to get all feedback
        );

        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching feedback and details:', err);
        res.status(500).json({ message: 'Error fetching feedback and details.', error: err.message });
    }
};


// API to get all feedback with issue details and reactions
exports.getFeedbackWithReaction =async (req, res) => {
  try {
      const connection = await db;
      const [results] = await connection.execute(`
          SELECT 
              i.id AS issue_id, 
              i.issue_description, 
              i.status, 
              i.created_at AS issue_created_at, 
              f.id AS feedback_id, 
              f.feedback_message, 
              f.created_at AS feedback_created_at, 
              f.admin_id AS feedback_admin_id,
              COALESCE(SUM(CASE WHEN fl.action = 'like' THEN 1 ELSE 0 END), 0) as likes,
              COALESCE(SUM(CASE WHEN fl.action = 'dislike' THEN 1 ELSE 0 END), 0) as dislikes
          FROM issues i
          INNER JOIN feedback f ON i.id = f.issue_id
          LEFT JOIN feedback_likes fl ON f.id = fl.feedback_id
          GROUP BY f.id, i.id
      `);

      res.status(200).json(results);
  } catch (err) {
      console.error('Error fetching feedback and details:', err);
      res.status(500).json({ message: 'Error fetching feedback and details.', error: err.message });
  }
};

