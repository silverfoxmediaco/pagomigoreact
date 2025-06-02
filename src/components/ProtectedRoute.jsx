// src/components/ProtectedRoute.jsx
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  CircularProgress,
  Typography,
  Container,
  Alert
} from '@mui/material';

/**
 * ProtectedRoute component that redirects to login if not authenticated
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {boolean} [props.requireKyc=false] - Whether KYC verification is required to access this route
 * @param {boolean} [props.requireVerification=false] - Whether identity verification is required
 * @returns {React.ReactNode} The protected children or a redirect
 */
const ProtectedRoute = ({ children, requireKyc = false, requireVerification = false }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [checkingVerification, setCheckingVerification] = useState(false);

  // Check user's verification status if required
  useEffect(() => {
    const checkVerificationStatus = async () => {
      // Only check verification if required and user is authenticated
      if ((!requireKyc && !requireVerification) || !isAuthenticated || checkingVerification) {
        return;
      }

      setCheckingVerification(true);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setVerificationStatus('not_verified');
          return;
        }

        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          
          // Check if user has completed identity verification
          const isVerified = 
            userData.kyc_status === 'completed' || 
            userData.persona_status === 'completed' || 
            userData.persona_status === 'approved' ||
            userData.plaidIdentityStatus === 'approved';

          setVerificationStatus(isVerified ? 'verified' : 'not_verified');
        } else {
          setVerificationStatus('error');
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
        setVerificationStatus('error');
      } finally {
        setCheckingVerification(false);
      }
    };

    checkVerificationStatus();
  }, [isAuthenticated, requireKyc, requireVerification, checkingVerification]);

  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Loading...
          </Typography>
        </Box>
      </Container>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Show loading while checking verification status
  if ((requireKyc || requireVerification) && checkingVerification) {
    return (
      <Container maxWidth="sm" sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Checking verification status...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Handle verification requirement
  if (requireKyc || requireVerification) {
    if (verificationStatus === 'error') {
      return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
          <Alert severity="error">
            Error checking verification status. Please try refreshing the page.
          </Alert>
        </Container>
      );
    }

    if (verificationStatus === 'not_verified') {
      // Allow access to onboarding verification page even if not verified
      if (location.pathname === '/onboarding/verify') {
        return children;
      }
      
      // For legacy compatibility, also check for /identity-verification
      if (location.pathname === '/identity-verification') {
        return children;
      }
      
      // Redirect to verification onboarding for all other protected pages
      return <Navigate to="/onboarding/verify" replace />;
    }
  }
  
  // User is authenticated and meets verification requirements if needed
  return children;
};

// Helper component for routes that require verification (backward compatibility)
export const VerifiedRoute = ({ children }) => {
  return (
    <ProtectedRoute requireVerification={true}>
      {children}
    </ProtectedRoute>
  );
};

export default ProtectedRoute;