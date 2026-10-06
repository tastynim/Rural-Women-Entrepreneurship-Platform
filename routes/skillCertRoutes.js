const express = require('express');
const router = express.Router();
const {
    listCertifications,
    uploadCertification,
    updateCertificationStatus,
    deleteCertification
} = require('../controllers/skillCertController');
const { protect, restrictTo } = require('../Middleware/authMiddleware');
const upload = require('../utils/fileUpload');

// GET /api/skill-certs — list certifications (own for users, all for admin)
router.get('/', protect, listCertifications);

// POST /api/skill-certs — upload a certification file
router.post(
    '/',
    protect,
    (req, res, next) => {
        upload.single('certificationFile')(req, res, (err) => {
            if (err) {
                return res.status(400).json({ message: err.message || 'File upload failed' });
            }
            next();
        });
    },
    uploadCertification
);

// PUT /api/skill-certs/:id/status — approve or reject (admin only)
router.put('/:id/status', protect, restrictTo('admin'), updateCertificationStatus);

// DELETE /api/skill-certs/:id — delete own certification
router.delete('/:id', protect, deleteCertification);

module.exports = router;
