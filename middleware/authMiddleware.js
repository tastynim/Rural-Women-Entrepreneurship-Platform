const jwt = require('jsonwebtoken');
const Product = require('../models/product');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
            req.user = decoded; // Contains id and role
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'You do not have permission to perform this action' });
        }
        next();
    };
};

// Check if user owns the product or is an admin
const checkProductOwnership = async (req, res, next) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Admin can edit/delete any product
        if (req.user.role === 'admin') {
            return next();
        }

        // Entrepreneur can only edit/delete their own products
        if (product.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You can only modify your own products' });
        }

        next();
    } catch (error) {
        return res.status(500).json({ message: 'Authorization check failed' });
    }
};

module.exports = { protect, restrictTo, checkProductOwnership };