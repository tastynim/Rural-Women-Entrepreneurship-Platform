const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updateUserProfile } = require('../controllers/authorController');
const { protect } = require('../Middleware/authMiddleware');
const upload = require('../utils/fileUpload');
const User = require('../models/User');

// Public: tells the Register page whether any users exist yet
router.get('/has-users', async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ hasUsers: count > 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

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