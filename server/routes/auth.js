const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../config/email');

const router = express.Router();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, username, password, confirmPassword, name, companyName, jobTitle } = req.body;

        if (!email || !username || !password || !confirmPassword || !name || !companyName || !jobTitle) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email address' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        const existingEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

        const user = new User({
            email,
            username,
            password,
            name,
            companyName,
            jobTitle,
            isVerified: false,
            verificationToken,
            verificationExpires
        });
        await user.save();

        try {
            await sendVerificationEmail(email, verificationToken);
        } catch (emailErr) {
            console.error('Failed to send verification email:', emailErr.message);
            return res.status(500).json({
                message: 'Account created but we could not send the verification email. Check your SMTP settings.'
            });
        }

        res.status(201).json({
            message: 'Registration successful. Please check your email to verify your account.'
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify email (GET — from link in email)
router.get('/verify-email/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            verificationToken: req.params.token,
            verificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.redirect(`${process.env.CLIENT_URL}?verified=false`);
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationExpires = undefined;
        await user.save();

        res.redirect(`${process.env.CLIENT_URL}?verified=true`);
    } catch (err) {
        console.error('Verify email error:', err);
        res.redirect(`${process.env.CLIENT_URL}?verified=false`);
    }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email: email.toLowerCase(), isVerified: false });

        if (user) {
            const verificationToken = crypto.randomBytes(32).toString('hex');
            user.verificationToken = verificationToken;
            user.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
            await user.save();
            await sendVerificationEmail(email, verificationToken);
        }

        // Generic response — don't reveal if email exists
        res.json({ message: 'If an unverified account exists, a new verification email has been sent.' });
    } catch (err) {
        console.error('Resend verification error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Allow login with email or username
        const user = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { username: email }
            ]
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(401).json({
                message: 'Please verify your email before logging in.',
                unverified: true
            });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, username: user.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: { id: user._id, email: user.email, username: user.username, name: user.name }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Forgot password — sends reset email
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
            const resetToken = crypto.randomBytes(32).toString('hex');
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
            await user.save();
            await sendPasswordResetEmail(email, resetToken);
        }

        // Generic response — don't reveal if account exists
        res.json({ message: 'If an account exists with this email, you will receive reset instructions.' });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Reset password — saves new password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password, confirmPassword } = req.body;

        if (!token || !password || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Reset link is invalid or has expired.' });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successful. You can now sign in.' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Check username availability
router.get('/check-username/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        res.json({ available: !user });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
