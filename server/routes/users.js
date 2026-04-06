const express = require('express');
const User = require('../models/User');
const { verifyToken, requireRole } = require('../middleware/auth');
const { sendActivationEmail } = require('../config/email');

const router = express.Router();

const CODER_CAP = 5;
const TESTER_CAP = 5;
const VIEWER_CAP = 10;
const VIEWER_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// PATCH /api/users/:id/status — customer activates or revokes a user
router.patch('/:id/status', verifyToken, requireRole('owner', 'customer'), async (req, res) => {
    try {
        const { status } = req.body;

        if (!['active', 'revoked'].includes(status)) {
            return res.status(400).json({ message: 'status must be "active" or "revoked"' });
        }

        const target = await User.findById(req.params.id);
        if (!target) return res.status(404).json({ message: 'User not found' });

        if (['owner', 'customer'].includes(target.role)) {
            return res.status(403).json({ message: 'Cannot manage another owner or customer' });
        }

        // Prevent taking over a user already managed by a different customer
        const customerId = req.user.userId;
        if (target.managedBy && target.managedBy.toString() !== customerId) {
            return res.status(403).json({ message: 'User is managed by a different customer' });
        }

        if (status === 'active') {
            if (target.role === 'user' && target.jobRole === 'coder') {
                const count = await User.countDocuments({
                    managedBy: customerId,
                    role: 'user',
                    jobRole: 'coder',
                    status: 'active'
                });
                if (count >= CODER_CAP) {
                    return res.status(400).json({ message: `Coder limit reached (max ${CODER_CAP})` });
                }
            }

            if (target.role === 'user' && target.jobRole === 'tester') {
                const count = await User.countDocuments({
                    managedBy: customerId,
                    role: 'user',
                    jobRole: 'tester',
                    status: 'active'
                });
                if (count >= TESTER_CAP) {
                    return res.status(400).json({ message: `Tester limit reached (max ${TESTER_CAP})` });
                }
            }

            if (target.role === 'user' && target.jobRole === 'viewer') {
                const count = await User.countDocuments({
                    managedBy: customerId,
                    role: 'user',
                    jobRole: 'viewer',
                    status: 'active'
                });
                if (count >= VIEWER_CAP) {
                    return res.status(400).json({ message: `Viewer limit reached (max ${VIEWER_CAP})` });
                }
                target.viewerExpiresAt = new Date(Date.now() + VIEWER_TTL_MS);
            }

            target.managedBy = customerId;
        }

        target.status = status;
        await target.save();

        if (status === 'active') {
            sendActivationEmail(target.email, target.username).catch(err =>
                console.error('Activation email failed:', err.message)
            );
        }

        res.json({
            message: `User ${status}`,
            user: {
                id: target._id,
                username: target.username,
                role: target.role,
                jobRole: target.jobRole,
                status: target.status,
                viewerExpiresAt: target.viewerExpiresAt
            }
        });
    } catch (err) {
        console.error('Patch status error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/users — customer lists users they manage (+ pending unassigned)
router.get('/', verifyToken, requireRole('owner', 'customer'), async (req, res) => {
    try {
        const customerId = req.user.userId;
        const users = await User.find({
            $or: [
                { managedBy: customerId },
                { status: 'pending', managedBy: null, role: 'user' }
            ]
        }).select('-password -verificationToken -verificationExpires -resetPasswordToken -resetPasswordExpires');

        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
