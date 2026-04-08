import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../Auth.css';

const API = 'http://localhost:5000';

function ForcePasswordChange() {
    const { token, updateUser } = useAuth();
    const navigate = useNavigate();
    const [password, setPassword]     = useState('');
    const [confirm, setConfirm]       = useState('');
    const [showPass, setShowPass]     = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError]           = useState('');
    const [loading, setLoading]       = useState(false);

    const mismatch = confirm.length > 0 && password !== confirm;
    const matches  = confirm.length > 0 && password === confirm;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirm) { setError('Passwords do not match'); return; }
        if (password.length < 8)  { setError('Password must be at least 8 characters'); return; }
        setError('');
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/user/set-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ password, confirmPassword: confirm })
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message); return; }
            updateUser({ mustChangePassword: false });
            navigate('/app/bugs');
        } catch {
            setError('Connection error. Is the server running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <h1>Bug Tracker</h1>
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Set Your Password</h2>
                <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '16px' }}>
                    Your account was created with a temporary password. Please set a permanent one to continue.
                </p>

                {error && <div className="auth-error">{error}</div>}

                <div className="form-group">
                    <div className="password-wrapper">
                        <input
                            type={showPass ? 'text' : 'password'}
                            placeholder="New password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            autoFocus
                        />
                        <button type="button" className="password-toggle" onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                            {showPass ? '🙈' : '👁'}
                        </button>
                    </div>
                </div>

                <div className="form-group">
                    <div className="password-wrapper">
                        <input
                            type={showConfirm ? 'text' : 'password'}
                            placeholder="Confirm new password"
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                            required
                        />
                        <button type="button" className="password-toggle" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}>
                            {showConfirm ? '🙈' : '👁'}
                        </button>
                    </div>
                    {matches  && <span className="field-ok">Passwords match</span>}
                    {mismatch && <span className="field-error">Passwords do not match</span>}
                </div>

                <button type="submit" className="auth-submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Set Password & Continue'}
                </button>
            </form>
        </div>
    );
}

export default ForcePasswordChange;
