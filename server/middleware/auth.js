const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'bugtracker_secret_key_change_in_production';

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Fresh DB lookup — catches status changes made after token was issued
        const user = await User.findById(decoded.userId).select('status role jobRole viewerExpiresAt lastLoginAt');
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        const now = new Date();
        const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

        // Auto-expire viewers past their viewerExpiresAt date
        if (user.jobRole === 'viewer' && user.viewerExpiresAt && user.viewerExpiresAt < now) {
            if (user.status !== 'expired') {
                user.status = 'expired';
                await user.save();
            }
            return res.status(401).json({ message: 'Viewer access has expired' });
        }

        // Auto-expire viewers who have not logged in for 30 days
        if (user.jobRole === 'viewer' && user.lastLoginAt && user.lastLoginAt < thirtyDaysAgo) {
            if (user.status !== 'expired') {
                user.status = 'expired';
                await user.save();
            }
            return res.status(401).json({ message: 'Viewer access expired due to inactivity' });
        }

        if (user.status !== 'active') {
            return res.status(403).json({ message: `Account is ${user.status}` });
        }

        req.user = { ...decoded, role: user.role, status: user.status };
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

const requireRole = (...roles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }
    next();
};

module.exports = { verifyToken, requireRole, JWT_SECRET };
