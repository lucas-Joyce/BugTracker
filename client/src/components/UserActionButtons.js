function UserActionButtons({ user, onAction, loading }) {
    const canActivate = ['pending', 'revoked', 'expired'].includes(user.status);
    const canRevoke = user.status === 'active';

    return (
        <div className="action-buttons">
            {canActivate && (
                <button
                    className="btn-activate"
                    onClick={() => onAction(user._id, 'active')}
                    disabled={loading}
                >
                    Activate
                </button>
            )}
            {canRevoke && (
                <button
                    className="btn-revoke"
                    onClick={() => onAction(user._id, 'revoked')}
                    disabled={loading}
                >
                    Revoke
                </button>
            )}
        </div>
    );
}

export default UserActionButtons;
