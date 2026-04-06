require('dotenv').config({ path: require('path').join(__dirname, '../.env') }); 
const mongoose = require('mongoose');
const User = require('../models/User');

async function seed() {
    const { MONGO_URI, OWNER_EMAIL, OWNER_PASSWORD } = process.env;

    if (!MONGO_URI)       { console.error('Missing MONGO_URI in .env');       process.exit(1); }
    if (!OWNER_EMAIL)     { console.error('Missing OWNER_EMAIL in .env');     process.exit(1); }
    if (!OWNER_PASSWORD)  { console.error('Missing OWNER_PASSWORD in .env');  process.exit(1); }

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: OWNER_EMAIL.toLowerCase() });
    if (existing) {
        console.log('Owner already seeded');
        await mongoose.disconnect();
        return;
    }

    await User.create({
        email: OWNER_EMAIL,
        username: 'Lucas',
        password: OWNER_PASSWORD,   // pre-save hook in User.js hashes this
        name: 'Lucas',
        companyName: 'BugTracker',
        jobTitle: 'Owner',
        isVerified: true,
        role: 'owner',
        status: 'active',
    });

    console.log(`Owner created: ${OWNER_EMAIL}`);
    await mongoose.disconnect();
}

seed().catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
});
