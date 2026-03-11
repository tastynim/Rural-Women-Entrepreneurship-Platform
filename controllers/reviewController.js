// controllers/reviewController.js
const Review = require('../models/review');

// 1. Add a new review
const addReview = async (req, res) => {
    try {
        const { customerName, productName, rating, comment } = req.body;

        // Validate that the rating is between 1 and 5
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        const newReview = new Review({
            customerName,
            productName,
            rating,
            comment
        });

        await newReview.save();
        res.status(201).json({ message: 'Review added successfully!', review: newReview });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add review' });
    }
};

// 2. Get all reviews for a specific product
const getProductReviews = async (req, res) => {
    try {
        // We will grab the product name from the URL
        const productName = req.params.productName; 
        
        // Find all reviews in the database that match this product name
        const reviews = await Review.find({ productName: productName });
        
        res.status(200).json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch reviews' });
    }
};

module.exports = { addReview, getProductReviews };
