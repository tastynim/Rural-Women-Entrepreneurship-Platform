// controllers/forumController.js — Community Forum / Discussion Board
const ForumPost = require('../models/ForumPost');

// Get all posts (optionally filtered by category)
const listPosts = async (req, res) => {
    try {
        const filter = req.query.category ? { category: req.query.category } : {};
        const posts = await ForumPost.find(filter)
            .populate('user', 'name')
            .populate('comments.user', 'name')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        console.error('listPosts error', err);
        res.status(500).json({ message: 'Failed to fetch posts' });
    }
};

// Get a single post by ID
const getPost = async (req, res) => {
    try {
        const post = await ForumPost.findById(req.params.id)
            .populate('user', 'name')
            .populate('comments.user', 'name');
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.json(post);
    } catch (err) {
        console.error('getPost error', err);
        res.status(500).json({ message: 'Failed to fetch post' });
    }
};

// Create a new post
const createPost = async (req, res) => {
    try {
        const { title, content, category } = req.body;
        if (!title || !content) {
            return res.status(400).json({ message: 'title and content are required' });
        }
        const post = new ForumPost({
            user: req.user.id,
            title,
            content,
            category: category || 'General'
        });
        await post.save();
        await post.populate('user', 'name');
        res.status(201).json({ message: 'Post created', post });
    } catch (err) {
        console.error('createPost error', err);
        res.status(500).json({ message: 'Failed to create post' });
    }
};

// Add a comment to a post
const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: 'Comment text is required' });

        const post = await ForumPost.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        post.comments.push({ user: req.user.id, text });
        await post.save();

        await post.populate('user', 'name');
        await post.populate('comments.user', 'name');

        res.json({ message: 'Comment added', post });
    } catch (err) {
        console.error('addComment error', err);
        res.status(500).json({ message: 'Failed to add comment' });
    }
};

// Delete a post (owner or admin)
const deletePost = async (req, res) => {
    try {
        const post = await ForumPost.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Only the author or an admin can delete
        if (post.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        await ForumPost.findByIdAndDelete(req.params.id);
        res.json({ message: 'Post deleted' });
    } catch (err) {
        console.error('deletePost error', err);
        res.status(500).json({ message: 'Failed to delete post' });
    }
};

module.exports = { listPosts, getPost, createPost, addComment, deletePost };
