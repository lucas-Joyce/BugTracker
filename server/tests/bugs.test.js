const request = require('supertest');
const app = require('../app');
const { connect, disconnect, clearCollections } = require('./setup');
const { createCustomer, createUser, createProject, createBug, authHeader } = require('./helpers');

jest.mock('../config/email', () => ({
    sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
    sendOwnerNotification: jest.fn().mockResolvedValue(undefined),
    sendActivationEmail: jest.fn().mockResolvedValue(undefined),
    sendInviteEmail: jest.fn().mockResolvedValue(undefined),
    sendPendingReminderEmail: jest.fn().mockResolvedValue(undefined),
}));

beforeAll(() => connect());
afterAll(() => disconnect());
afterEach(() => clearCollections());

let customer, member, outsider, project;

beforeEach(async () => {
    customer = await createCustomer({ email: 'cust@test.com', username: 'custuser' });
    member   = await createUser(customer, { email: 'member@test.com', username: 'memberuser' });
    outsider = await createUser(customer, { email: 'out@test.com',    username: 'outsider' });
    project  = await createProject(customer, [member._id]);
});

describe('GET /api/bugs', () => {
    it('returns bugs for a project member', async () => {
        await createBug(project, member);
        const res = await request(app)
            .get(`/api/bugs?project=${project._id}`)
            .set(authHeader(member));
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].title).toBe('Test Bug');
    });

    it('returns bugs for the project owner (customer)', async () => {
        await createBug(project, customer);
        const res = await request(app)
            .get(`/api/bugs?project=${project._id}`)
            .set(authHeader(customer));
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
    });

    it('returns 403 for a non-member', async () => {
        const res = await request(app)
            .get(`/api/bugs?project=${project._id}`)
            .set(authHeader(outsider));
        expect(res.status).toBe(403);
    });

    it('returns 400 without project param', async () => {
        const res = await request(app)
            .get('/api/bugs')
            .set(authHeader(member));
        expect(res.status).toBe(400);
    });

    it('returns 401 without a token', async () => {
        const res = await request(app).get(`/api/bugs?project=${project._id}`);
        expect(res.status).toBe(401);
    });
});

describe('POST /api/bugs', () => {
    const validBug = {
        title: 'Login fails',
        description: 'Cannot log in with correct credentials',
        severity: 'High',
        priority: 'High',
        bugType: 'Functionality',
        stepsToReproduce: '1. Go to login\n2. Enter credentials\n3. Click submit',
        actualResult: 'Error message shown',
        expectedResult: 'Should log in successfully',
    };

    it('creates a bug and returns populated createdBy', async () => {
        const res = await request(app)
            .post('/api/bugs')
            .set(authHeader(member))
            .send({ ...validBug, project: project._id });
        expect(res.status).toBe(201);
        expect(res.body.title).toBe('Login fails');
        expect(res.body.createdBy).toHaveProperty('username', 'memberuser');
        expect(res.body).toHaveProperty('createdAt');
    });

    it('rejects missing required fields with 400', async () => {
        const res = await request(app)
            .post('/api/bugs')
            .set(authHeader(member))
            .send({ title: 'Only title', project: project._id });
        expect(res.status).toBe(400);
    });

    it('returns 403 for non-member trying to create a bug', async () => {
        const res = await request(app)
            .post('/api/bugs')
            .set(authHeader(outsider))
            .send({ ...validBug, project: project._id });
        expect(res.status).toBe(403);
    });
});

describe('PUT /api/bugs/:id', () => {
    it('updates an existing bug', async () => {
        const bug = await createBug(project, member);
        const res = await request(app)
            .put(`/api/bugs/${bug._id}`)
            .set(authHeader(member))
            .send({ status: 'In Progress', title: 'Updated title' });
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('In Progress');
        expect(res.body.title).toBe('Updated title');
    });

    it('returns 404 for unknown bug id', async () => {
        const fakeId = '64a1b2c3d4e5f6a7b8c9d0e1';
        const res = await request(app)
            .put(`/api/bugs/${fakeId}`)
            .set(authHeader(member))
            .send({ title: 'x' });
        expect(res.status).toBe(404);
    });
});

describe('DELETE /api/bugs/:id', () => {
    it('deletes a bug', async () => {
        const bug = await createBug(project, member);
        const res = await request(app)
            .delete(`/api/bugs/${bug._id}`)
            .set(authHeader(member));
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/deleted/i);
    });

    it('returns 403 if requester has no access to the project', async () => {
        const bug = await createBug(project, member);
        const res = await request(app)
            .delete(`/api/bugs/${bug._id}`)
            .set(authHeader(outsider));
        expect(res.status).toBe(403);
    });
});
