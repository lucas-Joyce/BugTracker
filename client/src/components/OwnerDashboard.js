import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../Admin.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const STATUS_BADGE = {
    active:  { label: 'Active',  cls: 'badge-active'  },
    pending: { label: 'Pending', cls: 'badge-pending' },
    revoked: { label: 'Revoked', cls: 'badge-revoked' },
    expired: { label: 'Expired', cls: 'badge-expired' },
};

function OwnerDashboard() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [stats, setStats]         = useState({ coders: 0, testers: 0, viewers: 0, total: 0 });
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [remindLoading, setRemindLoading] = useState(null);
    const [remindSuccess, setRemindSuccess] = useState(null);

    const fetchCustomers = async () => {
        try {
            const res = await fetch(`${API}/api/owner/customers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to load customers');
            const data = await res.json();
            setCustomers(data.customers);
            setStats(data.stats);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCustomers(); }, [token]);

    const handleAction = async (customerId, status) => {
        setActionLoading(customerId);
        setError('');
        try {
            const res = await fetch(`${API}/api/owner/customers/${customerId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message); return; }
            fetchCustomers();
        } catch {
            setError('Connection error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRemind = async (customerId) => {
        setRemindLoading(customerId);
        setRemindSuccess(null);
        setError('');
        try {
            const res = await fetch(`${API}/api/owner/customers/${customerId}/remind`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message); return; }
            setRemindSuccess(customerId);
        } catch {
            setError('Connection error');
        } finally {
            setRemindLoading(null);
        }
    };

    const pending = customers.filter(c => c.status === 'pending');
    const active  = customers.filter(c => c.status === 'active');
    const revoked = customers.filter(c => c.status === 'revoked');

    return (
        <div className="admin-page">
            <div className="admin-header">
                <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
                <h1>Owner Dashboard</h1>
            </div>

            {error && <div className="admin-error">{error}</div>}

            {!loading && pending.length > 0 && (
                <div className="pending-banner">
                    <strong>{pending.length} customer{pending.length > 1 ? 's' : ''} awaiting your approval</strong>
                    <span> — review below and approve or revoke access.</span>
                </div>
            )}

            <div className="slot-counters">
                <div className="slot-counter">
                    <span className="slot-label">Customers</span>
                    <span className="slot-value">{customers.length}</span>
                </div>
                <div className="slot-counter">
                    <span className="slot-label">Coders</span>
                    <span className="slot-value">{stats.coders}</span>
                </div>
                <div className="slot-counter">
                    <span className="slot-label">Testers</span>
                    <span className="slot-value">{stats.testers}</span>
                </div>
                <div className="slot-counter">
                    <span className="slot-label">Viewers</span>
                    <span className="slot-value">{stats.viewers}</span>
                </div>
            </div>

            {loading ? (
                <p className="admin-loading">Loading customers...</p>
            ) : (
                <>
                    {pending.length > 0 && (
                        <div className="admin-section">
                            <h2>Pending Approval <span className="section-count">({pending.length})</span></h2>
                            <CustomerTable
                                customers={pending}
                                onAction={handleAction}
                                actionLoading={actionLoading}
                                onRemind={handleRemind}
                                remindLoading={remindLoading}
                                remindSuccess={remindSuccess}
                            />
                        </div>
                    )}

                    <div className="admin-section">
                        <h2>Active Customers <span className="section-count">({active.length})</span></h2>
                        <CustomerTable
                            customers={active}
                            onAction={handleAction}
                            actionLoading={actionLoading}
                        />
                    </div>

                    {revoked.length > 0 && (
                        <div className="admin-section">
                            <h2>Revoked <span className="section-count">({revoked.length})</span></h2>
                            <CustomerTable
                                customers={revoked}
                                onAction={handleAction}
                                actionLoading={actionLoading}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function CustomerTable({ customers, onAction, actionLoading, onRemind, remindLoading, remindSuccess }) {
    if (customers.length === 0) {
        return <p className="admin-empty">No customers in this group.</p>;
    }

    return (
        <table className="admin-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Company</th>
                    <th>Email</th>
                    <th>Username</th>
                    <th>Users</th>
                    <th>Status</th>
                    <th>Registered</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {customers.map(c => {
                    const badge = STATUS_BADGE[c.status] || { label: c.status, cls: '' };
                    const isLoading = actionLoading === c._id;
                    return (
                        <tr key={c._id}>
                            <td>{c.name}</td>
                            <td>{c.companyName}</td>
                            <td>{c.email}</td>
                            <td>{c.username}</td>
                            <td><span className="user-count">{c.userCount}/{c.userMax}</span></td>
                            <td><span className={`status-badge ${badge.cls}`}>{badge.label}</span></td>
                            <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                            <td className="action-cell">
                                {c.status !== 'active' && (
                                    <button
                                        className="action-btn activate-btn"
                                        onClick={() => onAction(c._id, 'active')}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? '...' : 'Approve'}
                                    </button>
                                )}
                                {c.status === 'active' && (
                                    <button
                                        className="action-btn revoke-btn"
                                        onClick={() => onAction(c._id, 'revoked')}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? '...' : 'Revoke'}
                                    </button>
                                )}
                                {c.status === 'pending' && onRemind && (
                                    remindSuccess === c._id ? (
                                        <span className="remind-sent">Reminder sent</span>
                                    ) : (
                                        <button
                                            className="action-btn remind-btn"
                                            onClick={() => onRemind(c._id)}
                                            disabled={remindLoading === c._id}
                                        >
                                            {remindLoading === c._id ? '...' : 'Remind'}
                                        </button>
                                    )
                                )}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}

export default OwnerDashboard;
