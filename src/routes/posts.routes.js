const express = require('express');
const router = express.Router();
const postsController = require('../controllers/posts.controller');
const authController = require('../controllers/auth.controller');
const multer = require('multer');
const path = require('path');

// Set up multer for storing uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/public/uploads/'); // Specify the folder to store images
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

router.get('/posts_by_search/:search', postsController.getAllPostsBySearch);

router.get('/posts_by_sector/:sector', postsController.getPostBySector);

// Route to update a post by ID (Protected route)
router.put('/posts/:id',  upload.single('image'), postsController.updatePost);

// Route to delete a post by ID (Protected route)
router.delete('/posts/:id', postsController.deletePost);

// Route to get the view count report (Public route)
router.get('/view-count-report', postsController.getViewCountReport);

// Route to like a post (Public route, no authentication needed)
router.post('/posts/like/:postId', postsController.likePost);

// Route to dislike a post (Public route, no authentication needed)
router.post('/posts/dislike/:postId', postsController.dislikePost);

module.exports = router;
