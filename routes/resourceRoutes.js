const express = require('express');
const router = express.Router();
const { listResources, getResource, createResource, deleteResource } = require('../controllers/resourceController');
const { protect, restrictTo } = require('../Middleware/authMiddleware');

// GET /api/resources — public, optionally filter by ?type=Video|Article
router.get('/', listResources);

// GET /api/resources/:id — public
router.get('/:id', getResource);

// POST /api/resources — entrepreneur or admin only
router.post('/', protect, restrictTo('entrepreneur', 'admin'), createResource);

// DELETE /api/resources/:id — admin only
router.delete('/:id', protect, restrictTo('admin'), deleteResource);

module.exports = router;
