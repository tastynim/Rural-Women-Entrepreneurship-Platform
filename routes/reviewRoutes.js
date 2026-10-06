// routes/reviewRoutes.js
const express = require("express");
const router = express.Router();
const {
  addReview,
  getProductReviews,
  getAllReviews,
} = require("../controllers/reviewController");

// GET all reviews
router.get("/", getAllReviews);

// POST route to add a review
router.post("/add", addReview);

// GET route to fetch reviews for a specific product
router.get("/product/:productName", getProductReviews);

module.exports = router;
