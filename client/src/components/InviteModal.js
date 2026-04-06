import { useState } from 'react';

const API = 'http://localhost:5000';

function InviteModal({ token, type, onClose, onSuccess }) {
    // type: 'team' | 'viewer'
    const [jobRole, setJobRole]   = useState(type === 'viewer' ? 'viewer' : 'coder');
    const [email, setEmail]       = useState('');
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState('');
    const [result, setResult]     = useState(null); // { code, email, jobRole }
    const [copied, setCopied]     = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/admin/invite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ jobRole, email: email.trim() || undefined })
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message); return; }
            setResult(data.invite);
            onSuccess();
        } catch {
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(result.code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{type === 'viewer' ? 'Invite Viewer' : 'Invite Team Member'}</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                {!result ? (
                    <form onSubmit={handleSubmit} className="modal-body">
                        {error && <div className="modal-error">{error}</div>}

                        {type === 'team' && (
                            <div className="modal-field">
                                <label>Role</label>
                                <select value={jobRole} onChange={e => setJobRole(e.target.value)}>
                                    <option value="coder">Coder</option>
                                    <option value="tester">Tester</option>
                                </select>
                            </div>
                        )}

                        <div className="modal-field">
                            <label>Email address</label>
                            <input
                                type="email"
                                placeholder="invitee@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                            <span className="field-hint">An account will be created and credentials sent to this address.</span>
                        </div>

                        <div className="modal-actions">
                            <button type="button" className="modal-btn-cancel" onClick={onClose}>Cancel</button>
                            <button type="submit" className="modal-btn-submit" disabled={loading}>
                                {loading ? 'Generating...' : 'Generate Invite'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="modal-body modal-result">
                        <p className="invite-sent-note">
                            Account created and invite email sent to <strong>{result.email}</strong>.
                        </p>

                        <div className="invite-code-block">
                            <span className="invite-code-label">Temporary password</span>
                            <div className="copy-row" style={{ marginTop: '6px' }}>
                                <input type="text" readOnly value={result.code} style={{ fontWeight: 700, letterSpacing: '0.03em' }} />
                                <button type="button" className="copy-btn" onClick={copyLink}>
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                        </div>

                        <p style={{ fontSize: '0.83rem', color: '#888', marginTop: '8px' }}>
                            The user signs in with their email and this code, then sets a permanent password.
                        </p>

                        <div className="modal-actions">
                            <button className="modal-btn-submit" onClick={onClose}>Done</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default InviteModal;
