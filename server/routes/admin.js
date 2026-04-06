const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');
const { verifyToken, requireRole } = require('../middleware/auth');
const { sendActivationEmail, sendInviteEmail } = require('../config/email');

const router = express.Router();

const CODER_CAP = 5;
const TESTER_CAP = 5;
const VIEWER_CAP = 10;
const VIEWER_TTL_MS = 30 * 24 * 60 * 60 * 1000;

// Generate a unique username derived from an email address
async function generateUsername(email) {
    const base = email.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 15) || 'user';
    let username = base;
    let n = 1;
    while (await User.findOne({ username })) {
        username = `${base}${n++}`;
    }
    return username;
}

// POST /api/admin/invite — create user account with temp password, send invite email
router.post('/invite', verifyToken, requireRole('owner', 'customer'), async (req, res) => {
    try {
        const { jobRole, email } = req.body;

        if (!['coder', 'tester', 'viewer'].includes(jobRole)) {
            return res.status(400).json({ message: 'jobRole must be coder, tester, or viewer' });
        }
        if (!email) {
            return res.status(400).json({ message: 'Email address is required to send an invite' });
        }

        const existingEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingEmail) {
            return res.status(400).json({ message: 'An account with this email already exists' });
        }

        const customerId = req.user.userId;

        // Cap check
        const cap = jobRole === 'coder' ? CODER_CAP : jobRole === 'tester' ? TESTER_CAP : VIEWER_CAP;
        const used = await User.countDocuments({
            managedBy: customerId,
            role: 'user',
            jobRole,
            status: { $in: ['active', 'pending'] }
        });
        if (used >= cap) {
            return res.status(400).json({ message: `${jobRole} limit reached (max ${cap})` });
        }

        // Build display code: #usernameprefix + random6hex + user + count
        const customer = await User.findById(customerId).select('username');
        const prefix = customer.username.slice(0, 6).toLowerCase().replace(/[^a-z0-9]/g, '');
        const rand = crypto.randomBytes(3).toString('hex');
        const userCount = (await User.countDocuments({ managedBy: customerId, role: 'user' })) + 1;
        const code = `#${prefix}${rand}user${userCount}`;

        const username = await generateUsername(email);

        const newUser = await User.create({
            email: email.toLowerCase(),
            username,
            password: code,           // pre-save hook hashes this
            name: '',
            companyName: '',
            jobTitle: '',
            role: 'user',
            jobRole,
            managedBy: customerId,
            status: 'active',
            isVerified: true,
            mustChangePassword: true,
            ...(jobRole === 'viewer' ? { viewerExpiresAt: new Date(Date.now() + VIEWER_TTL_MS) } : {})
        });

        sendInviteEmail(email, code, jobRole).catch(err =>
            console.error('Invite email failed:', err.message)
        );

        res.status(201).json({
            message: 'Invite sent',
            invite: {
                code,
                email,
                jobRole,
                username: newUser.username
            }
        });
    } catch (err) {
        console.error('Create invite error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/admin/users — all managed users + slot stats
router.get('/users', verifyToken, requireRole('owner', 'customer'), async (req, res) => {
    try {
        const customerId = req.user.userId;

        const users = await User.find({
            $or: [
                { managedBy: customerId },
                { status: 'pending', managedBy: null, role: 'user' }
            ]
        }).select('-password -verificationToken -verificationExpires -resetPasswordToken -resetPasswordExpires')
          .sort({ createdAt: -1 });

        // Pending and active count toward slots; revoked/expired do not
        const codersUsed = users.filter(u =>
            u.role === 'user' && u.jobRole === 'coder' &&
            ['active', 'pending'].includes(u.status)
        ).length;

        const testersUsed = users.filter(u =>
            u.role === 'user' && u.jobRole === 'tester' &&
            ['active', 'pending'].includes(u.status)
        ).length;

        const viewersUsed = users.filter(u =>
            u.role === 'user' && u.jobRole === 'viewer' &&
            ['active', 'pending'].includes(u.status)
        ).length;

        res.json({
            users,
            stats: {
                coders:  { used: codersUsed,  max: CODER_CAP },
                testers: { used: testersUsed, max: TESTER_CAP },
                viewers: { used: viewersUsed, max: VIEWER_CAP },
            }
        });
    } catch (err) {
        console.error('Admin get users error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH /api/admin/users/:id/status — activate or revoke
router.patch('/users/:id/status', verifyToken, requireRole('owner', 'customer'), async (req, res) => {
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
                email: target.email,
                role: target.role,
                jobRole: target.jobRole,
                status: target.status,
                viewerExpiresAt: target.viewerExpiresAt,
            }
        });
    } catch (err) {
        console.error('Admin patch status error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/admin/users/:id — hard delete
router.delete('/users/:id', verifyToken, requireRole('owner', 'customer'), async (req, res) => {
    try {
        const target = await User.findById(req.params.id);
        if (!target) return res.status(404).json({ message: 'User not found' });
        if (['owner', 'customer'].includes(target.role)) {
            return res.status(403).json({ message: 'Cannot delete an owner or customer' });
        }
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (err) {
        console.error('Admin delete user error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
