const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const { connect, disconnect, clearCollections } = require('./setup');
const { createOwner, createCustomer, createUser, authHeader } = require('./helpers');

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

describe('GET /api/owner/customers', () => {
    it('returns customers with per-customer user counts', async () => {
        const owner    = await createOwner();
        const customer = await createCustomer({ email: 'c@test.com', username: 'custA' });
        await createUser(customer, { email: 'u1@test.com', username: 'user1' });
        await createUser(customer, { email: 'u2@test.com', username: 'user2' });

        const res = await request(app)
            .get('/api/owner/customers')
            .set(authHeader(owner));

        expect(res.status).toBe(200);
        expect(res.body.customers).toHaveLength(1);
        expect(res.body.customers[0].userCount).toBe(2);
        expect(res.body.customers[0].userMax).toBe(20);
    });

    it('returns 403 for a non-owner', async () => {
        const customer = await createCustomer();
        const res = await request(app)
            .get('/api/owner/customers')
            .set(authHeader(customer));
        expect(res.status).toBe(403);
    });
});

describe('PATCH /api/owner/customers/:id/status — cascade revoke', () => {
    it('revoking a customer also revokes all their managed users', async () => {
        const owner    = await createOwner();
        const customer = await createCustomer({ email: 'c@test.com', username: 'custA' });
        const u1 = await createUser(customer, { email: 'u1@test.com', username: 'user1' });
        const u2 = await createUser(customer, { email: 'u2@test.com', username: 'user2' });

        const res = await request(app)
            .patch(`/api/owner/customers/${customer._id}/status`)
            .set(authHeader(owner))
            .send({ status: 'revoked' });

        expect(res.status).toBe(200);
        expect(res.body.customer.status).toBe('revoked');

        const updatedU1 = await User.findById(u1._id);
        const updatedU2 = await User.findById(u2._id);
        expect(updatedU1.status).toBe('revoked');
        expect(updatedU2.status).toBe('revoked');
    });

    it('re-activating a customer re-activates their revoked users', async () => {
        const owner    = await createOwner();
        const customer = await createCustomer({ email: 'c@test.com', username: 'custA', status: 'revoked' });
        const u1 = await createUser(customer, { email: 'u1@test.com', username: 'user1', status: 'revoked' });

        const res = await request(app)
            .patch(`/api/owner/customers/${customer._id}/status`)
            .set(authHeader(owner))
            .send({ status: 'active' });

        expect(res.status).toBe(200);
        const updatedU1 = await User.findById(u1._id);
        expect(updatedU1.status).toBe('active');
    });

    it('returns 400 for invalid status value', async () => {
        const owner    = await createOwner();
        const customer = await createCustomer({ email: 'c@test.com', username: 'custA' });

        const res = await request(app)
            .patch(`/api/owner/customers/${customer._id}/status`)
            .set(authHeader(owner))
            .send({ status: 'banned' });

        expect(res.status).toBe(400);
    });
});
