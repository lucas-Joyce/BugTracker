import { createPortal } from 'react-dom';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserHeader from '../components/UserHeader';

function UserLayout() {
    const { token, currentUser } = useAuth();

    if (!token) return <Navigate to="/signin" replace />;
    if (currentUser?.mustChangePassword) return <Navigate to="/force-password-change" replace />;

    return (
        <>
            {createPortal(<UserHeader />, document.getElementById('user'))}
            {createPortal(<Outlet />, document.getElementById('bugs'))}
        </>
    );
}

export default UserLayout;
