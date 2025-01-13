import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from './api/axios.js';
import { useNavigate } from 'react-router-dom';

// Create the AuthContext
const AuthContext = createContext(null);

// AuthProvider component
const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Track authentication status
    const [userRole, setUserRole] = useState(null); // Track user role
    const [loading, setLoading] = useState(true); // Track loading state
    const navigate = useNavigate();

    // Check authentication status on app load and after login
    const checkAuth = async () => {
        try {
            const response = await axios.get('/api/check-auth', { withCredentials: true });
            setIsAuthenticated(true);
            setUserRole(response.data.role);
        } catch (error) {
            if (error.response?.status === 401) {
                setIsAuthenticated(false);
                setUserRole(null);
                navigate('/');
            }
        } finally {
            setLoading(false);
        }
    };

    // Check authentication status on app load
    useEffect(() => {
        checkAuth();
    }, []);

    // Login function
    const login = async (email, password, role) => {
        try {
            const response = await axios.post('/api/login', { email, password, role }, { withCredentials: true });
            await checkAuth(); // Call checkAuth to sync state with backend
            return {
                success: true,
                redirectUrl: response.data.redirectUrl,
            };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Login failed' };
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await axios.post('/api/logout', {}, { withCredentials: true });
        } catch (error) {
            console.log('Logout error:', error);
        } finally {
            setIsAuthenticated(false);
            setUserRole(null);
            navigate('/');
        }
    };

    // Check if the user is an admin
    const isAdmin = () => userRole === 'admin-user';

    // Provide authentication context to the app
    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                userRole,
                loading,
                login,
                logout,
                isAdmin,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the AuthContext
const useAuth = () => useContext(AuthContext);

// Export AuthProvider and useAuth
export { AuthProvider, useAuth };