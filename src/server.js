const express = require("express");
const dotenv = require("dotenv");
const db = require("./config/db.config"); // Database configuration
const bodyParser = require("body-parser");
const cors = require("cors");
const postController = require('./controllers/posts.controller');
// Load environment variables
dotenv.config();

const path = require("path");
const app = express();
app.use(express.static(path.join(__dirname, "public")));




app.use(cors());
// Ensure body-parser is set up correctly
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
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
  const searchRoutes = require('./routes/search.routes');

  app.use("/api/admin", adminRoutes);
  app.use("/api/post", postRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/issues", issuesRoutes);
  app.use("/api/search", searchRoutes); // Register search routes

  // app.js or server.js



  /*app.post('/api/post/posts', (req, res) => {
    // Extract data from the form submission
    const { fieldName1, fieldName2 } = req.body;
  
    // Log the form data to the console (or process it as needed)
    console.log('Form Data:', req.body);
  
    // Send a response back to the client
    res.send('Form submission received!');
  
    // Here, you can add code to save the data to a database, etc.
  });
*/
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

  // Register the new routes
  app.get("/registerSectorAdmin.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "registerSectorAdmin.html"));
  });

  app.get("/view-admins.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "view-admins.html"));
  });

  app.get("/viewIssue.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "viewIssue.html"));
  });

  app.get("/AdminLogin.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "AdminLogin.html"));
  });

  //  routes for admin management
  /*app.get("/create-admin.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "create-admin.html"));
  });*/

  app.get("/view-admins.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "view-admins.html"));
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

// Route for Insert Event Festival Information
app.get('/insertEventFestivalInfo.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'insertEventFestivalInfo.html'));
});

// Route for View Event Festival Information
app.get('/viewEventFestivalInfo.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'viewEventFestivalInfo.html'));
});

// Route for Report an Issue
app.get('/IssueReporting.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'IssueReporting.html'));
});

// View a feedback
app.get('/view-feedback.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'view-feedback.html'));
});




// Route for View Health Sector Information
app.get('/viewHealthSectorInfo.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'viewHealthSectorInfo.html'));
});

// Route for Insert Security Information
app.get('/InsertSecurityInfo.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'InsertSecurityInfo.html'));
});

// Route for View Security Information
app.get('/viewSecurityInfo.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'viewSecurityInfo.html'));
});

// Route for Insert Tourism Information
app.get('/InsertHotelTourismInfo.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'InsertHotelTourismInfo.html'));
});

// Route for View Tourism Information
app.get('/viewTourismInfo.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'viewTourismInfo.html'));
});

// Route for View hotel Information
app.get('/Hotels.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Hotels.html'));
});

// Route for View historical places Information
app.get('/HistoricalPlaces.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'HistoricalPlaces.html'));
});

// Route for Insert Transportation Information
app.get('/InsertTransportationInfo.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'InsertTransportationInfo.html'));
});

// Route for View Transportation Information
app.get('/viewTransportationInfo.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'viewTransportationInfo.html'));
});

// Route for Insert Water Supply Information
app.get('/insert_water_supply_info.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'insert_water_supply_info.html'));
});

// Route for View Water Supply Information
app.get('/viewWaterSupplyInfo', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'viewWaterSupplyInfo.html'));
});

// Route for manage post Information
app.get('/managePost.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'managePost.html'));
});

// Route for manage post Information
app.get('/view-count-report.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'view-count-report.html'));
});

// ... (your existing server.js code)
app.get('/api/post/view-count-report', async (req, res) => {
  try {
    const result = await postsController.getViewCountReport();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching view count report:", error);
    res.status(500).json({ message: "Error fetching view count report.", error: error.message });
  }
});
// ... (rest of your server.js code)


  // Optionally, you can close the connection if it's not needed immediately
  // connection.end();
}).catch((err) => {
  console.error("Failed to connect to the database:", err);
  process.exit(1); // Exit the process with failure
});
