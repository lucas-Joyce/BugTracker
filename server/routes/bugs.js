const express = require('express');
const Bug     = require('../models/Bug');
const Project = require('../models/Project');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Returns the project if the requesting user is its owner or a deployed member.
// Returns null if not found or access denied.
async function getAccessibleProject(projectId, userId) {
    const project = await Project.findById(projectId);
    if (!project) return null;
    const isOwner  = project.createdBy.toString() === userId;
    const isMember = project.members.some(m => m.toString() === userId);
    return (isOwner || isMember) ? project : null;
}

// GET /api/bugs?project=:id
router.get('/', verifyToken, async (req, res) => {
    try {
        const { project: projectId } = req.query;
        if (!projectId) return res.status(400).json({ message: 'project query param required' });

        const project = await getAccessibleProject(projectId, req.user.userId);
        if (!project) return res.status(403).json({ message: 'Access denied' });

        const bugs = await Bug.find({ project: projectId })
            .populate('createdBy', 'nickname name username')
            .sort({ createdAt: -1 });
        res.json(bugs);
    } catch (err) {
        console.error('Get bugs error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/bugs
router.post('/', verifyToken, async (req, res) => {
    try {
        const {
            title, description, severity, priority, bugType,
            stepsToReproduce, actualResult, expectedResult,
            project: projectId
        } = req.body;

        if (!projectId) return res.status(400).json({ message: 'project is required' });
        if (!title || !description || !stepsToReproduce || !actualResult || !expectedResult) {
            return res.status(400).json({ message: 'title, description, steps, actual result and expected result are required' });
        }

        const project = await getAccessibleProject(projectId, req.user.userId);
        if (!project) return res.status(403).json({ message: 'Access denied' });

        const bug = await Bug.create({
            title, description, severity, priority, bugType,
            stepsToReproduce, actualResult, expectedResult,
            project:   projectId,
            createdBy: req.user.userId
        });

        const populated = await Bug.findById(bug._id).populate('createdBy', 'nickname name username');
        res.status(201).json(populated);
    } catch (err) {
        console.error('Create bug error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/bugs/:id
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const bug = await Bug.findById(req.params.id);
        if (!bug) return res.status(404).json({ message: 'Bug not found' });

        const project = await getAccessibleProject(bug.project.toString(), req.user.userId);
        if (!project) return res.status(403).json({ message: 'Access denied' });

        // Prevent overwriting immutable fields
        const { project: _p, createdBy: _c, createdAt: _ca, ...updates } = req.body;
        updates.updatedAt = new Date();

        const updated = await Bug.findByIdAndUpdate(req.params.id, updates, { new: true })
            .populate('createdBy', 'nickname name username');
        res.json(updated);
    } catch (err) {
        console.error('Update bug error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/bugs/:id
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const bug = await Bug.findById(req.params.id);
        if (!bug) return res.status(404).json({ message: 'Bug not found' });

        const project = await getAccessibleProject(bug.project.toString(), req.user.userId);
        if (!project) return res.status(403).json({ message: 'Access denied' });

        await Bug.findByIdAndDelete(req.params.id);
        res.json({ message: 'Bug deleted' });
    } catch (err) {
        console.error('Delete bug error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
