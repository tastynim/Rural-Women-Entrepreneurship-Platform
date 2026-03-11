const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true },
        date: { type: Date, default: Date.now }
    }],
    category: { type: String, enum: ['General', 'Mentorship', 'Success Story', 'Training'], default: 'General' }
}, { timestamps: true });

module.exports = mongoose.model('ForumPost', forumPostSchema);