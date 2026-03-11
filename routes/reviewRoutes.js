// routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const { addReview, getProductReviews } = require('../controllers/reviewcontroller');

// POST route to add a review
router.post('/add', addReview);

// GET route to fetch reviews for a specific product
// The ":productName" acts as a variable in the URL
// include 'product' segment for clarity and avoid collision with POST
router.get('/product/:productName', getProductReviews);

module.exports = router;
