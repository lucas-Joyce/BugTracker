const request = require('supertest');
const app = require('../app');
const { connect, disconnect, clearCollections } = require('./setup');
const { createCustomer, createUser, createProject, authHeader } = require('./helpers');

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

describe('POST /api/admin/invite', () => {
    it('creates an invited user and returns invite details', async () => {
        const customer = await createCustomer();
        const res = await request(app)
            .post('/api/admin/invite')
            .set(authHeader(customer))
            .send({ jobRole: 'coder', email: 'invited@test.com' });
        expect(res.status).toBe(201);
        expect(res.body.invite.email).toBe('invited@test.com');
        expect(res.body.invite.jobRole).toBe('coder');
        expect(res.body.invite).toHaveProperty('code');
    });

    it('rejects invalid jobRole with 400', async () => {
        const customer = await createCustomer();
        const res = await request(app)
            .post('/api/admin/invite')
            .set(authHeader(customer))
            .send({ jobRole: 'admin', email: 'x@test.com' });
        expect(res.status).toBe(400);
    });

    it('returns 403 for a non-admin user', async () => {
        const customer = await createCustomer();
        const user = await createUser(customer, { email: 'u@test.com', username: 'regularuser' });
        const res = await request(app)
            .post('/api/admin/invite')
            .set(authHeader(user))
            .send({ jobRole: 'coder', email: 'new@test.com' });
        expect(res.status).toBe(403);
    });
});

describe('GET /api/admin/users', () => {
    it('returns managed users and slot stats', async () => {
        const customer = await createCustomer();
        await createUser(customer, { email: 'c1@test.com', username: 'coder1', jobRole: 'coder' });
        await createUser(customer, { email: 't1@test.com', username: 'tester1', jobRole: 'tester' });

        const res = await request(app)
            .get('/api/admin/users')
            .set(authHeader(customer));
        expect(res.status).toBe(200);
        expect(res.body.users).toHaveLength(2);
        expect(res.body.stats.coders.used).toBe(1);
        expect(res.body.stats.testers.used).toBe(1);
    });
});

describe('POST /api/admin/projects', () => {
    it('creates a project', async () => {
        const customer = await createCustomer();
        const res = await request(app)
            .post('/api/admin/projects')
            .set(authHeader(customer))
            .send({ name: 'Alpha Project', description: 'First project' });
        expect(res.status).toBe(201);
        expect(res.body.project.name).toBe('Alpha Project');
        expect(String(res.body.project.createdBy)).toBe(String(customer._id));
    });

    it('rejects missing project name with 400', async () => {
        const customer = await createCustomer();
        const res = await request(app)
            .post('/api/admin/projects')
            .set(authHeader(customer))
            .send({ description: 'No name provided' });
        expect(res.status).toBe(400);
    });
});

describe('PATCH /api/admin/projects/:id', () => {
    it('updates project name and members', async () => {
        const customer = await createCustomer();
        const member = await createUser(customer, { email: 'm@test.com', username: 'pmember' });
        const project = await createProject(customer);

        const res = await request(app)
            .patch(`/api/admin/projects/${project._id}`)
            .set(authHeader(customer))
            .send({ name: 'Renamed Project', members: [member._id] });
        expect(res.status).toBe(200);
        expect(res.body.project.name).toBe('Renamed Project');
        expect(res.body.project.members).toHaveLength(1);
    });

    it('returns 404 for a project not owned by this customer', async () => {
        const customer = await createCustomer();
        const other    = await createCustomer({ email: 'other@test.com', username: 'other' });
        const project  = await createProject(other);

        const res = await request(app)
            .patch(`/api/admin/projects/${project._id}`)
            .set(authHeader(customer))
            .send({ name: 'Hijacked' });
        expect(res.status).toBe(404);
    });
});
