// controllers/mentorController.js — Mentorship Request System
const Mentorship = require('../models/Mentorship');
const User = require('../models/User');

// List all entrepreneurs who can act as mentors
const listMentors = async (req, res) => {
    try {
        const mentors = await User.find(
            { role: 'entrepreneur' },
            'name email location skills photo'
        ).sort({ name: 1 });
        res.json(mentors);
    } catch (err) {
        console.error('listMentors error', err);
        res.status(500).json({ message: 'Failed to fetch mentors' });
    }
};

// Mentee sends a mentorship request
const sendRequest = async (req, res) => {
    try {
        const { mentorId, message } = req.body;
        if (!mentorId) return res.status(400).json({ message: 'mentorId is required' });

        const mentor = await User.findById(mentorId);
        if (!mentor) return res.status(404).json({ message: 'Mentor not found' });

        // Prevent duplicate pending requests
        const existing = await Mentorship.findOne({
            mentor: mentorId,
            mentee: req.user.id,
            status: 'Pending'
        });
        if (existing) {
            return res.status(400).json({ message: 'A pending request to this mentor already exists' });
        }

        const mentorship = new Mentorship({
            mentor: mentorId,
            mentee: req.user.id,
            message: message || ''
        });
        await mentorship.save();
        res.status(201).json({ message: 'Mentorship request sent successfully', mentorship });
    } catch (err) {
        console.error('sendRequest error', err);
        res.status(500).json({ message: 'Failed to send request' });
    }
};

// Mentee views their own sent requests
const listMyRequests = async (req, res) => {
    try {
        const requests = await Mentorship.find({ mentee: req.user.id })
            .populate('mentor', 'name email location skills photo')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        console.error('listMyRequests error', err);
        res.status(500).json({ message: 'Failed to fetch your requests' });
    }
};

// Mentor views incoming requests directed at them
const listIncomingRequests = async (req, res) => {
    try {
        const requests = await Mentorship.find({ mentor: req.user.id })
            .populate('mentee', 'name email location skills photo')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        console.error('listIncomingRequests error', err);
        res.status(500).json({ message: 'Failed to fetch incoming requests' });
    }
};

// Mentor accepts or rejects a request
const updateRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Accepted', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'status must be Accepted or Rejected' });
        }

        // Only the mentor who owns this request can update it
        const mentorship = await Mentorship.findOneAndUpdate(
            { _id: req.params.id, mentor: req.user.id },
            { status },
            { new: true }
        ).populate('mentee', 'name email');

        if (!mentorship) {
            return res.status(404).json({ message: 'Request not found or you are not authorized' });
        }

        res.json({ message: `Request ${status} successfully`, mentorship });
    } catch (err) {
        console.error('updateRequestStatus error', err);
        res.status(500).json({ message: 'Failed to update request status' });
    }
};

module.exports = {
    listMentors,
    sendRequest,
    listMyRequests,
    listIncomingRequests,
    updateRequestStatus
};
