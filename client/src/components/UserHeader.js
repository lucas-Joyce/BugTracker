import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

function UserHeader() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/signin');
    };

    return (
        <div className="app-header">
            <h1>
                <Link to="/app/bugs" className="header-title-link">Bug Tracker</Link>
            </h1>
            <div className="user-info">
                <span>Welcome, {currentUser?.username || 'User'}</span>
                {currentUser?.role === 'owner' && (
                    <Link to="/app/admin" className="account-btn">Owner Panel</Link>
                )}
                {currentUser?.role === 'customer' && (
                    <Link to="/app/admin" className="account-btn">Admin</Link>
                )}
                <Link to="/app/account" className="account-btn">My Account</Link>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
        </div>
    );
}

export default UserHeader;
