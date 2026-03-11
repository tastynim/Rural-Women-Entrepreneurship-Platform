const express = require('express');
const router = express.Router();
const { addProduct, getAllProducts, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, restrictTo, checkProductOwnership } = require('../Middleware/authMiddleware');

// Add product - Only entrepreneurs and admins can add
router.post('/add', protect, restrictTo('entrepreneur', 'admin'), addProduct);

// Get all products - Public access
router.get('/all', getAllProducts);

// Update product - Only owner entrepreneur or admin
router.put('/:id', protect, restrictTo('entrepreneur', 'admin'), checkProductOwnership, updateProduct);

// Delete product - Only owner entrepreneur or admin
router.delete('/:id', protect, restrictTo('entrepreneur', 'admin'), checkProductOwnership, deleteProduct);

module.exports = router;
