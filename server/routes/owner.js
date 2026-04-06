const express = require('express');
const User = require('../models/User');
const { verifyToken, requireRole } = require('../middleware/auth');
const { sendActivationEmail, sendPendingReminderEmail } = require('../config/email');

const router = express.Router();

// GET /api/owner/customers — all customers + global user stats
router.get('/customers', verifyToken, requireRole('owner'), async (req, res) => {
    try {
        const customers = await User.find({ role: 'customer', isVerified: true })
            .select('-password -verificationToken -verificationExpires -resetPasswordToken -resetPasswordExpires')
            .sort({ createdAt: -1 });

        // Global counts across all customers (pending + active count toward slots)
        const allUsers = await User.find({
            role: 'user',
            status: { $in: ['active', 'pending'] }
        }).select('jobRole');

        const stats = {
            coders:  allUsers.filter(u => u.jobRole === 'coder').length,
            testers: allUsers.filter(u => u.jobRole === 'tester').length,
            viewers: allUsers.filter(u => u.jobRole === 'viewer').length,
            total:   allUsers.length,
        };

        res.json({ customers, stats });
    } catch (err) {
        console.error('Owner get customers error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH /api/owner/customers/:id/status — approve or revoke a customer
router.patch('/customers/:id/status', verifyToken, requireRole('owner'), async (req, res) => {
    try {
        const { status } = req.body;
        if (!['active', 'revoked'].includes(status)) {
            return res.status(400).json({ message: 'status must be "active" or "revoked"' });
        }

        const target = await User.findById(req.params.id);
        if (!target) return res.status(404).json({ message: 'User not found' });
        if (target.role !== 'customer') {
            return res.status(403).json({ message: 'This route only manages customer accounts' });
        }

        target.status = status;
        await target.save();

        if (status === 'active') {
            sendActivationEmail(target.email, target.username).catch(err =>
                console.error('Activation email failed:', err.message)
            );
        }

        res.json({
            message: `Customer ${status}`,
            customer: {
                id: target._id,
                username: target.username,
                email: target.email,
                status: target.status,
            }
        });
    } catch (err) {
        console.error('Owner patch customer status error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/owner/customers/:id/remind — send "under review" email to a pending customer
router.post('/customers/:id/remind', verifyToken, requireRole('owner'), async (req, res) => {
    try {
        const target = await User.findById(req.params.id);
        if (!target) return res.status(404).json({ message: 'User not found' });
        if (target.role !== 'customer') {
            return res.status(403).json({ message: 'This route only manages customer accounts' });
        }
        if (target.status !== 'pending') {
            return res.status(400).json({ message: 'Reminder only applies to pending customers' });
        }

        sendPendingReminderEmail(target.email, target.username).catch(err =>
            console.error('Pending reminder email failed:', err.message)
        );

        res.json({ message: 'Reminder sent' });
    } catch (err) {
        console.error('Owner remind customer error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
