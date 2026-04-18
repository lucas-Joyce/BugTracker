const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'Bug Tracker <noreply@resend.dev>';

const sendVerificationEmail = async (toEmail, token) => {
    const verifyUrl = `${process.env.SERVER_URL}/api/auth/verify-email/${token}`;

    await resend.emails.send({
        from: FROM,
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
};

const sendPasswordResetEmail = async (toEmail, token) => {
    const resetUrl = `${process.env.CLIENT_URL}/signin?reset_token=${token}`;

    await resend.emails.send({
        from: FROM,
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
};

const sendOwnerNotification = async (username, userEmail, role) => {
    const ownerEmail = process.env.OWNER_EMAIL;
    if (!ownerEmail) return;

    await resend.emails.send({
        from: FROM,
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
};

const sendActivationEmail = async (toEmail, username) => {
    await resend.emails.send({
        from: FROM,
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
};

const sendInviteEmail = async (toEmail, code, jobRole) => {
    await resend.emails.send({
        from: FROM,
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
            <a href="${process.env.CLIENT_URL}"
               style="display:inline-block;padding:12px 24px;background:#333;color:#fff;text-decoration:none;border-radius:4px;">
               Sign In
            </a>
            <p style="margin-top:16px;color:#888;font-size:0.9em;">
                For security, please change your password immediately after signing in.
            </p>
        `,
    });
};

const sendExtensionRequestEmail = async (customerEmail, viewerUsername) => {
    await resend.emails.send({
        from: FROM,
        to: customerEmail,
        subject: 'Viewer access extension request',
        html: `
            <h2>Extension Request</h2>
            <p>Viewer <strong>${viewerUsername}</strong> has requested an extension of their access.</p>
            <p>Log in to your Admin Dashboard to review and re-activate their account.</p>
        `,
    });
};

const sendPendingReminderEmail = async (toEmail, username) => {
    await resend.emails.send({
        from: FROM,
        to: toEmail,
        subject: 'Your Bug Tracker application is under review',
        html: `
            <h2>Application Received</h2>
            <p>Hi <strong>${username}</strong>,</p>
            <p>Your Bug Tracker account application is currently under review.</p>
            <p>You will receive another email once your account has been approved.</p>
        `,
    });
};

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendOwnerNotification,
    sendActivationEmail,
    sendPendingReminderEmail,
    sendInviteEmail,
    sendExtensionRequestEmail
};