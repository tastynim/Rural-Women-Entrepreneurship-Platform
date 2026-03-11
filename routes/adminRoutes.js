const express = require('express');
const router = express.Router();
const { getBasicAnalytics, approveUser, approveProduct } = require('../controllers/adminController');
const { protect, restrictTo } = require('../Middleware/authMiddleware');

router.get('/analytics', protect, restrictTo('Admin'), getBasicAnalytics);
router.put('/approve/user/:id', protect, restrictTo('Admin'), approveUser);
router.put('/approve/product/:id', protect, restrictTo('Admin'), approveProduct);

module.exports = router;