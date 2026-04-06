import { useState, useEffect } from 'react';
import SlotCounter from './SlotCounter';
import TeamTable from './TeamTable';
import ViewerTable from './ViewerTable';
import InviteModal from './InviteModal';
import '../Admin.css';

const API = 'http://localhost:5000';

function AdminDashboard({ token, onBack }) {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({
        coders:  { used: 0, max: 5 },
        testers: { used: 0, max: 5 },
        viewers: { used: 0, max: 10 }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [inviteModal, setInviteModal] = useState(null); // null | 'team' | 'viewer'

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API}/api/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to load users');
            const data = await res.json();
            setUsers(data.users);
            setStats(data.stats);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, [token]);

    const handleAction = async (userId, status) => {
        setActionLoading(userId);
        setError('');
        try {
            const res = await fetch(`${API}/api/admin/users/${userId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message);
                return;
            }
            // Update user in local state without refetching
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, ...data.user } : u));
            // Refetch for accurate stats
            fetchUsers();
        } catch {
            setError('Connection error');
        } finally {
            setActionLoading(null);
        }
    };

    const teamUsers   = users.filter(u => u.role === 'user' && ['coder', 'tester'].includes(u.jobRole));
    const viewerUsers = users.filter(u => u.role === 'user' && u.jobRole === 'viewer');

    const codersFull  = stats.coders.used >= stats.coders.max;
    const testersFull = stats.testers.used >= stats.testers.max;
    const teamFull    = codersFull && testersFull;
    const viewersFull = stats.viewers.used >= stats.viewers.max;

    return (
        <div className="admin-page">
            <div className="admin-header">
                <button className="back-btn" onClick={onBack}>← Back</button>
                <h1>Admin Dashboard</h1>
            </div>

            {error && <div className="admin-error">{error}</div>}

            <div className="slot-counters">
                <SlotCounter used={stats.coders.used}  max={stats.coders.max}  label="Coders" />
                <SlotCounter used={stats.testers.used} max={stats.testers.max} label="Testers" />
                <SlotCounter used={stats.viewers.used} max={stats.viewers.max} label="Viewers" />
            </div>

            <div className="invite-actions">
                <button
                    className="invite-btn"
                    disabled={teamFull}
                    title={teamFull ? 'Coder and tester limits reached' : 'Invite a coder or tester'}
                    onClick={() => setInviteModal('team')}
                >
                    + Invite Team Member
                </button>
                <button
                    className="invite-btn"
                    disabled={viewersFull}
                    title={viewersFull ? 'Viewer limit reached (10/10)' : 'Invite a viewer'}
                    onClick={() => setInviteModal('viewer')}
                >
                    + Invite Viewer
                </button>
            </div>

            {inviteModal && (
                <InviteModal
                    token={token}
                    type={inviteModal}
                    onClose={() => setInviteModal(null)}
                    onSuccess={fetchUsers}
                />
            )}

            {loading ? (
                <p className="admin-loading">Loading users...</p>
            ) : (
                <>
                    <div className="admin-section">
                        <h2>Team <span className="section-count">({teamUsers.length})</span></h2>
                        <TeamTable users={teamUsers} onAction={handleAction} actionLoading={actionLoading} />
                    </div>

                    <div className="admin-section">
                        <h2>Viewers <span className="section-count">({viewerUsers.length})</span></h2>
                        <ViewerTable users={viewerUsers} onAction={handleAction} actionLoading={actionLoading} />
                    </div>
                </>
            )}
        </div>
    );
}

export default AdminDashboard;
