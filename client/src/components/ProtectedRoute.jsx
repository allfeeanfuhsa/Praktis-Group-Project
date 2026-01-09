import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { getDashboardByRole } from '../utils/roleHelper'; // Import the helper

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, token } = useAuth();
    const location = useLocation();

    // 1. Check if not logged in
    if (!token) {
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    // 2. Check if user data is loaded
    if (!user) {
        return <Navigate to="/auth/login" replace />;
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