const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema({
    token:     { type: String, required: true, unique: true },   // URL-safe random hex
    code:      { type: String, required: true },                 // display code e.g. #gary3a9f2cuser1
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jobRole:   { type: String, enum: ['coder', 'tester', 'viewer'], required: true },
    toEmail:   { type: String, default: null },
    used:      { type: Boolean, default: false },
    usedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invite', inviteSchema);
