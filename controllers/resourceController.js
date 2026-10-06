// controllers/resourceController.js — Training Resources (Videos & Articles)
const Resource = require('../models/Resource');

// GET /api/resources — list all (optionally filter by ?type=Video|Article)
const listResources = async (req, res) => {
    try {
        const filter = req.query.type ? { type: req.query.type } : {};
        const resources = await Resource.find(filter)
            .populate('uploadedBy', 'name')
            .sort({ createdAt: -1 });
        res.json(resources);
    } catch (err) {
        console.error('listResources error', err);
        res.status(500).json({ message: 'Failed to fetch resources' });
    }
};

// GET /api/resources/:id — get single resource
const getResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id).populate('uploadedBy', 'name');
        if (!resource) return res.status(404).json({ message: 'Resource not found' });
        res.json(resource);
    } catch (err) {
        console.error('getResource error', err);
        res.status(500).json({ message: 'Failed to fetch resource' });
    }
};

// POST /api/resources — create a new resource (entrepreneur / admin only)
const createResource = async (req, res) => {
    try {
        const { title, description, type, url } = req.body;
        if (!title || !type || !url) {
            return res.status(400).json({ message: 'title, type and url are required' });
        }
        if (!['Video', 'Article'].includes(type)) {
            return res.status(400).json({ message: 'type must be Video or Article' });
        }
        const resource = new Resource({
            title,
            description,
            type,
            url,
            uploadedBy: req.user ? req.user.id : undefined,
        });
        await resource.save();
        res.status(201).json({ message: 'Resource created successfully', resource });
    } catch (err) {
        console.error('createResource error', err);
        res.status(500).json({ message: 'Failed to create resource' });
    }
};

// DELETE /api/resources/:id — delete a resource (admin only)
const deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findByIdAndDelete(req.params.id);
        if (!resource) return res.status(404).json({ message: 'Resource not found' });
        res.json({ message: 'Resource deleted successfully' });
    } catch (err) {
        console.error('deleteResource error', err);
        res.status(500).json({ message: 'Failed to delete resource' });
    }
};

module.exports = { listResources, getResource, createResource, deleteResource };
