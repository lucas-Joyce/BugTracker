import { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// ── Layouts (lazy) ────────────────────────────────────────────
const AuthLayout = lazy(() => import('./layouts/AuthLayout'));
const UserLayout = lazy(() => import('./layouts/UserLayout'));

// ── id=root  auth chunk ───────────────────────────────────────
const AuthPage            = lazy(() => import('./components/AuthPage'));
const ForcePasswordChange = lazy(() => import('./components/ForcePasswordChange'));

// ── id=user  dashboard chunk ──────────────────────────────────
const AccountPage    = lazy(() => import('./components/AccountPage'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const OwnerDashboard = lazy(() => import('./components/OwnerDashboard'));

// ── id=bug   bug chunk ────────────────────────────────────────
const BugList = lazy(() => import('./components/BugList'));

// Renders the correct dashboard based on role
function AdminGate() {
    const { currentUser } = useAuth();
    const [ownerTab, setOwnerTab] = useState('owner');

    if (currentUser?.role === 'owner') {
        return (
            <div>
                <div className="owner-gate-tabs">
                    <button
                        className={`owner-gate-tab${ownerTab === 'owner' ? ' active' : ''}`}
                        onClick={() => setOwnerTab('owner')}
                    >
                        Customers
                    </button>
                    <button
                        className={`owner-gate-tab${ownerTab === 'team' ? ' active' : ''}`}
                        onClick={() => setOwnerTab('team')}
                    >
                        My Team
                    </button>
                </div>
                {ownerTab === 'owner' ? <OwnerDashboard /> : <AdminDashboard />}
            </div>
        );
    }
    if (currentUser?.role === 'customer') return <AdminDashboard />;
    return <Navigate to="/app/bugs" replace />;
}

function AppLoading() {
    return (
        <div style={{ padding: '60px', textAlign: 'center', color: '#888', fontSize: '14px' }}>
            Loading...
        </div>
    );
}

// Routes live inside AuthProvider + BrowserRouter so hooks work
function AppRoutes() {
    return (
        <Suspense fallback={<AppLoading />}>
            <Routes>
                {/* Root → sign in */}
                <Route path="/" element={<Navigate to="/signin" replace />} />

                {/* ── id=root — auth routes (redirect away if logged in) ── */}
                <Route element={<AuthLayout />}>
                    <Route path="/signin" element={<AuthPage />} />
                </Route>

                {/* Force password change — needs token, no header */}
                <Route path="/force-password-change" element={<ForcePasswordChange />} />

                {/* ── id=user + id=bug — protected, header lives in UserLayout ── */}
                <Route path="/app" element={<UserLayout />}>
                    <Route index element={<Navigate to="/app/bugs" replace />} />

                    {/* id=user */}
                    <Route path="account" element={<AccountPage />} />
                    <Route path="admin"   element={<AdminGate />} />

                    {/* id=bug */}
                    <Route path="bugs" element={<BugList />} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/signin" replace />} />
            </Routes>
        </Suspense>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
