const mongoose = require('mongoose');

const bugSchema = new mongoose.Schema({
    title:            { type: String, required: true, trim: true },
    description:      { type: String, required: true, trim: true },
    severity:         { type: String, default: 'Medium',        enum: ['Low', 'Medium', 'High', 'Critical'] },
    priority:         { type: String, default: 'Medium',        enum: ['Low', 'Medium', 'High'] },
    bugType:          { type: String, default: 'Other',         enum: ['UI', 'Functionality', 'Performance', 'Security', 'Other'] },
    status:           { type: String, default: 'Open',          enum: ['Open', 'In Progress', 'Closed'] },
    stepsToReproduce: { type: String, required: true, trim: true },
    actualResult:     { type: String, required: true, trim: true },
    expectedResult:   { type: String, required: true, trim: true },
    project:          { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    createdBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

module.exports = mongoose.model('Bug', bugSchema);