const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, trim: true, default: '' },
    companyName: { type: String, trim: true, default: '' },
    jobTitle: { type: String, trim: true, default: '' },
    mustChangePassword: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationExpires: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    role: { type: String, enum: ['owner', 'customer', 'user'], default: 'user' },
    jobRole: { type: String, enum: [null, 'coder', 'tester', 'viewer'], default: null },
    status: { type: String, enum: ['pending', 'active', 'revoked', 'expired'], default: 'pending' },
    viewerExpiresAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    managedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    nickname: { type: String, trim: true, default: '' },
    mobileNumber: { type: String, trim: true, default: '' },
    profilePhoto: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
