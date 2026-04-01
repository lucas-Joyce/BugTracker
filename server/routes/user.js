const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Multer config — save to server/uploads/, only images allowed
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${req.user.userId}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed'));
        }
        cb(null, true);
    }
});

// GET /api/user/profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password -verificationToken -verificationExpires -resetPasswordToken -resetPasswordExpires');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/user/profile — update name, email, username, companyName, jobTitle
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const { name, email, username, companyName, jobTitle, nickname } = req.body;
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check email uniqueness if changed
        if (email && email.toLowerCase() !== user.email) {
            const exists = await User.findOne({ email: email.toLowerCase() });
            if (exists) return res.status(400).json({ message: 'Email already in use' });
            user.email = email.toLowerCase();
        }

        // Check username uniqueness if changed
        if (username && username !== user.username) {
            const exists = await User.findOne({ username });
            if (exists) return res.status(400).json({ message: 'Username already taken' });
            user.username = username;
        }

        if (name) user.name = name;
        if (companyName) user.companyName = companyName;
        if (jobTitle) user.jobTitle = jobTitle;
        if (nickname !== undefined) user.nickname = nickname;

        await user.save();
        res.json({
            message: 'Profile updated',
            user: { id: user._id, email: user.email, username: user.username, name: user.name }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/user/change-password
router.put('/change-password', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'New passwords do not match' });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        const user = await User.findById(req.user.userId);
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });

        user.password = newPassword;
        await user.save();
        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/user/photo — upload profile photo
router.post('/photo', verifyToken, upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const user = await User.findById(req.user.userId);

        // Delete old photo if exists
        if (user.profilePhoto) {
            const oldPath = path.join(__dirname, '../uploads', path.basename(user.profilePhoto));
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        user.profilePhoto = `/uploads/${req.file.filename}`;
        await user.save();

        res.json({ message: 'Photo updated', profilePhoto: user.profilePhoto });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/user/photo — remove profile photo
router.delete('/photo', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.profilePhoto) {
            const filePath = path.join(__dirname, '../uploads', path.basename(user.profilePhoto));
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            user.profilePhoto = null;
            await user.save();
        }

        res.json({ message: 'Photo removed' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
