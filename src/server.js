const express = require("express");
const dotenv = require("dotenv");
const db = require("./config/db.config"); // Database configuration
const bodyParser = require("body-parser");
const cors = require("cors");

// Load environment variables
dotenv.config();

const path = require("path");
const app = express();
app.use(express.static(path.join(__dirname, "public")));

app.use(cors());
// Ensure body-parser is set up correctly
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Test Database Connection
db.then((connection) => {
  console.log("Connected to the MySQL database.");

  // Start server after successful database connection
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  // auth controller
  const authController = require("./controllers/auth.controller");

  // Import and use routes after the middleware is set up
  const adminRoutes = require("./routes/admin.routes");
  const postRoutes = require("./routes/posts.routes");
  const authRoutes = require("./routes/auth.routes");
  const issuesRoutes = require("./routes/issues.routes");

  app.use("/api/admin", adminRoutes);
  app.use("/api/post", postRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/issues", issuesRoutes);
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public", "index.html"));
  });
  app.get("/AdminLogin", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "AdminLogin.html"));
  });
  app.get("/admin-dashboard", (req, res) => {
    console.log("User authenticated, accessing admin dashboard");
    console.log(authController.loginAdmin);

    // Serve the admin dashboard HTML file
    res.sendFile(path.join(__dirname, "public", "sysAdminHomePage.html"));
  });

  // Optionally, you can close the connection if it's not needed immediately
  // connection.end();
}).catch((err) => {
  console.error("Failed to connect to the database:", err);
  process.exit(1); // Exit the process with failure
});
