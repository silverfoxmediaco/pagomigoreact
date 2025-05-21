// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component that redirects to login if not authenticated
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {boolean} [props.requireKyc=false] - Whether KYC verification is required to access this route
 * @returns {React.ReactNode} The protected children or a redirect
 */
const ProtectedRoute = ({ children, requireKyc = false }) => {
  const { isAuthenticated, loading, user, needsKyc } = useAuth();
  const location = useLocation();
  
  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If KYC is required but not completed, redirect to verification
  if (requireKyc && needsKyc()) {
    return <Navigate to="/identity-verification" state={{ from: location }} replace />;
  }
  
  // User is authenticated and meets KYC requirements if needed
  return children;
};

export default ProtectedRoute;