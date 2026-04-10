const mongoose = require('mongoose');

const bugSchema = new mongoose.Schema({
    title:     { type: String, required: true, trim: true },
    status:    { type: String, default: 'Open',   enum: ['Open', 'In Progress', 'Closed'] },
    priority:  { type: String, default: 'Medium', enum: ['Low', 'Medium', 'High'] },
    project:   { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bug', bugSchema);
