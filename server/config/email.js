const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = async () => {
    if (transporter) return transporter;

    const account = await nodemailer.createTestAccount();
    console.log('Ethereal test account created:', account.user);

    transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
            user: account.user,
            pass: account.pass,
        },
    });

    return transporter;
};

const sendVerificationEmail = async (toEmail, token) => {
    const verifyUrl = `${process.env.SERVER_URL}/api/auth/verify-email/${token}`;
    const transport = await getTransporter();

    const info = await transport.sendMail({
        from: '"Bug Tracker" <noreply@bugtracker.dev>',
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
        `,
    });

    console.log('Verification email preview: %s', nodemailer.getTestMessageUrl(info));
};

const sendPasswordResetEmail = async (toEmail, token) => {
    const resetUrl = `${process.env.CLIENT_URL}/signin?reset_token=${token}`;
    const transport = await getTransporter();

    const info = await transport.sendMail({
        from: '"Bug Tracker" <noreply@bugtracker.dev>',
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
        `,
    });

    console.log('Password reset email preview: %s', nodemailer.getTestMessageUrl(info));
};

const sendOwnerNotification = async (username, userEmail, role) => {
    const ownerEmail = process.env.OWNER_EMAIL;
    if (!ownerEmail) return;
    const transport = await getTransporter();

    const info = await transport.sendMail({
        from: '"Bug Tracker" <noreply@bugtracker.dev>',
        to: ownerEmail,
        subject: 'New user pending activation',
        html: `
            <h2>New User Registration</h2>
            <p>A new user has registered and is awaiting activation.</p>
            <table style="border-collapse:collapse;">
                <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Username</td><td>${username}</td></tr>
                <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Email</td><td>${userEmail}</td></tr>
                <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Role</td><td>${role}</td></tr>
            </table>
            <p style="margin-top:16px;">Log in to the admin dashboard to activate or revoke this account.</p>
        `,
    });

    console.log('Owner notification preview: %s', nodemailer.getTestMessageUrl(info));
};

const sendActivationEmail = async (toEmail, username) => {
    const transport = await getTransporter();

    const info = await transport.sendMail({
        from: '"Bug Tracker" <noreply@bugtracker.dev>',
        to: toEmail,
        subject: 'Your Bug Tracker account has been activated',
        html: `
            <h2>Account Activated</h2>
            <p>Hi <strong>${username}</strong>,</p>
            <p>Your Bug Tracker account has been activated. You can now sign in.</p>
            <a href="${process.env.CLIENT_URL}"
               style="display:inline-block;padding:12px 24px;background:#333;color:#fff;text-decoration:none;border-radius:4px;">
               Sign In
            </a>
        `,
    });

    console.log('Activation email preview: %s', nodemailer.getTestMessageUrl(info));
};

const sendInviteEmail = async (toEmail, code, jobRole) => {
    const loginUrl = process.env.CLIENT_URL;
    const transport = await getTransporter();

    const info = await transport.sendMail({
        from: '"Bug Tracker" <noreply@bugtracker.dev>',
        to: toEmail,
        subject: "You've been invited to join Bug Tracker",
        html: `
            <h2>You've Been Invited</h2>
            <p>You have been invited to join Bug Tracker as a <strong>${jobRole}</strong>.</p>
            <p>Use the credentials below to sign in. You will be asked to set a new password on first login.</p>
            <table style="border-collapse:collapse;margin:16px 0;">
                <tr>
                    <td style="padding:4px 12px 4px 0;font-weight:bold;">Login email</td>
                    <td>${toEmail}</td>
                </tr>
                <tr>
                    <td style="padding:4px 12px 4px 0;font-weight:bold;">Temporary password</td>
                    <td><strong>${code}</strong></td>
                </tr>
            </table>
            <a href="${loginUrl}"
               style="display:inline-block;padding:12px 24px;background:#333;color:#fff;text-decoration:none;border-radius:4px;">
               Sign In
            </a>
            <p style="margin-top:16px;color:#888;font-size:0.9em;">
                For security, please change your password immediately after signing in.
            </p>
        `,
    });

    console.log('Invite email preview: %s', nodemailer.getTestMessageUrl(info));
};

const sendExtensionRequestEmail = async (customerEmail, viewerUsername) => {
    const transport = await getTransporter();

    const info = await transport.sendMail({
        from: '"Bug Tracker" <noreply@bugtracker.dev>',
        to: customerEmail,
        subject: 'Viewer access extension request',
        html: `
            <h2>Extension Request</h2>
            <p>Viewer <strong>${viewerUsername}</strong> has requested an extension of their access.</p>
            <p>Log in to your Admin Dashboard to review and re-activate their account.</p>
        `,
    });

    console.log('Extension request email preview: %s', nodemailer.getTestMessageUrl(info));
};

const sendPendingReminderEmail = async (toEmail, username) => {
    const transport = await getTransporter();

    const info = await transport.sendMail({
        from: '"Bug Tracker" <noreply@bugtracker.dev>',
        to: toEmail,
        subject: 'Your Bug Tracker application is under review',
        html: `
            <h2>Application Received</h2>
            <p>Hi <strong>${username}</strong>,</p>
            <p>We wanted to let you know that your Bug Tracker account application is currently under review.</p>
            <p>You will receive another email once your account has been approved. Thank you for your patience.</p>
        `,
    });

    console.log('Pending reminder email preview: %s', nodemailer.getTestMessageUrl(info));
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendOwnerNotification, sendActivationEmail, sendPendingReminderEmail, sendInviteEmail, sendExtensionRequestEmail };
