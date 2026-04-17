import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../Account.css';

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

const GearIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
);

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function AccountPage() {
    const { token, currentUser, updateUser } = useAuth();
    const isUser = currentUser?.role === 'user';
    const navigate = useNavigate();
    const [avatarOpen, setAvatarOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [subscriptionOpen, setSubscriptionOpen] = useState(false);

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [photoPreview, setPhotoPreview] = useState(null);
    const fileInputRef = useRef();

    const [name, setName] = useState('');
    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);

    const [newEmail, setNewEmail] = useState('');
    const [usernameAvailable, setUsernameAvailable] = useState(null);

    const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    useEffect(() => {
        fetch(`${API}/api/user/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setProfile(data);
                setName(data.name || '');
                setNickname(data.nickname || '');
                setEmail(data.email || '');
                setUsername(data.username || '');
                setCompanyName(data.companyName || '');
                setJobTitle(data.jobTitle || '');
                setMobileNumber(data.mobileNumber || '');
                if (data.profilePhoto) setPhotoPreview(`${API}${data.profilePhoto}`);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [token]);

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setPhotoPreview(ev.target.result);
        reader.readAsDataURL(file);
        fileInputRef.current.value = '';
        const formData = new FormData();
        formData.append('photo', file);
        try {
            const res = await fetch(`${API}/api/user/photo`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (!res.ok) setError(data.message);
            else setSuccess('Profile photo updated');
        } catch {
            setError('Failed to upload photo');
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        if (!name.trim()) { setError('Full name is required.'); return; }
        if (!isUser && !companyName.trim()) { setError('Company name is required.'); return; }
        setSaving(true);
        try {
            const res = await fetch(`${API}/api/user/profile`, {
                method: 'PUT',
                headers: authHeaders,
                body: JSON.stringify({ name, nickname, username, companyName, jobTitle })
            });
            const data = await res.json();
            if (!res.ok) setError(data.message);
            else { setSuccess('Profile updated'); updateUser(data.user); }
        } catch {
            setError('Connection error');
        }
        setSaving(false);
    };

    const handleSaveMobile = async () => {
        setError(''); setSuccess('');
        setSaving(true);
        try {
            const res = await fetch(`${API}/api/user/profile`, {
                method: 'PUT',
                headers: authHeaders,
                body: JSON.stringify({ mobileNumber })
            });
            const data = await res.json();
            if (!res.ok) setError(data.message);
            else setSuccess('Mobile number saved');
        } catch {
            setError('Connection error');
        }
        setSaving(false);
    };

    const handleDeletePhoto = async () => {
        setError(''); setSuccess('');
        try {
            const res = await fetch(`${API}/api/user/photo`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) setError(data.message);
            else { setPhotoPreview(null); setSuccess('Photo removed'); }
        } catch {
            setError('Connection error');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        setSaving(true);
        try {
            const res = await fetch(`${API}/api/user/change-password`, {
                method: 'PUT',
                headers: authHeaders,
                body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
            });
            const data = await res.json();
            if (!res.ok) setError(data.message);
            else {
                setSuccess(data.message);
                setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
            }
        } catch {
            setError('Connection error');
        }
        setSaving(false);
    };

    const handleChangeEmail = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        setSaving(true);
        try {
            const res = await fetch(`${API}/api/user/profile`, {
                method: 'PUT',
                headers: authHeaders,
                body: JSON.stringify({ email: newEmail })
            });
            const data = await res.json();
            if (!res.ok) setError(data.message);
            else {
                setEmail(newEmail);
                setNewEmail('');
                setSuccess('Email updated');
            }
        } catch {
            setError('Connection error');
        }
        setSaving(false);
    };

    const checkUsernameAvailable = async (value) => {
        if (value.length < 2 || value === profile?.username) {
            setUsernameAvailable(null);
            return;
        }
        try {
            const res = await fetch(`${API}/api/auth/check-username/${value}`);
            const data = await res.json();
            setUsernameAvailable(data.available);
        } catch {
            setUsernameAvailable(null);
        }
    };

    const handleSaveUsername = async () => {
        if (!username.trim() || username === profile?.username) return;
        if (usernameAvailable === false) return;
        setError(''); setSuccess('');
        setSaving(true);
        try {
            const res = await fetch(`${API}/api/user/profile`, {
                method: 'PUT',
                headers: authHeaders,
                body: JSON.stringify({ username })
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message); }
            else {
                setSuccess('Username updated');
                setUsernameAvailable(null);
                updateUser({ username });
            }
        } catch {
            setError('Connection error');
        }
        setSaving(false);
    };

    if (loading) return <div className="account-loading">Loading profile...</div>;

    const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

    return (
        <div className="account-page">
            <div className="account-header">
                <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
                <h2>My Account</h2>
            </div>

            {error && <div className="account-error">{error}</div>}
            {success && <div className="account-success">{success}</div>}

            {/* Top row: avatar-card + settings-card */}
            <div className="acc-cards-row">

                {/* Avatar Card */}
                <div className={`acc-card${avatarOpen ? ' acc-card--open' : ''}`}>
                    <div className="acc-card-top">
                        <div className="avatar" onClick={() => fileInputRef.current.click()}>
                            {photoPreview
                                ? <img src={photoPreview} alt="Profile" />
                                : <span className="avatar-initials">{initials}</span>
                            }
                            <div className="avatar-overlay">Change</div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handlePhotoChange}
                        />
                        <div className="acc-card-summary">
                            <span className="acc-card-title">{nickname || name || '—'}</span>
                            <span className="acc-card-sub">{jobTitle || '—'}</span>
                        </div>
                    </div>

                    {avatarOpen && (
                        <form className="acc-card-body" onSubmit={handleSaveProfile}>
                            <div className="acc-field">
                                <label>Full Name <span className="acc-required">*</span></label>
                                <input value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                            <div className="acc-field">
                                <label>Nickname</label>
                                <input value={nickname} onChange={e => setNickname(e.target.value)} placeholder="Optional" />
                            </div>
                            <div className="acc-field">
                                <label>Job Title</label>
                                <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
                            </div>
                            <div className="acc-field">
                                <label>
                                    Company Name
                                    {!isUser && <span className="acc-required"> *</span>}
                                </label>
                                {isUser
                                    ? <span className="acc-readonly-value">{companyName || '—'}</span>
                                    : <input value={companyName} onChange={e => setCompanyName(e.target.value)} required />
                                }
                            </div>
                            <div className="acc-card-actions">
                                <button type="submit" className="save-btn" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                                {photoPreview && (
                                    <button type="button" className="delete-photo-btn" onClick={handleDeletePhoto}>
                                        Remove photo
                                    </button>
                                )}
                            </div>
                            <p className="photo-hint">Click photo to change · Max 2MB</p>
                        </form>
                    )}

                    <button type="button" className="acc-toggle" onClick={() => setAvatarOpen(v => !v)}>
                        <span className={`acc-triangle${avatarOpen ? ' acc-triangle--up' : ''}`} />
                    </button>
                </div>

                {/* Settings Card */}
                <div className={`acc-card${settingsOpen ? ' acc-card--open' : ''}`}>
                    <div className="acc-card-top acc-card-top--gear">
                        <span className="acc-card-title">Settings</span>
                        <GearIcon />
                    </div>

                    {settingsOpen && (
                        <div className="acc-card-body">
                            <div className="acc-field acc-field--readonly">
                                <label>Email Address</label>
                                <span>{email}</span>
                            </div>
                            <div className="acc-field acc-field--readonly">
                                <label>Account Number</label>
                                <span className="acc-mono">{profile?._id || '—'}</span>
                            </div>
                            <div className="acc-field acc-field--readonly">
                                <label>Member Since</label>
                                <span>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}</span>
                            </div>
                            <div className="acc-field">
                                <label>Username (User ID)</label>
                                <div className="acc-field-inline">
                                    <input
                                        value={username}
                                        onChange={e => {
                                            setUsername(e.target.value);
                                            checkUsernameAvailable(e.target.value);
                                        }}
                                        placeholder="Username"
                                    />
                                    <button
                                        type="button"
                                        className="save-btn save-btn--sm"
                                        disabled={saving || usernameAvailable === false || username === profile?.username}
                                        onClick={handleSaveUsername}
                                    >
                                        Save
                                    </button>
                                </div>
                                {usernameAvailable === true  && <span className="acc-field-ok">Available</span>}
                                {usernameAvailable === false && <span className="acc-field-err">Already taken</span>}
                            </div>
                            <div className="acc-field">
                                <label>Mobile Number</label>
                                <div className="acc-field-inline">
                                    <input
                                        value={mobileNumber}
                                        onChange={e => setMobileNumber(e.target.value)}
                                        placeholder="Optional"
                                    />
                                    <button type="button" className="save-btn save-btn--sm" disabled={saving} onClick={handleSaveMobile}>
                                        Save
                                    </button>
                                </div>
                            </div>

                            <div className="acc-subsection">
                                <h4>Change Password</h4>
                                <form onSubmit={handleChangePassword}>
                                    <div className="acc-field">
                                        <label>Current Password</label>
                                        <div className="password-wrapper">
                                            <input
                                                type={showCurrentPassword ? 'text' : 'password'}
                                                value={currentPassword}
                                                onChange={e => setCurrentPassword(e.target.value)}
                                                autoComplete="current-password"
                                                required
                                            />
                                            <button type="button" className="password-toggle" onClick={() => setShowCurrentPassword(v => !v)} tabIndex={-1}>
                                                {showCurrentPassword ? <EyeOff /> : <EyeOn />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="acc-field">
                                        <label>New Password</label>
                                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} autoComplete="new-password" required />
                                    </div>
                                    <div className="acc-field">
                                        <label>Confirm New Password</label>
                                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" required />
                                    </div>
                                    <button type="submit" className="save-btn" disabled={saving}>
                                        {saving ? 'Updating...' : 'Update Password'}
                                    </button>
                                </form>
                            </div>

                            <div className="acc-subsection">
                                <h4>Change Email</h4>
                                <form onSubmit={handleChangeEmail}>
                                    <div className="acc-field">
                                        <label>New Email Address</label>
                                        <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required />
                                    </div>
                                    <button type="submit" className="save-btn" disabled={saving}>
                                        {saving ? 'Updating...' : 'Update Email'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    <button type="button" className="acc-toggle" onClick={() => setSettingsOpen(v => !v)}>
                        <span className={`acc-triangle${settingsOpen ? ' acc-triangle--up' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Subscription Card */}
            <div className={`acc-card acc-card--full${subscriptionOpen ? ' acc-card--open' : ''}`}>
                <div className="acc-card-top">
                    <span className="acc-card-title">Subscription</span>
                </div>

                {subscriptionOpen && (
                    <div className="acc-card-body acc-card-body--row">
                        <div className="acc-field acc-field--readonly">
                            <label>Customer ID</label>
                            <span className="acc-mono">{profile?._id || '—'}</span>
                        </div>
                        <div className="acc-field acc-field--readonly">
                            <label>Bank Account Details</label>
                            <span className="acc-stub">Not set up</span>
                        </div>
                        <div className="acc-field acc-field--readonly">
                            <label>Subscription Type</label>
                            <span className="acc-stub">No active subscription</span>
                        </div>
                    </div>
                )}

                <button type="button" className="acc-toggle" onClick={() => setSubscriptionOpen(v => !v)}>
                    <span className={`acc-triangle${subscriptionOpen ? ' acc-triangle--up' : ''}`} />
                </button>
            </div>
        </div>
    );
}

export default AccountPage;
