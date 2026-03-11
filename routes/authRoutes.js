const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updateUserProfile } = require('../controllers/authorController');
const { protect } = require('../Middleware/authMiddleware');
const upload = require('../utils/fileUpload');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

// Wrap multer to make it optional and handle errors
router.put('/profile', protect, (req, res, next) => {
    upload.single('photo')(req, res, (err) => {
        if (err) {
            console.log('Multer error:', err);
            // Continue without file if there's an error
        }
        next();
    });
}, updateUserProfile);

module.exports = router;