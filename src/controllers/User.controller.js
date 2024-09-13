const db = require("../config/db.config");
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');

// Function to create a new user
exports.createUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const connection = await db;

    // Check if the username already exists
    const [existingUser] = await connection.execute(
      "SELECT * FROM Users WHERE username = ?",
      [username]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ message: "Username already exists." });
    }

    // Check if the email already exists
    const [existingEmail] = await connection.execute(
      "SELECT * FROM Users WHERE email = ?",
      [email]
    );

    if (existingEmail.length > 0) {
      return res.status(409).json({ message: "Email already exists." });
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const [result] = await connection.execute(
      "INSERT INTO Users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    res
      .status(201)
      .json({ message: "User created successfully.", userId: result.insertId });
  } catch (err) {
    console.error("Error creating user:", err);
    res
      .status(500)
      .json({ message: "Error creating user.", error: err.message });
  }
};

// Function to find a user by username
exports.findUserByUsername = async (username) => {
  try {
    const connection = await db;
    const [rows] = await connection.execute(
      "SELECT * FROM Users WHERE username = ?",
      [username]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error finding user by username:", error);
    throw error;
  }
};

// Login a user
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const connection = await db;

    // Fetch user data from the Users table
    const [user] = await connection.execute(
      'SELECT * FROM Users WHERE username = ?',
      [username]
    );

    if (user.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const foundUser = user[0];

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, foundUser.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    // If password is valid, set the session data
   /* req.session.user = {
      id: foundUser.id,
      username: foundUser.username,
      role: 'user' // Since this is an ordinary user, assign 'user' role by default
    };*/
//console.log("userrr",req.session.user);

   res.status(200).json({ message: 'Login successful', user: user[0] });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// Check if the user is logged in
exports.isLoggedIn = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required." });
  }
  next();
};
exports.likePost = async (req, res) => {
  const { postId, userId } = req.body;

  if (!postId || !userId) {
    return res.status(400).json({ message: "postId and userId are required." });
  }

  let connection;

  try {
    connection = await db;

    // Start transaction
    await connection.beginTransaction();

    // Check if the user already liked the post
    const [existingLike] = await connection.execute(
      "SELECT * FROM Reactions WHERE postId = ? AND userId = ? AND type = ?",
      [postId, userId, "like"]
    );

    if (existingLike.length > 0) {
      // Remove the like
      await connection.execute(
        "DELETE FROM Reactions WHERE postId = ? AND userId = ? AND type = ?",
        [postId, userId, "like"]
      );

      // Update likes count in Posts table
      await connection.execute(
        "UPDATE Posts SET likes = likes - 1 WHERE id = ?",
        [postId]
      );

      // Commit transaction
      await connection.commit();

      // Fetch the updated post data
      const [updatedPost] = await connection.execute(
        "SELECT * FROM Posts WHERE id = ?",
        [postId]
      );

      return res.status(200).json({
        message: "Like removed successfully.",
   ...updatedPost[0],  // Return updated post data
      });
    }

    // Check if the user disliked the post
    const [existingDislike] = await connection.execute(
      "SELECT * FROM Reactions WHERE postId = ? AND userId = ? AND type = ?",
      [postId, userId, "dislike"]
    );

    if (existingDislike.length > 0) {
      // Remove the dislike
      await connection.execute(
        "DELETE FROM Reactions WHERE postId = ? AND userId = ? AND type = ?",
        [postId, userId, "dislike"]
      );

      // Update dislikes count in Posts table
      await connection.execute(
        "UPDATE Posts SET dislikes = dislikes - 1 WHERE id = ?",
        [postId]
      );
    }

    // Insert like into Reactions table
    await connection.execute(
      "INSERT INTO Reactions (postId, userId, type) VALUES (?, ?, ?)",
      [postId, userId, "like"]
    );

    // Update likes count in Posts table
    await connection.execute(
      "UPDATE Posts SET likes = likes + 1 WHERE id = ?",
      [postId]
    );

    // Commit transaction
    await connection.commit();

    // Fetch the updated post data
    const [updatedPost] = await connection.execute(
      "SELECT * FROM Posts WHERE id = ?",
      [postId]
    );

    res.status(200).json({
      message: "Post liked successfully.",
      ... updatedPost[0],  // Return updated post data
    });
  } catch (error) {
    console.error("Error liking post:", error);

    // Rollback transaction if any error occurs
    if (connection) {
      await connection.rollback();
    }

    res.status(500).json({ message: "Error liking post." });
  }
};


exports.dislikePost = async (req, res) => {
  const { postId, userId } = req.body;

  if (!postId || !userId) {
    return res.status(400).json({ message: "postId and userId are required." });
  }

  let connection;

  try {
    connection = await db;

    // Start transaction
    await connection.beginTransaction();

    // Check if the user already disliked the post
    const [existingDislike] = await connection.execute(
      "SELECT * FROM Reactions WHERE postId = ? AND userId = ? AND type = ?",
      [postId, userId, "dislike"]
    );

    if (existingDislike.length > 0) {
      // Remove the dislike
      await connection.execute(
        "DELETE FROM Reactions WHERE postId = ? AND userId = ? AND type = ?",
        [postId, userId, "dislike"]
      );

      // Update dislikes count in Posts table
      await connection.execute(
        "UPDATE Posts SET dislikes = dislikes - 1 WHERE id = ?",
        [postId]
      );

      // Commit transaction
      await connection.commit();

      // Fetch the updated post data
      const [updatedPost] = await connection.execute(
        "SELECT * FROM Posts WHERE id = ?",
        [postId]
      );

      return res.status(200).json({
        message: "Dislike removed successfully.",
        ... updatedPost[0],  // Return updated post data
      });
    }

    // Check if the user liked the post
    const [existingLike] = await connection.execute(
      "SELECT * FROM Reactions WHERE postId = ? AND userId = ? AND type = ?",
      [postId, userId, "like"]
    );

    if (existingLike.length > 0) {
      // Remove the like
      await connection.execute(
        "DELETE FROM Reactions WHERE postId = ? AND userId = ? AND type = ?",
        [postId, userId, "like"]
      );

      // Update likes count in Posts table
      await connection.execute(
        "UPDATE Posts SET likes = likes - 1 WHERE id = ?",
        [postId]
      );
    }

    // Insert dislike into Reactions table
    await connection.execute(
      "INSERT INTO Reactions (postId, userId, type) VALUES (?, ?, ?)",
      [postId, userId, "dislike"]
    );

    // Update dislikes count in Posts table
    await connection.execute(
      "UPDATE Posts SET dislikes = dislikes + 1 WHERE id = ?",
      [postId]
    );

    // Commit transaction
    await connection.commit();

    // Fetch the updated post data
    const [updatedPost] = await connection.execute(
      "SELECT * FROM Posts WHERE id = ?",
      [postId]
    );

    res.status(200).json({
      message: "Post disliked successfully.",
 ... updatedPost[0],  // Return updated post data
    });
  } catch (error) {
    console.error("Error disliking post:", error);

    // Rollback transaction if any error occurs
    if (connection) {
      await connection.rollback();
    }

    res.status(500).json({ message: "Error disliking post." });
  }
};


// Forgot password controller method
exports.forgotPassword = async (req, res) => {
  const { usernameOrEmail } = req.body;

  if (!usernameOrEmail) {
    return res.status(400).json({ message: "Username or Email is required." });
  }

  try {
    const connection = await db;
    let userQuery = '';
    let userParams = [];

    // Determine if usernameOrEmail is an email or username
    if (usernameOrEmail.includes('@')) {
      // Email is provided
      userQuery = 'SELECT * FROM Users WHERE email = ?';
      userParams = [usernameOrEmail];
    } else {
      // Username is provided
      userQuery = 'SELECT * FROM Users WHERE username = ?';
      userParams = [usernameOrEmail];
    }

    // Fetch user from database
    const [user] = await connection.execute(userQuery, userParams);

    // If no user is found, send a 404 response
    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const foundUser = user[0];

    // Generate a new random password
    const newPassword = generateRandomPassword(8);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    await connection.execute(
      'UPDATE Users SET password = ? WHERE id = ?',
      [hashedPassword, foundUser.id]
    );

    // Send the new password to the user's email
    await sendPasswordResetEmail(foundUser.email, newPassword);

    // Respond with success message
    res.status(200).json({ message: 'Password reset email sent successfully.' });

  } catch (error) {
    console.error('Error during password reset:', error);
    res.status(500).json({ message: 'Server error during password reset.' });
  }
};

// Helper function to generate a random password
function generateRandomPassword(length) {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]\\:;?><,./-="';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return password;
}

// Helper function to send password reset email using Nodemailer
async function sendPasswordResetEmail(email, newPassword) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.your-email-provider.com', // Update with actual email provider details
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'your-email@your-email-provider.com', // SMTP username
      pass: process.env.SMTP_PASS || 'your-email-password', // SMTP password
    },
  });

  // Email options
  const mailOptions = {
    from: process.env.SMTP_USER || 'your-email@your-email-provider.com', // Sender address
    to: email, // Receiver's email
    subject: 'Password Reset Request',
    html: `
      <p>Your new password is: <b>${newPassword}</b></p>
      <p>Please log in with this password and change it after logging in.</p>
    `,
  };

  // Send email
  await transporter.sendMail(mailOptions);
}
