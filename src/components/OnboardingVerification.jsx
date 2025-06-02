// src/components/OnboardingVerification.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Chip
} from '@mui/material';
import {
  Verified as VerifiedIcon,
  Security as SecurityIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import Navigation from './Navigation';
import Footer from './Footer';
import { usePlaid } from '../hooks/usePlaid';
import { usePersona } from '../hooks/usePersona';

const OnboardingVerification = () => {
  const navigate = useNavigate();
  const [verificationService, setVerificationService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  // Plaid hooks
  const { 
    verificationStatus: plaidStatus, 
    loading: plaidLoading, 
    error: plaidError, 
    success: plaidSuccess, 
    openIdentityVerification: openPlaidVerification 
  } = usePlaid();

  // Persona hooks
  const { 
    verificationStatus: personaStatus, 
    loading: personaLoading, 
    error: personaError, 
    success: personaSuccess, 
    startVerification: startPersonaVerification 
  } = usePersona();

  // Steps for the onboarding process
  const steps = [
    'Account Created',
    'Email Verified', 
    'Identity Verification',
    'Complete'
  ];

  // Determine verification service on component mount
  useEffect(() => {
    const determineService = () => {
      // Check localStorage first
      const storedService = localStorage.getItem('verificationService');
      
      if (storedService) {
        setVerificationService(storedService);
        setCurrentStep(2); // Identity verification step
        setLoading(false);
        return;
      }

      // Fallback: check user profile
      const token = localStorage.getItem('token');
      if (token) {
        fetchUserProfile(token);
      } else {
        // No token, redirect to login
        navigate('/login');
      }
    };

    const fetchUserProfile = async (token) => {
      try {
        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          const service = userData.verificationService || 'persona';
          setVerificationService(service);
          localStorage.setItem('verificationService', service);
          setCurrentStep(2);
        } else {
          throw new Error('Failed to fetch user profile');
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load verification settings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    determineService();
  }, [navigate]);

  // Monitor verification status changes
  useEffect(() => {
    const checkVerificationComplete = () => {
      const isPlaidComplete = verificationService === 'plaid' && 
        (plaidStatus === 'success' || plaidStatus === 'approved');
      const isPersonaComplete = verificationService === 'persona' && 
        (personaStatus === 'completed' || personaStatus === 'approved');

      if (isPlaidComplete || isPersonaComplete) {
        setCurrentStep(3);
        setSuccess('Identity verification completed successfully!');
        
        // Redirect to dashboard after success message
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }
    };

    checkVerificationComplete();
  }, [plaidStatus, personaStatus, verificationService, navigate]);

  // Handle verification start
  const handleStartVerification = async () => {
    try {
      setError('');
      
      if (verificationService === 'plaid') {
        await openPlaidVerification();
      } else if (verificationService === 'persona') {
        await startPersonaVerification();
      } else {
        throw new Error('Unknown verification service');
      }
    } catch (err) {
      setError(`Failed to start verification: ${err.message}`);
    }
  };

  // Handle skip verification (optional)
  const handleSkipVerification = () => {
    navigate('/dashboard');
  };

  // Get current error and loading state
  const getCurrentError = () => {
    return verificationService === 'plaid' ? plaidError : personaError;
  };

  const getCurrentLoading = () => {
    return verificationService === 'plaid' ? plaidLoading : personaLoading;
  };

  const getCurrentSuccess = () => {
    return verificationService === 'plaid' ? plaidSuccess : personaSuccess;
  };

  // Get verification service display info
  const getServiceInfo = () => {
    if (verificationService === 'plaid') {
      return {
        name: 'Plaid Identity Verification',
        description: 'Secure identity verification for US, Canada, and European users',
        region: 'North America & Europe',
        color: 'primary'
      };
    } else {
      return {
        name: 'Persona Identity Verification', 
        description: 'Comprehensive identity verification for Latin America and Spain',
        region: 'Latin America & Spain',
        color: 'secondary'
      };
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navigation />
        <Container maxWidth="md" sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6">Loading verification settings...</Typography>
          </Box>
        </Container>
        <Footer />
      </Box>
    );
  }

  const serviceInfo = getServiceInfo();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Navigation />
      
      <Container maxWidth="md" sx={{ flex: 1, py: 4 }}>
        {/* Progress Stepper */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Stepper activeStep={currentStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Main Verification Card */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <SecurityIcon sx={{ fontSize: 64, color: '#0033cc', mb: 2 }} />
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
                Verify Your Identity
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                To keep your account secure and comply with financial regulations, we need to verify your identity. 
                This is a one-time process and helps protect you from fraud.
              </Typography>
            </Box>

            {/* Service Information */}
            <Paper sx={{ p: 3, mb: 4, bgcolor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {serviceInfo.name}
                </Typography>
                <Chip 
                  label={serviceInfo.region}
                  color={serviceInfo.color}
                  variant="outlined"
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {serviceInfo.description}
              </Typography>
            </Paper>

            {/* Error Messages */}
            {(error || getCurrentError()) && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error || getCurrentError()}
              </Alert>
            )}

            {/* Success Messages */}
            {(success || getCurrentSuccess()) && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success || getCurrentSuccess()}
              </Alert>
            )}

            {/* Verification Complete State */}
            {currentStep === 3 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <VerifiedIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'success.main' }}>
                  Verification Complete!
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Redirecting you to your dashboard...
                </Typography>
                <CircularProgress />
              </Box>
            ) : (
              /* Verification Action Buttons */
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleStartVerification}
                  disabled={getCurrentLoading()}
                  startIcon={getCurrentLoading() ? <CircularProgress size={20} /> : <SecurityIcon />}
                  endIcon={!getCurrentLoading() && <ArrowForwardIcon />}
                  sx={{ 
                    py: 1.5, 
                    px: 4, 
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    mb: 2
                  }}
                >
                  {getCurrentLoading() ? 'Starting Verification...' : 'Start Identity Verification'}
                </Button>

                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="text"
                    color="inherit"
                    onClick={handleSkipVerification}
                    sx={{ textDecoration: 'underline' }}
                  >
                    Skip for now (you can verify later in your dashboard)
                  </Button>
                </Box>
              </Box>
            )}

            {/* Information Box */}
            <Paper sx={{ p: 3, mt: 4, bgcolor: '#e3f2fd', border: '1px solid #bbdefb' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                What you'll need:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • A government-issued ID (driver's license, passport, or national ID)
                <br />
                • About 2-3 minutes to complete the process
                <br />
                • A well-lit area for taking photos
              </Typography>
            </Paper>
          </CardContent>
        </Card>
      </Container>
      
      <Footer />
    </Box>
  );
};

export default OnboardingVerification;