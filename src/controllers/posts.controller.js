const db = require("../config/db.config");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { log } = require("util");

// Set up multer for storing uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Specify the folder to store images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only .jpeg, .jpg, and .png formats allowed!"));
    }
  },
}).single("image");

// Function to create a new post
exports.createPost = async (req, res) => {
  console.log(req.body);

  const { title, content, type, adminId, category='' } = req.body;
  console.log(title, content, type, adminId);

  if (!title || !content || !type || !adminId) {
    return res.status(400).json({ message: "All fields are required." });
  }

  let imageUrl = null;
  if (req.file) {
    console.log("Loading image");

    imageUrl = `/uploads/${req.file.filename}`;
  }

  try {
    const connection = await db;

    // Fetch the admin's role from the database
    const [adminRows] = await connection.execute(
      "SELECT role FROM admins WHERE id = ?",
      [adminId]
    );

    if (adminRows.length === 0) {
      return res.status(404).json({ message: "Admin not found." });
    }

    const adminRole = adminRows[0].role;

    // Check if the admin's role contains the type
    if (!adminRole.includes(type)) {
      return res
        .status(403)
        .json({
          message: `You do not have permission to create a post of type '${type}'.`,
        });
    }

    // Insert the new post into the database
    const [result] = await connection.execute(
      "INSERT INTO Posts (title, content, type, adminId, imageUrl,category) VALUES (?, ?, ?, ?, ?, ?)",
      [title, content, type, adminId, imageUrl, category]
    );

    res
      .status(201)
      .json({ message: "Post created successfully.", postId: result.insertId });
  } catch (err) {
    console.error("Error creating post:", err);
    res
      .status(500)
      .json({ message: "Error creating post.", error: err.message });
  }
};

// Function to get all posts
exports.getAllPosts = async (req, res) => {
  try {
    const connection = await db;

    const [posts] = await connection.execute("SELECT * FROM Posts");

    res.status(200).json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res
      .status(500)
      .json({ message: "Error fetching posts.", error: err.message });
  }
};

// Function to get a post by ID
exports.getPostById = async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await db;

    const [post] = await connection.execute(
      "SELECT * FROM Posts WHERE id = ?",
      [id]
    );

    if (post.length === 0) {
      return res.status(404).json({ message: "Post not found." });
    }

    // Increment the view count
    await connection.execute(
      "UPDATE Posts SET viewCount = viewCount + 1 WHERE id = ?",
      [id]
    );

    res.status(200).json(post[0]);
  } catch (err) {
    console.error("Error fetching post:", err);
    res
      .status(500)
      .json({ message: "Error fetching post.", error: err.message });
  }
};


// Function to get a post by sector
exports.getPostBySector = async (req, res) => {
  const { sector } = req.params;

  try {
    const connection = await db;

    const [post] = await connection.execute(
      "SELECT * FROM Posts WHERE type = ?",
      [id]
    );

    if (post.length === 0) {
      return res.status(404).json({ message: "No not found." });
    }
    res.status(200).json(post[0]);
  } catch (err) {
    console.error("Error fetching post:", err);
    res
      .status(500)
      .json({ message: "Error fetching post.", error: err.message });
  }
};

// Function to update a post
exports.updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, content, type, adminId } = req.body;

  if (!title || !content || !type || !adminId) {
    return res.status(400).json({ message: "All fields are required." });
  }

  let imageUrl = null;
  if (req.file) {
    imageUrl = `/uploads/${req.file.filename}`;
  }

  try {
    const connection = await db;

    // Fetch the admin's role
    const [adminRows] = await connection.execute(
      "SELECT role FROM admins WHERE id = ?",
      [adminId]
    );

    if (adminRows.length === 0) {
      return res.status(404).json({ message: "Admin not found." });
    }

    const adminRole = adminRows[0].role;

    // Check if the admin's role contains the type
    if (!adminRole.includes(type)) {
      return res
        .status(403)
        .json({
          message: `You do not have permission to update a post of type '${type}'.`,
        });
    }

    // Fetch the current post to get the old image URL (if any)
    const [currentPost] = await connection.execute(
      "SELECT imageUrl FROM Posts WHERE id = ?",
      [id]
    );

    if (currentPost.length === 0) {
      return res.status(404).json({ message: "Post not found." });
    }

    // Update the post in the database
    const [result] = await connection.execute(
      "UPDATE Posts SET title = ?, content = ?, type = ?, adminId = ?, imageUrl = ? WHERE id = ?",
      [title, content, type, adminId, imageUrl || currentPost[0].imageUrl, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Post not found." });
    }

    // If a new image was uploaded and there's an old image, delete the old image file
    if (req.file && currentPost[0].imageUrl) {
      const oldImagePath = path.join(__dirname, "..", currentPost[0].imageUrl);
      fs.unlink(oldImagePath, (err) => {
        if (err) console.error("Error deleting old image:", err);
      });
    }

    res.status(200).json({ message: "Post updated successfully." });
  } catch (err) {
    console.error("Error updating post:", err);
    res
      .status(500)
      .json({ message: "Error updating post.", error: err.message });
  }
};

// Function to delete a post
exports.deletePost = async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await db;

    // Fetch the current post to get the image URL (if any)
    const [currentPost] = await connection.execute(
      "SELECT imageUrl FROM Posts WHERE id = ?",
      [id]
    );

    if (currentPost.length === 0) {
      return res.status(404).json({ message: "Post not found." });
    }

    // Delete the post from the database
    const [result] = await connection.execute(
      "DELETE FROM Posts WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Post not found." });
    }

    // If there's an image, delete the file
    if (currentPost[0].imageUrl) {
      const imagePath = path.join(__dirname, "..", currentPost[0].imageUrl);
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Error deleting image:", err);
      });
    }

    res.status(200).json({ message: "Post deleted successfully." });
  } catch (err) {
    console.error("Error deleting post:", err);
    res
      .status(500)
      .json({ message: "Error deleting post.", error: err.message });
  }
};
