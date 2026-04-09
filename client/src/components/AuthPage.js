import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../Auth.css';

const API = 'http://localhost:5000';

const EyeOn = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
    </svg>
);

const EyeOff = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const calculateStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score += 2;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 2;
    if (/[a-z]/.test(password)) score += 2;
    if (/[0-9]/.test(password)) score += 2;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 3) return { label: 'Weak', color: '#f44336', percent: 33 };
    if (score <= 6) return { label: 'Medium', color: '#ff9800', percent: 66 };
    return { label: 'Strong', color: '#4caf50', percent: 100 };
};

function AuthPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [view, setView] = useState('signin'); // signin | signup | forgot | pending | reset
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [pendingEmail, setPendingEmail] = useState('');
    const [isPendingActivation, setIsPendingActivation] = useState(false);

    // Password visibility toggles
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showSignupPassword, setShowSignupPassword] = useState(false);
    const [showSignupConfirm, setShowSignupConfirm] = useState(false);

    // Sign In state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Sign Up state
    const [signupEmail, setSignupEmail] = useState('');
    const [signupUsername, setSignupUsername] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupConfirm, setSignupConfirm] = useState('');
    const [signupName, setSignupName] = useState('');
    const [signupCompany, setSignupCompany] = useState('');
    const [signupJobTitle, setSignupJobTitle] = useState('');
    const [usernameAvailable, setUsernameAvailable] = useState(null);

    // Forgot Password state
    const [forgotEmail, setForgotEmail] = useState('');

    // Reset Password state
    const [resetToken, setResetToken] = useState('');
    const [resetPassword, setResetPassword] = useState('');
    const [resetConfirm, setResetConfirm] = useState('');
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    // On mount: check for ?verified= query param from email link
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const verified = params.get('verified');
        const reset_token = params.get('reset_token');

        if (verified === 'true') {
            setSuccess('Email verified! You can now sign in.');
            setView('signin');
        } else if (verified === 'false') {
            setError('Verification link is invalid or has expired. Please request a new one.');
            setView('signin');
        } else if (reset_token) {
            setResetToken(reset_token);
            setView('reset');
        }

        if (verified !== null || reset_token !== null) {
            navigate('/signin', { replace: true });
        }
    }, []);

    const switchView = (newView) => {
        setView(newView);
        setError('');
        setSuccess('');
        setIsPendingActivation(false);
    };

    // Check username availability
    const checkUsername = async (username) => {
        if (username.length < 2) {
            setUsernameAvailable(null);
            return;
        }
        try {
            const res = await fetch(`${API}/api/auth/check-username/${username}`);
            const data = await res.json();
            setUsernameAvailable(data.available);
        } catch {
            setUsernameAvailable(null);
        }
    };

    // Sign In
    const handleSignIn = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsPendingActivation(false);
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: loginEmail, password: loginPassword })
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message);
                if (data.unverified) {
                    setPendingEmail(loginEmail);
                }
                if (data.pending) {
                    setIsPendingActivation(true);
                    setPendingEmail(loginEmail);
                }
                setLoading(false);
                return;
            }
            login(data.user, data.token);
            navigate(data.user.mustChangePassword ? '/force-password-change' : '/app/bugs');
        } catch {
            setError('Connection error. Is the server running?');
        }
        setLoading(false);
    };

    // Resend activation reminder to owner
    const handleResendActivation = async () => {
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/auth/resend-activation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: pendingEmail })
            });
            const data = await res.json();
            setSuccess(data.message);
            setIsPendingActivation(false);
        } catch {
            setError('Connection error. Is the server running?');
        }
        setLoading(false);
    };

    // Sign Up
    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!emailRegex.test(signupEmail)) {
            setError('Please enter a valid email address.');
            setLoading(false);
            return;
        }

        if (signupPassword !== signupConfirm) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }

        const strength = calculateStrength(signupPassword);
        if (strength.label === 'Weak') {
            setError('Password is too weak. Use at least 8 characters with uppercase, lowercase, and numbers.');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: signupEmail,
                    username: signupUsername,
                    password: signupPassword,
                    confirmPassword: signupConfirm,
                    name: signupName,
                    companyName: signupCompany,
                    jobTitle: signupJobTitle
                })
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message);
                setLoading(false);
                return;
            }
            setPendingEmail(signupEmail);
            setView('pending');
        } catch {
            setError('Connection error. Is the server running?');
        }
        setLoading(false);
    };

    // Forgot Password
    const handleForgot = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail })
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message);
            } else {
                setSuccess(data.message);
            }
        } catch {
            setError('Connection error. Is the server running?');
        }
        setLoading(false);
    };

    // Reset Password — submit new password
    const handleReset = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: resetToken, password: resetPassword, confirmPassword: resetConfirm })
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message);
                setLoading(false);
                return;
            }
            setSuccess(data.message);
            setView('signin');
        } catch {
            setError('Connection error. Is the server running?');
        }
        setLoading(false);
    };

    // Resend verification email
    const handleResend = async () => {
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/auth/resend-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: pendingEmail })
            });
            const data = await res.json();
            setSuccess(data.message);
        } catch {
            setError('Connection error. Is the server running?');
        }
        setLoading(false);
    };

    const passwordStrength = calculateStrength(signupPassword);
    const passwordsMatch = signupConfirm.length > 0 && signupPassword === signupConfirm;
    const passwordsMismatch = signupConfirm.length > 0 && signupPassword !== signupConfirm;

    return (
        <div className="auth-container">
            <h1>Bug Tracker</h1>

            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}

            {/* PENDING EMAIL VERIFICATION */}
            {view === 'pending' && (
                <div className="auth-form pending-view">
                    <h2>Check Your Email</h2>
                    <p>We've sent a verification link to:</p>
                    <p className="pending-email">{pendingEmail}</p>
                    <p>Click the link in the email to activate your account. The link expires in <strong>24 hours</strong>.</p>
                    <button
                        className="auth-submit"
                        onClick={handleResend}
                        disabled={loading}
                        style={{ marginTop: '8px' }}
                    >
                        {loading ? 'Sending...' : 'Resend verification email'}
                    </button>
                    <div className="auth-links">
                        <span className="auth-link" onClick={() => switchView('signin')}>
                            Back to <strong>Sign In</strong>
                        </span>
                    </div>
                </div>
            )}

            {/* SIGN IN */}
            {view === 'signin' && (
                <form className="auth-form" onSubmit={handleSignIn}>
                    <h2>Sign In</h2>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Email address or User ID"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <div className="password-wrapper">
                            <input
                                type={showLoginPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                required
                            />
                            <button type="button" className="password-toggle" onClick={() => setShowLoginPassword(v => !v)} tabIndex={-1}>
                                {showLoginPassword ? <EyeOff /> : <EyeOn />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" className="auth-submit" disabled={loading}>
                        {loading ? 'Signing in...' : 'Submit'}
                    </button>
                    <div className="auth-links">
                        <span className="auth-link" onClick={() => switchView('forgot')}>
                            Forgot your password?
                        </span>
                        <span className="auth-link" onClick={() => switchView('signup')}>
                            Set up New Account. <strong>Sign Up</strong>
                        </span>
                        {pendingEmail && !isPendingActivation && (
                            <span className="auth-link" onClick={() => setView('pending')}>
                                Resend verification email
                            </span>
                        )}
                        {isPendingActivation && (
                            <span className="auth-link" onClick={handleResendActivation}>
                                {loading ? 'Sending...' : 'Resend activation reminder'}
                            </span>
                        )}
                    </div>
                </form>
            )}

            {/* SIGN UP */}
            {view === 'signup' && (
                <form className="auth-form" onSubmit={handleSignUp}>
                    <h2>Sign Up</h2>
                    <div className="form-group">
                        <input
                            type="email"
                            placeholder="Email address"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="User Name"
                            value={signupUsername}
                            onChange={(e) => {
                                setSignupUsername(e.target.value);
                                checkUsername(e.target.value);
                            }}
                            required
                        />
                        {usernameAvailable === true && (
                            <span className="field-ok">Username available</span>
                        )}
                        {usernameAvailable === false && (
                            <span className="field-error">Username already taken</span>
                        )}
                    </div>
                    <div className="form-group">
                        <div className="password-wrapper">
                            <input
                                type={showSignupPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={signupPassword}
                                onChange={(e) => setSignupPassword(e.target.value)}
                                required
                            />
                            <button type="button" className="password-toggle" onClick={() => setShowSignupPassword(v => !v)} tabIndex={-1}>
                                {showSignupPassword ? <EyeOff /> : <EyeOn />}
                            </button>
                        </div>
                        {signupPassword.length > 0 && (
                            <div className="strength-bar-container">
                                <div
                                    className="strength-bar"
                                    style={{
                                        width: `${passwordStrength.percent}%`,
                                        backgroundColor: passwordStrength.color
                                    }}
                                />
                            </div>
                        )}
                        {signupPassword.length > 0 && (
                            <span className="strength-label" style={{ color: passwordStrength.color }}>
                                {passwordStrength.label}
                            </span>
                        )}
                    </div>
                    <div className="form-group">
                        <div className="password-wrapper">
                            <input
                                type={showSignupConfirm ? 'text' : 'password'}
                                placeholder="Confirm Password"
                                value={signupConfirm}
                                onChange={(e) => setSignupConfirm(e.target.value)}
                                required
                            />
                            <button type="button" className="password-toggle" onClick={() => setShowSignupConfirm(v => !v)} tabIndex={-1}>
                                {showSignupConfirm ? <EyeOff /> : <EyeOn />}
                            </button>
                        </div>
                        {passwordsMatch && <span className="field-ok">Passwords match</span>}
                        {passwordsMismatch && <span className="field-error">Passwords do not match</span>}
                    </div>

                    <div className="form-section-label">Personal Information</div>

                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={signupName}
                            onChange={(e) => setSignupName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Company Name"
                            value={signupCompany}
                            onChange={(e) => setSignupCompany(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Job Title"
                            value={signupJobTitle}
                            onChange={(e) => setSignupJobTitle(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="auth-submit" disabled={loading}>
                        {loading ? 'Creating account...' : 'Submit'}
                    </button>
                    <div className="auth-links">
                        <span className="auth-link" onClick={() => switchView('signin')}>
                            Already have an account? <strong>Sign In</strong>
                        </span>
                    </div>
                </form>
            )}

            {/* FORGOT PASSWORD */}
            {view === 'forgot' && (
                <form className="auth-form" onSubmit={handleForgot}>
                    <h2>Forgot Password</h2>
                    <div className="form-group">
                        <input
                            type="email"
                            placeholder="Email address"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="auth-submit" disabled={loading}>
                        {loading ? 'Sending...' : 'Submit'}
                    </button>
                    <div className="auth-links">
                        <span className="auth-link" onClick={() => switchView('signin')}>
                            Back to <strong>Sign In</strong>
                        </span>
                    </div>
                </form>
            )}

            {/* RESET PASSWORD */}
            {view === 'reset' && (
                <form className="auth-form" onSubmit={handleReset}>
                    <h2>Set New Password</h2>
                    <div className="form-group">
                        <div className="password-wrapper">
                            <input
                                type={showResetPassword ? 'text' : 'password'}
                                placeholder="New Password"
                                value={resetPassword}
                                onChange={(e) => setResetPassword(e.target.value)}
                                required
                            />
                            <button type="button" className="password-toggle" onClick={() => setShowResetPassword(v => !v)} tabIndex={-1}>
                                {showResetPassword ? <EyeOff /> : <EyeOn />}
                            </button>
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="password-wrapper">
                            <input
                                type={showResetConfirm ? 'text' : 'password'}
                                placeholder="Confirm New Password"
                                value={resetConfirm}
                                onChange={(e) => setResetConfirm(e.target.value)}
                                required
                            />
                            <button type="button" className="password-toggle" onClick={() => setShowResetConfirm(v => !v)} tabIndex={-1}>
                                {showResetConfirm ? <EyeOff /> : <EyeOn />}
                            </button>
                        </div>
                        {resetConfirm.length > 0 && resetPassword === resetConfirm && (
                            <span className="field-ok">Passwords match</span>
                        )}
                        {resetConfirm.length > 0 && resetPassword !== resetConfirm && (
                            <span className="field-error">Passwords do not match</span>
                        )}
                    </div>
                    <button type="submit" className="auth-submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Reset Password'}
                    </button>
                    <div className="auth-links">
                        <span className="auth-link" onClick={() => switchView('signin')}>
                            Back to <strong>Sign In</strong>
                        </span>
                    </div>
                </form>
            )}
        </div>
    );
}

export default AuthPage;
