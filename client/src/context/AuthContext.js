import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [currentUser, setCurrentUser] = useState(() => {
        const stored = localStorage.getItem('currentUser');
        return stored ? JSON.parse(stored) : null;
    });

    const login = useCallback((user, newToken) => {
        setCurrentUser(user);
        setToken(newToken);
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('currentUser', JSON.stringify(user));
    }, []);

    const logout = useCallback(() => {
        setCurrentUser(null);
        setToken(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
    }, []);

    const updateUser = useCallback((updated) => {
        setCurrentUser(prev => {
            const merged = { ...prev, ...updated };
            localStorage.setItem('currentUser', JSON.stringify(merged));
            return merged;
        });
    }, []);

    return (
        <AuthContext.Provider value={{ token, currentUser, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
