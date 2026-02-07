const express = require('express');
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const port = 5000;

// middleware

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/bugtracker').then(() => console.log('MongoDB connected')).catch(err => console.error('MongoDB error:', err));

// Bug schema
const bugSchema = new mongoose.Schema({
    title: { type: String, required: true },
    status: { type: String, default: 'Open' },
    priority: { type: String, default: 'Medium' },
    createdAt: { type: Date, default: Date.now }
});

const Bug = mongoose.model('Bug', bugSchema);

app.get('/', (req, res) => {
    res.send('Bug tracker API');
});

app.get('/api/bugs', async (req, res) => {
    const bugs = await Bug.find();
    res.json(bugs);
});

app.post('/api/bugs', async (req, res) => {
    const bug = new Bug(req.body);
    await bug.save();
    res.status(201).json(bug);
});

app.listen(port, () => {
    console.log(`server is running on http://localhost:${port}`); 
});