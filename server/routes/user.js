const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Project = require('../models/Project');
const { verifyToken } = require('../middleware/auth');
const { sendExtensionRequestEmail } = require('../config/email');

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
        const user = await User.findById(req.user.userId)
            .select('-password -verificationToken -verificationExpires -resetPasswordToken -resetPasswordExpires')
            .populate('managedBy', 'companyName');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const profile = user.toObject();
        // For regular users always reflect the managing customer's company name
        if (user.role === 'user' && user.managedBy?.companyName) {
            profile.companyName = user.managedBy.companyName;
        }
        // Don't leak the full managedBy object — just keep the id
        if (profile.managedBy) profile.managedBy = user.managedBy._id;

        res.json(profile);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/user/profile — update name, email, username, companyName, jobTitle
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const { name, email, username, companyName, jobTitle, nickname, mobileNumber } = req.body;
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
        if (mobileNumber !== undefined) user.mobileNumber = mobileNumber;

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

// POST /api/user/set-password — forced password change on first login
router.post('/set-password', verifyToken, async (req, res) => {
    try {
        const { password, confirmPassword } = req.body;
        if (!password || !confirmPassword) {
            return res.status(400).json({ message: 'Both fields are required' });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!user.mustChangePassword) {
            return res.status(403).json({ message: 'No password change required' });
        }

        user.password = password;
        user.mustChangePassword = false;
        await user.save();

        res.json({ message: 'Password updated. You can now use the app.' });
    } catch (err) {
        console.error('Set password error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/user/projects — projects this user is deployed into (role=user only)
router.get('/projects', verifyToken, async (req, res) => {
    try {
        const projects = await Project.find({ members: req.user.userId })
            .populate('members', 'name username jobRole status')
            .sort({ createdAt: -1 });
        res.json({ projects });
    } catch (err) {
        console.error('Get user projects error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/user/request-extension — viewer requests more time from their customer
router.post('/request-extension', verifyToken, async (req, res) => {
    try {
        const viewer = await User.findById(req.user.userId).select('jobRole managedBy username status');
        if (!viewer) return res.status(404).json({ message: 'User not found' });
        if (viewer.jobRole !== 'viewer') {
            return res.status(403).json({ message: 'Only viewers can request an extension' });
        }
        if (!viewer.managedBy) {
            return res.status(400).json({ message: 'No managing customer found for your account' });
        }

        const customer = await User.findById(viewer.managedBy).select('email');
        if (!customer) return res.status(404).json({ message: 'Managing customer not found' });

        sendExtensionRequestEmail(customer.email, viewer.username).catch(err =>
            console.error('Extension request email failed:', err.message)
        );

        res.json({ message: 'Extension request sent to your account manager.' });
    } catch (err) {
        console.error('Request extension error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
