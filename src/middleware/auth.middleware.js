// Middleware to check if the user is authenticated
exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.admin) { 
    return next(); // User is authenticated, proceed
  } else {
    // Redirect to login if not authenticated
    return res.redirect('/login.html'); 
  }
  
},

exports.isAuthenticated = (req, res, next) => {
  console.log("Session ID:", req.sessionID); // Now it will log the ID
  // ... your authentication logic (if needed) ...
  next();
};

  
  // Middleware to check if the user has a specific admin role
exports.hasRole = (roles) => {
    return (req, res, next) => {
      if (req.session.admin && roles.includes(req.session.admin.role)) {
        return next(); // User has one of the specified roles, proceed
      } else {
        return res.status(403).json({ message: 'Access denied. You do not have the required role.' });
      }
    };
  };

  
  // Middleware to check if the user is a regular user
exports.isUser = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'user') {
      return next(); // Proceed if user is a regular user
    } else {
      return res.status(403).json({ message: 'Access denied. Regular users only.' });
    }
  };
  