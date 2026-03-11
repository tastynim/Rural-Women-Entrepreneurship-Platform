const mongoose = require('mongoose');

const mentorshipSchema = new mongoose.Schema({
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mentee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
    message: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Mentorship', mentorshipSchema);