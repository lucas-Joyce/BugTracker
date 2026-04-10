import UserActionButtons from './UserActionButtons';

function TeamTable({ users, onAction, actionLoading }) {
    if (users.length === 0) {
        return <p className="empty-state">No coders or testers yet.</p>;
    }

    return (
        <table className="admin-table">
            <thead>
                <tr>
                    <th>Full Name</th>
                    <th>Username</th>
                    <th>Nickname</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {users.map(user => (
                    <tr key={user._id}>
                        <td>{user.name || '—'}</td>
                        <td>{user.username}</td>
                        <td>{user.nickname || '—'}</td>
                        <td>{user.email}</td>
                        <td><span className={`role-badge ${user.jobRole}`}>{user.jobRole}</span></td>
                        <td><span className={`status-badge ${user.status}`}>{user.status}</span></td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
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

export default TeamTable;
