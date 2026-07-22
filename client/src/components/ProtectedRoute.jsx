import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { getDashboardByRole } from '../utils/roleHelper'; // Import the helper

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // 0. Wait for session hydration to finish
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-dark text-white">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Validating Session...</span>
                </div>
            </div>
        );
    }

    // 1. Check if not logged in
    if (!user) {
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    // 3. Check Role Permission
    if (allowedRoles && allowedRoles.length > 0) {
        const userRoles = user.roles || [];
        const hasRole = userRoles.some(role => allowedRoles.includes(role));

        if (!hasRole) {
            // REDIRECT LOGIC:
            // If a student tries to access /admin, kick them back to /mahasiswa/dashboard
            // instead of a generic homepage.
            const redirectPath = getDashboardByRole(userRoles);
            return <Navigate to={redirectPath} replace />;
        }
    }

    return children;
};

export default ProtectedRoute;