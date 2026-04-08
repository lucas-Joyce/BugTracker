const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name:        { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);
