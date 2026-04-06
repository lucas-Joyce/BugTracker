/**
 * One-off migration: restructure role field and add jobRole.
 *
 *   coder  → role: 'user', jobRole: 'coder'
 *   tester → role: 'user', jobRole: 'tester'
 *   viewer → role: 'user', jobRole: 'viewer'
 *   owner  → role: 'owner', jobRole: null  (no change, just fills missing field)
 *
 * Run once: node server/scripts/migrate-roles.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bugtracker';

async function migrate() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const col = mongoose.connection.db.collection('users');

    const jobRoleMigrations = [
        { oldRole: 'coder',  jobRole: 'coder'  },
        { oldRole: 'tester', jobRole: 'tester' },
        { oldRole: 'viewer', jobRole: 'viewer' },
    ];

    for (const { oldRole, jobRole } of jobRoleMigrations) {
        const result = await col.updateMany(
            { role: oldRole },
            { $set: { role: 'user', jobRole } }
        );
        console.log(`  ${oldRole} → user / ${jobRole}: ${result.modifiedCount} document(s) updated`);
    }

    // Ensure existing owners have jobRole: null (new field won't exist on old docs)
    const ownerResult = await col.updateMany(
        { role: 'owner', jobRole: { $exists: false } },
        { $set: { jobRole: null } }
    );
    console.log(`  owner jobRole initialised to null: ${ownerResult.modifiedCount} document(s) updated`);

    await mongoose.disconnect();
    console.log('Migration complete.');
}

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
