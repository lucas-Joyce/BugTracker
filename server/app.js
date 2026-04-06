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
const { verifyToken } = require('./middleware/auth');

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
mongoose.connect('mongodb://localhost:27017/bugtracker')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB error:', err));

// Bug schema
const bugSchema = new mongoose.Schema({
    title: { type: String, required: true },
    status: { type: String, default: 'Open' },
    priority: { type: String, default: 'Medium' },
    createdAt: { type: Date, default: Date.now }
});

const Bug = mongoose.model('Bug', bugSchema);

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

app.get('/', (_req, res) => {
    res.send('Bug tracker API');
});

// Protected bug routes
app.get('/api/bugs', verifyToken, async (_req, res) => {
    const bugs = await Bug.find();
    res.json(bugs);
});

app.post('/api/bugs', verifyToken, async (req, res) => {
    const bug = new Bug(req.body);
    await bug.save();
    res.status(201).json(bug);
});

app.put('/api/bugs/:id', verifyToken, async (req, res) => {
    const bug = await Bug.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(bug);
});

app.delete('/api/bugs/:id', verifyToken, async (req, res) => {
    await Bug.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bug deleted' });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
