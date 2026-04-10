require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const usersRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const ownerRoutes = require('./routes/owner');
const bugRoutes  = require('./routes/bugs');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Serve uploaded profile photos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
if (process.env.NODE_ENV !== 'test') {
    mongoose.connect('mongodb://localhost:27017/bugtracker')
        .then(() => console.log('MongoDB connected'))
        .catch(err => console.error('MongoDB error:', err));
}

// Public routes
app.use('/api/auth', authRoutes);

// Protected user/profile routes
app.use('/api/user', userRoutes);

// Owner management routes
app.use('/api/users', usersRoutes);

// Admin dashboard routes
app.use('/api/admin', adminRoutes);

// Owner-only routes
app.use('/api/owner', ownerRoutes);

// Bug routes (project-scoped)
app.use('/api/bugs', bugRoutes);

app.get('/', (_req, res) => {
    res.send('Bug tracker API');
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}

module.exports = app;
