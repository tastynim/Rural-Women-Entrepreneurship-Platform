const express = require('express');
const router = express.Router();
const {
    listPosts,
    getPost,
    createPost,
    addComment,
    deletePost
} = require('../controllers/forumController');
const { protect } = require('../Middleware/authMiddleware');

// GET /api/forum — list all posts (public, optional ?category= filter)
router.get('/', listPosts);

// GET /api/forum/:id — get single post
router.get('/:id', getPost);

// POST /api/forum — create a new post (must be logged in)
router.post('/', protect, createPost);

// POST /api/forum/:id/comment — add a comment to a post (must be logged in)
router.post('/:id/comment', protect, addComment);

// DELETE /api/forum/:id — delete a post (owner or admin)
router.delete('/:id', protect, deletePost);

module.exports = router;
