const express = require('express');
const router = express.Router();
const {
    listMentors,
    sendRequest,
    listMyRequests,
    listIncomingRequests,
    updateRequestStatus
} = require('../controllers/mentorController');
const { protect } = require('../Middleware/authMiddleware');

// GET /api/mentorship/mentors — list all entrepreneurs (public)
router.get('/mentors', listMentors);

// POST /api/mentorship/request — send a mentorship request (auth)
router.post('/request', protect, sendRequest);

// GET /api/mentorship/my-requests — view sent requests (auth)
router.get('/my-requests', protect, listMyRequests);

// GET /api/mentorship/incoming — view incoming requests (auth, entrepreneurs)
router.get('/incoming', protect, listIncomingRequests);

// PUT /api/mentorship/request/:id/status — accept or reject a request (auth, mentor)
router.put('/request/:id/status', protect, updateRequestStatus);

module.exports = router;
