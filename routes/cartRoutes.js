const express = require('express');
const router = express.Router();
const { addToCart, getCart, clearCart } = require('../controllers/cartController');
const { protect } = require('../Middleware/authMiddleware');

router.get('/', protect, getCart);
router.post('/add', protect, addToCart);
router.delete('/clear', protect, clearCart);

module.exports = router;