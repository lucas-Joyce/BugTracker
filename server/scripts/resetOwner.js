/**
 * Creates the owner account if it doesn't exist, or resets the password
 * to match the current OWNER_PASSWORD in .env if it does.
 *
 * Run from project root: node server/scripts/resetOwner.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

async function reset() {
    const { MONGO_URI, OWNER_EMAIL, OWNER_PASSWORD } = process.env;

    if (!MONGO_URI)      { console.error('Missing MONGO_URI in server/.env');      process.exit(1); }
    if (!OWNER_EMAIL)    { console.error('Missing OWNER_EMAIL in server/.env');    process.exit(1); }
    if (!OWNER_PASSWORD) { console.error('Missing OWNER_PASSWORD in server/.env'); process.exit(1); }

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: OWNER_EMAIL.toLowerCase() });

    if (existing) {
        // Reset password — pre-save hook will hash it
        existing.password = OWNER_PASSWORD;
        existing.isVerified = true;
        existing.status = 'active';
        existing.role = 'owner';
        await existing.save();
        console.log(`Owner password reset for: ${OWNER_EMAIL}`);
        console.log(`Username: ${existing.username}`);
    } else {
        await User.create({
            email: OWNER_EMAIL,
            username: 'Lucas',
            password: OWNER_PASSWORD,
            name: 'Lucas',
            companyName: 'BugTracker',
            jobTitle: 'Owner',
            isVerified: true,
            role: 'owner',
            status: 'active',
            jobRole: null,
        });
        console.log(`Owner created: ${OWNER_EMAIL}`);
        console.log('Username: Lucas');
    }

    await mongoose.disconnect();
}

reset().catch(err => {
    console.error('Reset failed:', err);
    process.exit(1);
});
