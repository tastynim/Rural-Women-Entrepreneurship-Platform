const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/analyticsController');

// GET route to fetch the dashboard data
router.get('/dashboard', getDashboardStats);

module.exports = router;
