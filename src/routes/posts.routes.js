const express = require('express');
const router = express.Router();
const postsController = require('../controllers/posts.controller');
const authController = require('../controllers/auth.controller');
const multer = require('multer');
const path = require('path');

// Set up multer for storing uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Specify the folder to store images
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only .jpeg, .jpg, and .png formats allowed!'));
        }
    }
});

// Route to create a new post (Protected route)
router.post('/posts', upload.single('image'), postsController.createPost);

// Route to get all posts (Public route, no authentication needed)
router.get('/posts', postsController.getAllPosts);

// Route to get a post by ID (Public route, no authentication needed)
router.get('/posts/:id', postsController.getPostById);

// Route to update a post by ID (Protected route)
router.put('/posts/:id', authController.authenticateToken, upload.single('image'), postsController.updatePost);

// Route to delete a post by ID (Protected route)
router.delete('/posts/:id', authController.authenticateToken, postsController.deletePost);

module.exports = router;
