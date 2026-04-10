const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Project = require('../models/Project');
const Bug = require('../models/Bug');
const { JWT_SECRET } = require('../middleware/auth');

async function createOwner(overrides = {}) {
    return User.create({
        email: overrides.email || 'owner@test.com',
        username: overrides.username || 'testowner',
        password: overrides.password || 'Password123!',
        name: 'Test Owner',
        companyName: 'TestCo',
        jobTitle: 'Owner',
        role: 'owner',
        status: 'active',
        isVerified: true,
        ...overrides,
    });
}

async function createCustomer(overrides = {}) {
    return User.create({
        email: overrides.email || 'customer@test.com',
        username: overrides.username || 'testcustomer',
        password: overrides.password || 'Password123!',
        name: 'Test Customer',
        companyName: 'CustomerCo',
        jobTitle: 'Admin',
        role: 'customer',
        status: 'active',
        isVerified: true,
        ...overrides,
    });
}

async function createUser(managedBy, overrides = {}) {
    return User.create({
        email: overrides.email || 'user@test.com',
        username: overrides.username || 'testuser',
        password: overrides.password || 'Password123!',
        name: 'Test User',
        companyName: 'CustomerCo',
        jobTitle: 'Developer',
        role: 'user',
        jobRole: overrides.jobRole || 'coder',
        status: 'active',
        isVerified: true,
        managedBy: managedBy._id,
        ...overrides,
    });
}

async function createProject(owner, memberIds = [], overrides = {}) {
    return Project.create({
        name: overrides.name || 'Test Project',
        description: overrides.description || '',
        createdBy: owner._id,
        members: memberIds,
        ...overrides,
    });
}

async function createBug(project, creator, overrides = {}) {
    return Bug.create({
        title: overrides.title || 'Test Bug',
        description: overrides.description || 'A test bug description',
        severity: overrides.severity || 'Medium',
        priority: overrides.priority || 'Medium',
        bugType: overrides.bugType || 'Other',
        stepsToReproduce: overrides.stepsToReproduce || '1. Step one',
        actualResult: overrides.actualResult || 'Something broke',
        expectedResult: overrides.expectedResult || 'Should work',
        project: project._id,
        createdBy: creator._id,
        ...overrides,
    });
}

function tokenFor(user) {
    return jwt.sign(
        {
            userId: user._id,
            email: user.email,
            username: user.username,
            role: user.role,
            jobRole: user.jobRole || null,
        },
        JWT_SECRET,
        { expiresIn: '1h' }
    );
}

function authHeader(user) {
    return { Authorization: `Bearer ${tokenFor(user)}` };
}

module.exports = {
    createOwner,
    createCustomer,
    createUser,
    createProject,
    createBug,
    tokenFor,
    authHeader,
};
