const express = require("express");
const dotenv = require("dotenv");
const db = require("./config/db.config"); // Database configuration
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require('express-session');
const path = require("path");

dotenv.config();

const app = express();

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false, 
  saveUninitialized: false, //'false'
  cookie: { maxAge: 300000  } // 1-hour session expiration
}));
// Middleware to log session details for debugging
app.use((req, res, next) => {
  console.log('Session ID:', req.sessionID);
  console.log('Session:', req.session);
  next();
});

// Middleware setup
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Define routes before starting server
const authController = require("./controllers/auth.controller");
const adminRoutes = require("./routes/admin.routes");
const postRoutes = require("./routes/posts.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const issuesRoutes = require("./routes/issues.routes");
const searchRoutes = require('./routes/search.routes');

app.use("/api/admin", adminRoutes);
app.use("/api/post", postRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/issues", issuesRoutes);
app.use("/api/search", searchRoutes); // Register search routes

// Serve static files for various routes
app.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/AdminLogin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "AdminLogin.html"));
});

app.get("/index", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/admin-dashboard", (req, res) => {
  console.log("User authenticated, accessing admin dashboard");
  res.sendFile(path.join(__dirname, "public", "sysAdminHomePage.html"));
});

// Additional routes
app.get("/registerSectorAdmin.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "registerSectorAdmin.html"));
});

app.get("/view-admins.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "view-admins.html"));
});

app.get("/viewIssue.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "viewIssue.html"));
});

app.get("/update-admin.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "update-admin.html"));
});

app.get("/delete-admin.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "delete-admin.html"));
});

app.get("/insertHospitalInfo.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "insertHospitalInfo.html"));
});

app.get('/insertEventFestivalInfo.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'insertEventFestivalInfo.html'));
});

app.get('/viewEventFestivalInfo.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'viewEventFestivalInfo.html'));
});

app.get('/IssueReporting.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'IssueReporting.html'));
});

app.get('/view-feedback.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'view-feedback.html'));
});

app.get('/viewHealthSectorInfo.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'viewHealthSectorInfo.html'));
});

app.get('/InsertSecurityInfo.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'InsertSecurityInfo.html'));
});

app.get('/viewSecurityInfo.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'viewSecurityInfo.html'));
});

app.get('/InsertHotelTourismInfo.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'InsertHotelTourismInfo.html'));
});

app.get('/viewTourismInfo.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'viewTourismInfo.html'));
});

app.get('/Hotels.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Hotels.html'));
});

app.get('/HistoricalPlaces.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'HistoricalPlaces.html'));
});

app.get('/InsertTransportationInfo.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'InsertTransportationInfo.html'));
});

app.get('/viewTransportationInfo.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'viewTransportationInfo.html'));
});

app.get('/insert_water_supply_info.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'insert_water_supply_info.html'));
});

app.get('/viewWaterSupplyInfo.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'viewWaterSupplyInfo.html'));
});

app.get('/managePost.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'managePost.html'));
});

app.get('/managePersonalInfo.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'managePersonalInfo.html'));
});

app.get('/view-count-report.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'view-count-report.html'));
});

// API route example
app.get('/api/post/view-count-report', async (req, res) => {
  try {
    const result = await postController.getViewCountReport();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching view count report:", error);
    res.status(500).json({ message: "Error fetching view count report.", error: error.message });
  }
});

app.get('/view-sysadmin-likes.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'view-sysadmin-likes.html'));
});

// Start server after successful database connection
db.then((connection) => {
  console.log("Connected to the MySQL database.");
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((err) => {
  console.error("Failed to connect to the database:", err);
  process.exit(1); // Exit the process with failure
});
