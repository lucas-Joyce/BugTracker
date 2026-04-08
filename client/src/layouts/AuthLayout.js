import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AuthLayout() {
    const { token, currentUser } = useAuth();

    if (token && currentUser?.mustChangePassword) {
        return <Navigate to="/force-password-change" replace />;
    }
    if (token) {
        return <Navigate to="/app/bugs" replace />;
    }

    return <Outlet />;
}

export default AuthLayout;
