const mongoose = require('mongoose');

const successStorySchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    images: [{ type: String }],
    entrepreneur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isApproved: { type: Boolean, default: false } // Admin approval
}, { timestamps: true });

module.exports = mongoose.model('SuccessStory', successStorySchema);