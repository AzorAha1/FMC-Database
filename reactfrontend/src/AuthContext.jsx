import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from './api/axios.js';
import { useNavigate } from 'react-router-dom';

// Create the AuthContext
const AuthContext = createContext(null);

// AuthProvider component
const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (email, password, role) => {
        try {
            const response = await axios.post('/api/login', { email, password, role }, { withCredentials: true });
            await checkAuth();
            return {
                success: true,
                redirectUrl: response.data.redirectUrl,
            };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Login failed' };
        }
    };

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

    const isAdmin = () => userRole === 'admin-user';

    return (
        <AuthContext.Provider 
            value={{ 
                isAuthenticated, 
                userRole, 
                login, 
                logout, 
                isAdmin, 
                loading 
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };