import UserActionButtons from './UserActionButtons';

function ViewerTable({ users, onAction, actionLoading }) {
    if (users.length === 0) {
        return <p className="empty-state">No viewers yet.</p>;
    }

    const formatExpiry = (date) => {
        if (!date) return '—';
        const d = new Date(date);
        const now = new Date();
        const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return <span className="expiry-past">Expired</span>;
        if (diffDays === 0) return <span className="expiry-today">Expires today</span>;
        if (diffDays <= 2) return <span className="expiry-soon">In {diffDays}d</span>;
        return d.toLocaleDateString();
    };

    return (
        <table className="admin-table">
            <thead>
                <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Expires</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {users.map(user => (
                    <tr key={user._id} className={user.status === 'expired' ? 'row-expired' : ''}>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td><span className={`status-badge ${user.status}`}>{user.status}</span></td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>{formatExpiry(user.viewerExpiresAt)}</td>
                        <td>
                            <UserActionButtons
                                user={user}
                                onAction={onAction}
                                loading={actionLoading === user._id}
                            />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default ViewerTable;
