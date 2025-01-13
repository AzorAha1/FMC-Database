import { useAuth } from './AuthContext';
import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children, adminRequired = false }) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // Show a loading spinner
    }

    if (!isAuthenticated) {
        return <Navigate to="/" />; // Redirect to login if not authenticated
    }

    if (adminRequired && !isAdmin()) {
        return <Navigate to="/api/dashboard" />; // Redirect to dashboard if not admin
    }

    return children;
};