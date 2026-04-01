import { useState, useEffect, useRef } from 'react';
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

const API = 'http://localhost:5000';

function AccountPage({ token, currentUser, onUserUpdate, onBack }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [photoPreview, setPhotoPreview] = useState(null);
    const fileInputRef = useRef();

    // Profile fields
    const [name, setName] = useState('');
    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [jobTitle, setJobTitle] = useState('');

    // Password fields
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);

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
                if (data.profilePhoto) {
                    setPhotoPreview(`${API}${data.profilePhoto}`);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [token]);

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Show preview immediately
        const reader = new FileReader();
        reader.onload = (ev) => setPhotoPreview(ev.target.result);
        reader.readAsDataURL(file);

        // Reset file input so the same file can be re-selected if needed
        fileInputRef.current.value = '';

        // Upload to server
        const formData = new FormData();
        formData.append('photo', file);

        try {
            const res = await fetch(`${API}/api/user/photo`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message);
            } else {
                setSuccess('Profile photo updated');
            }
        } catch {
            setError('Failed to upload photo');
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSaving(true);
        try {
            const res = await fetch(`${API}/api/user/profile`, {
                method: 'PUT',
                headers: authHeaders,
                body: JSON.stringify({ name, nickname, email, username, companyName, jobTitle })
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message);
            } else {
                setSuccess('Profile updated successfully');
                onUserUpdate(data.user);
            }
        } catch {
            setError('Connection error');
        }
        setSaving(false);
    };

    const handleDeletePhoto = async () => {
        setError('');
        setSuccess('');
        try {
            const res = await fetch(`${API}/api/user/photo`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message);
            } else {
                setPhotoPreview(null);
                setSuccess('Photo removed');
            }
        } catch {
            setError('Connection error');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSaving(true);
        try {
            const res = await fetch(`${API}/api/user/change-password`, {
                method: 'PUT',
                headers: authHeaders,
                body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message);
            } else {
                setSuccess(data.message);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
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
                <button className="back-btn" onClick={onBack}>← Back</button>
                <h2>My Account</h2>
            </div>

            {error && <div className="account-error">{error}</div>}
            {success && <div className="account-success">{success}</div>}

            {/* Avatar Card */}
            <div className="avatar-card">
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
                <div className="avatar-card-info">
                    <span className="avatar-card-nickname">{nickname || name || 'No nickname set'}</span>
                    <span className="avatar-card-jobtitle">{jobTitle || '—'}</span>
                    <p className="photo-hint">Click photo to change · Max 2MB</p>
                    {photoPreview && (
                        <button type="button" className="delete-photo-btn" onClick={handleDeletePhoto}>
                            Remove photo
                        </button>
                    )}
                </div>
            </div>

            {/* Profile Info */}
            <form className="account-form" onSubmit={handleSaveProfile}>
                <h3>Profile Information</h3>
                <div className="account-row">
                    <div className="account-field">
                        <label>Full Name</label>
                        <input value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="account-field">
                        <label>Nickname</label>
                        <input value={nickname} onChange={e => setNickname(e.target.value)} placeholder="Optional display name" />
                    </div>
                </div>
                <div className="account-row">
                    <div className="account-field">
                        <label>Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                </div>
                <div className="account-row">
                    <div className="account-field">
                        <label>User ID</label>
                        <input value={username} onChange={e => setUsername(e.target.value)} required />
                    </div>
                    <div className="account-field">
                        <label>Job Title</label>
                        <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} required />
                    </div>
                </div>
                <div className="account-row">
                    <div className="account-field">
                        <label>Company Name</label>
                        <input value={companyName} onChange={e => setCompanyName(e.target.value)} required />
                    </div>
                    <div className="account-field readonly">
                        <label>Member Since</label>
                        <input value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'} readOnly />
                    </div>
                </div>
                <button type="submit" className="save-btn" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </form>

            {/* Change Password */}
            <form className="account-form" onSubmit={handleChangePassword}>
                <h3>Change Password</h3>
                <div className="account-row">
                    <div className="account-field">
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
                </div>
                <div className="account-row">
                    <div className="account-field">
                        <label>New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            autoComplete="new-password"
                            required
                        />
                    </div>
                    <div className="account-field">
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            autoComplete="new-password"
                            required
                        />
                    </div>
                </div>
                <button type="submit" className="save-btn" disabled={saving}>
                    {saving ? 'Updating...' : 'Update Password'}
                </button>
            </form>
        </div>
    );
}

export default AccountPage;
