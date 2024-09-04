const db = require('../config/db.config'); // Import your database configuration

exports.search = async (req, res) => {
  const searchTerm = req.query.query; // Get the search term from the query string

  try {
    const connection = await db;
    const [results] = await connection.execute(
      "SELECT * FROM Posts WHERE title LIKE ? OR content LIKE ?", // Update your SQL query to match your database
      [`%${searchTerm}%`, `%${searchTerm}%`]
    );

    res.status(200).json(results);
  } catch (err) {
    console.error("Error searching:", err);
    res.status(500).json({ message: "Error searching.", error: err.message });
  }
};