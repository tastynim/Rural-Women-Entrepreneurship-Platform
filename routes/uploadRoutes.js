const express = require('express');
const router = express.Router();
const upload = require('../utils/fileUpload');

router.post('/upload', (req, res, next) => {
    console.log('upload route hit');
    upload.single('file')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message || 'File upload failed' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No file sent' });
        }
        res.json({ 
            message: 'File uploaded successfully',
            filename: req.file.filename, 
            path: req.file.path,
            size: req.file.size
        });
    });
});

module.exports = router;
