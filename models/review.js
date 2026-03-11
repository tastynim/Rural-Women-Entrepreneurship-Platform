// models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    customerName: { 
        type: String, 
        required: true 
    },
    productName: { 
        type: String, 
        required: true 
    },
    rating: { 
        type: Number, 
        required: true,
        min: 1, // Minimum 1 star
        max: 5  // Maximum 5 stars
    },
    comment: { 
        type: String, 
        required: true 
    }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt dates

module.exports = mongoose.model('Review', reviewSchema);
