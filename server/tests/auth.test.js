const request = require('supertest');
const app = require('../app');
const { connect, disconnect, clearCollections } = require('./setup');
const { createCustomer } = require('./helpers');

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

describe('POST /api/auth/register', () => {
    const valid = {
        email: 'new@example.com',
        username: 'newuser',
        password: 'Password1!',
        confirmPassword: 'Password1!',
        name: 'New User',
        companyName: 'Acme',
        jobTitle: 'Dev',
    };

    it('registers a new customer and returns 201', async () => {
        const res = await request(app).post('/api/auth/register').send(valid);
        expect(res.status).toBe(201);
        expect(res.body.message).toMatch(/verify/i);
    });

    it('rejects duplicate email with 400', async () => {
        await request(app).post('/api/auth/register').send(valid);
        const res = await request(app).post('/api/auth/register').send(valid);
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/already registered/i);
    });

    it('rejects missing fields with 400', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'x@x.com', password: 'Password1!' });
        expect(res.status).toBe(400);
    });

    it('rejects mismatched passwords with 400', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ ...valid, confirmPassword: 'Different1!' });
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/do not match/i);
    });
});

describe('POST /api/auth/login', () => {
    beforeEach(async () => {
        await createCustomer({ email: 'login@test.com', username: 'loginuser', password: 'Password1!' });
    });

    it('logs in with username and returns token', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'loginuser', password: 'Password1!' });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user.username).toBe('loginuser');
    });

    it('logs in with full email address', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'login@test.com', password: 'Password1!' });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
    });

    it('rejects wrong password with 401', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'loginuser', password: 'WrongPass!' });
        expect(res.status).toBe(401);
    });

    it('rejects unknown user with 401', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'nobody', password: 'Password1!' });
        expect(res.status).toBe(401);
    });
});

describe('POST /api/auth/forgot-password', () => {
    it('returns generic 200 for any email (no info leak)', async () => {
        const res = await request(app)
            .post('/api/auth/forgot-password')
            .send({ email: 'anyone@example.com' });
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/if an account exists/i);
    });
});

describe('POST /api/auth/reset-password', () => {
    it('rejects an invalid token with 400', async () => {
        const res = await request(app)
            .post('/api/auth/reset-password')
            .send({ token: 'badtoken', password: 'NewPass1!', confirmPassword: 'NewPass1!' });
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/invalid or has expired/i);
    });
});
