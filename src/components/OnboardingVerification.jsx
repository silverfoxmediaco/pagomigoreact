// src/components/OnboardingVerification.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { usePlaid } from '../Plaid/usePlaid';
import { usePersona } from '../Persona/usePersona';

// MUI Components
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Verified as VerifiedIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

const OnboardingVerification = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [verificationService, setVerificationService] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState(false);
  
  // Plaid and Persona hooks
  const { 
    verificationStatus: plaidStatus, 
    loading: plaidLoading, 
    error: plaidError, 
    success: plaidSuccess, 
    openIdentityVerification: openPlaidVerification 
  } = usePlaid();
  
  const { 
    verificationStatus: personaStatus, 
    loading: personaLoading, 
    error: personaError, 
    success: personaSuccess, 
    startVerification: startPersonaVerification 
  } = usePersona();

  // Determine which verification service to use
  useEffect(() => {
    const loadVerificationService = async () => {
      try {
        setLoading(true);
        
        // Try to get from localStorage first
        const storedService = localStorage.getItem('verificationService');
        
        if (storedService) {
          setVerificationService(storedService);
          setLoading(false);
          return;
        }
        
        // If not in localStorage, fetch from user profile
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }
        
        const profile = await response.json();
        setUserProfile(profile);
        
        if (profile.verificationService) {
          setVerificationService(profile.verificationService);
          localStorage.setItem('verificationService', profile.verificationService);
        } else {
          // Fallback to Persona if no service specified
          setVerificationService('persona');
          localStorage.setItem('verificationService', 'persona');
        }
        
      } catch (err) {
        console.error('Error loading verification service:', err);
        setError('Failed to load verification settings');
        // Default to Persona as fallback
        setVerificationService('persona');
      } finally {
        setLoading(false);
      }
    };
    
    loadVerificationService();
  }, []);

  // Monitor verification completion
  useEffect(() => {
    const checkVerificationStatus = () => {
      if (verificationService === 'plaid') {
        if (plaidStatus === 'success' || plaidStatus === 'approved') {
          setCompleted(true);
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        }
      } else if (verificationService === 'persona') {
        if (personaStatus === 'completed' || personaStatus === 'approved') {
          setCompleted(true);
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        }
      }
    };
    
    checkVerificationStatus();
  }, [plaidStatus, personaStatus, verificationService, navigate]);

  const handleStartVerification = async () => {
    try {
      if (verificationService === 'plaid') {
        await openPlaidVerification();
      } else if (verificationService === 'persona') {
        await startPersonaVerification();
      }
    } catch (err) {
      console.error('Error starting verification:', err);
      setError('Failed to start verification process');
    }
  };

  const handleSkipVerification = () => {
    navigate('/dashboard');
  };

  const getServiceInfo = () => {
    if (verificationService === 'plaid') {
      return {
        name: 'Plaid Identity Verification',
        description: 'Secure identity verification for US, Canada, and European users',
        region: 'North America & Europe',
        documents: 'Driver\'s License, State ID, or Passport',
        color: 'primary'
      };
    } else {
      return {
        name: 'Persona Identity Verification',
        description: 'Comprehensive identity verification for Latin American and Spanish users',
        region: 'Latin America & Spain',
        documents: 'National ID, Passport, or Driver\'s License',
        color: 'secondary'
      };
    }
  };

  const steps = [
    'Account Created',
    'Email Verified',
    'Identity Verification',
    'Dashboard Access'
  ];

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (completed) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Card elevation={3}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Verification Complete!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your identity has been successfully verified. Redirecting to your dashboard...
            </Typography>
            <CircularProgress />
          </CardContent>
        </Card>
      </Container>
    );
  }

  const serviceInfo = getServiceInfo();
  const currentError = verificationService === 'plaid' ? plaidError : personaError;
  const currentSuccess = verificationService === 'plaid' ? plaidSuccess : personaSuccess;
  const currentLoading = verificationService === 'plaid' ? plaidLoading : personaLoading;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Progress Stepper */}
      <Box sx={{ mb: 4 }}>
        <Stepper activeStep={2} alternativeLabel={!isMobile}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{isMobile ? '' : label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Main Verification Card */}
      <Card elevation={3}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <SecurityIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Verify Your Identity
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Complete this final step to access all features of your Pagomigo account
            </Typography>
          </Box>

          {/* Error Display */}
          {(error || currentError) && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error || currentError}
            </Alert>
          )}

          {/* Success Display */}
          {currentSuccess && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {currentSuccess}
            </Alert>
          )}

          {/* Verification Service Info */}
          <Paper elevation={1} sx={{ p: 3, mb: 4, bgcolor: '#f8f9fa' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <VerifiedIcon color={serviceInfo.color} />
              <Typography variant="h6">
                {serviceInfo.name}
              </Typography>
              <Chip 
                label={serviceInfo.region} 
                color={serviceInfo.color} 
                size="small" 
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {serviceInfo.description}
            </Typography>
            
            <Typography variant="body2">
              <strong>Required Documents:</strong> {serviceInfo.documents}
            </Typography>
          </Paper>

          {/* Action Buttons */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2, 
            justifyContent: 'center' 
          }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleStartVerification}
              disabled={currentLoading}
              startIcon={currentLoading ? <CircularProgress size={20} /> : <VerifiedIcon />}
              sx={{ minWidth: 200 }}
            >
              {currentLoading ? 'Starting Verification...' : 'Verify Identity'}
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              onClick={handleSkipVerification}
              sx={{ minWidth: 200 }}
            >
              Skip for Now
            </Button>
          </Box>

          {/* Help Text */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              This verification helps us comply with financial regulations and keep your account secure.
              You can complete this step later from your dashboard if needed.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default OnboardingVerification;