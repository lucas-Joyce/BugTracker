const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
    }
});

const sender = `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`;

const sendVerificationEmail = async (toEmail, token) => {
    const verifyUrl = `${process.env.SERVER_URL}/api/auth/verify-email/${token}`;

    await transporter.sendMail({
        from: sender,
        to: toEmail,
        subject: 'Verify your Bug Tracker account',
        html: `
            <h2>Welcome to Bug Tracker</h2>
            <p>Please click the link below to verify your email address.</p>
            <p>This link will expire in <strong>24 hours</strong>.</p>
            <a href="${verifyUrl}"
               style="display:inline-block;padding:12px 24px;background:#333;color:#fff;text-decoration:none;border-radius:4px;">
               Verify Email Address
            </a>
            <p>Or copy and paste this URL into your browser:</p>
            <p>${verifyUrl}</p>
        `
    });
};

const sendPasswordResetEmail = async (toEmail, token) => {
    const resetUrl = `${process.env.CLIENT_URL}?reset_token=${token}`;

    await transporter.sendMail({
        from: sender,
        to: toEmail,
        subject: 'Reset your Bug Tracker password',
        html: `
            <h2>Password Reset Request</h2>
            <p>Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
            <a href="${resetUrl}"
               style="display:inline-block;padding:12px 24px;background:#333;color:#fff;text-decoration:none;border-radius:4px;">
               Reset Password
            </a>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <p>Or copy and paste this URL into your browser:</p>
            <p>${resetUrl}</p>
        `
    });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
