// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  Box,
  Paper,
  Divider,
  IconButton,
  Skeleton,
  Alert,
  Stack
} from '@mui/material';
import {
  Edit as EditIcon,
  AccountBalanceWallet as WalletIcon,
  QrCode as QrCodeIcon,
  AccountBalance as BankIcon,
  Verified as VerifiedIcon,
  Pending as PendingIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useAuth0 } from '@auth0/auth0-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { useLanguage } from '../context/LanguageContext';
import EditProfileModal from '../components/UserProfile/EditProfileModal';
import Navigation from '../components/Navigation';
import PlaidBankingSection from '../Plaid/PlaidBankingSection';
import Footer from '../components/Footer';
import ProfileQRCode from '../ProfileQRCode';

const Dashboard = () => {
  const { t } = useLanguage();
  
  // Auth0 integration
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  
  // Your existing hooks
  const { userData, loading, error, fetchProfile } = useUserProfile();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [unitToken, setUnitToken] = useState(null);

  // Unit settings for styling
  const unitSettings = {
    global: {
      colors: {
        primary: "#3A4ADF"
      },
      buttons: {
        primary: {
          default: {
            borderRadius: "8px"
          }
        }
      }
    },
    elementsCard: {
      designs: [
        {
          name: "default",
          src: "/images/logodvisacard.png",
          fontColor: "#fafafa"
        }
      ]
    }
  };

  // Unit token fetch
  useEffect(() => {
    const fetchUnitToken = async () => {
      try {
        let authToken;
        
        if (isAuthenticated) {
          console.log('Using Auth0 token for Unit Banking');
          authToken = await getAccessTokenSilently();
        } else {
          console.log('Auth0 not authenticated, using fallback token system');
          authToken = localStorage.getItem('token');
        }

        if (!authToken) {
          console.log('No auth token available, using demo token');
          setUnitToken("demo.jwt.token");
          return;
        }

        const response = await fetch('/api/unit/token', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setUnitToken(data.token);
        console.log('Unit token retrieved successfully');

      } catch (err) {
        console.error('Failed to fetch Unit token:', err);
        setUnitToken("demo.jwt.token");
        console.log('Using demo token as fallback');
      }
    };

    fetchUnitToken();
  }, [isAuthenticated, getAccessTokenSilently]);

  // Profile refresh listener
  useEffect(() => {
    const handleProfileUpdate = () => {
      console.log('Profile updated event received, refreshing user data...');
      if (fetchProfile) {
        fetchProfile();
      } else {
        window.location.reload();
      }
    };

    window.addEventListener('profile-updated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, [fetchProfile]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusChip = (status, type = 'kyc') => {
    const configs = {
      kyc: {
        completed: { label: t('completed'), color: 'success', icon: <VerifiedIcon sx={{ fontSize: 16 }} /> },
        failed: { label: t('failed'), color: 'error', icon: <ErrorIcon sx={{ fontSize: 16 }} /> },
        pending: { label: t('pending'), color: 'warning', icon: <PendingIcon sx={{ fontSize: 16 }} /> }
      },
      phone: {
        true: { label: t('verified'), color: 'success', icon: <VerifiedIcon sx={{ fontSize: 16 }} /> },
        false: { label: t('unverified'), color: 'warning', icon: <PendingIcon sx={{ fontSize: 16 }} /> }
      }
    };

    const config = configs[type]?.[status] || configs[type]?.pending || configs.kyc.pending;
    
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        icon={config.icon}
        variant="outlined"
      />
    );
  };

  // Show loading state
  if (isLoading || (loading && !userData)) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navigation />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
          <Grid container spacing={3}>
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" height={40} />
                    <Skeleton variant="rectangular" height={100} sx={{ mt: 2 }} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
        <Footer />
      </Box>
    );
  }

  // Show error state
  if (error && !userData) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navigation />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
          <Alert 
            severity="error" 
            action={
              <Button color="inherit" size="small" onClick={() => window.location.reload()}>
                Reload
              </Button>
            }
          >
            {error}
          </Alert>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Navigation />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: '#0033cc' }}>
            {t('dashboard')}
          </Typography>
          {userData && (
            <Typography variant="h6" color="text.secondary">
              {t('welcomeBack')}, {userData.name}!
            </Typography>
          )}
          {isAuthenticated && user && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Auth0 User: {user.email}
            </Typography>
          )}
        </Box>

        <Grid container spacing={3}>
          {/* User Profile Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                    {t('myProfile')}
                  </Typography>
                  <IconButton 
                    color="primary" 
                    onClick={() => setIsEditModalOpen(true)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      bgcolor: '#0033cc', 
                      fontSize: '2rem',
                      fontWeight: 600,
                      mr: 2 
                    }}
                  >
                    {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {userData?.name || 'User'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      @{userData?.username || 'username'}
                    </Typography>
                  </Box>
                </Box>

                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('phone')}:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        {userData?.phone || t('notProvided')}
                      </Typography>
                      {getStatusChip(userData?.phone_verified, 'phone')}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('email')}:
                    </Typography>
                    <Typography variant="body2">
                      {userData?.email || t('notProvided')}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('address')}:
                    </Typography>
                    <Typography variant="body2">
                      {userData?.address || t('notProvided')}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      ZIP Code:
                    </Typography>
                    <Typography variant="body2">
                      {userData?.zipCode || t('notProvided')}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Account Info Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <WalletIcon sx={{ mr: 1, color: '#0033cc' }} />
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                    {t('accountBalance')}
                  </Typography>
                </Box>

                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#0033cc', 
                    mb: 3 
                  }}
                >
                  {userData ? formatCurrency(userData.balance) : '$0.00'}
                </Typography>

                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('kycStatus')}:
                    </Typography>
                    {getStatusChip(userData?.kyc_status || 'pending', 'kyc')}
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('accountCreated')}:
                    </Typography>
                    <Typography variant="body2">
                      {userData?.createdAt 
                        ? new Date(userData.createdAt).toLocaleDateString()
                        : t('unknown')}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Verification Service:
                    </Typography>
                    <Chip 
                      label={userData?.verificationService || 'Not set'}
                      size="small"
                      variant="outlined"
                      color={userData?.verificationService ? 'primary' : 'default'}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* External Bank Accounts */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BankIcon sx={{ mr: 1, color: '#0033cc' }} />
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                    External Bank Accounts
                  </Typography>
                </Box>
                <PlaidBankingSection />
              </CardContent>
            </Card>
          </Grid>

          {/* Unit Banking Section */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                    Banking & Transactions
                  </Typography>
                  <Chip 
                    label={unitToken ? 'Ready' : 'Loading...'}
                    color={unitToken ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Auth Method: {isAuthenticated ? 'Auth0' : 'Traditional'}
                </Typography>

                {unitToken ? (
                  <Box sx={{ mt: 2 }}>
                    <unit-elements-white-label-app
                      jwt-token={unitToken}
                      settings-json={JSON.stringify(unitSettings)}
                    ></unit-elements-white-label-app>
                  </Box>
                ) : (
                  <Paper 
                    sx={{ 
                      p: 3, 
                      textAlign: 'center', 
                      bgcolor: '#f5f5f5',
                      border: '1px dashed #ddd'
                    }}
                  >
                    <Typography color="text.secondary">
                      {t('loading')} banking interface...
                    </Typography>
                  </Paper>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* QR Code Section */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <QrCodeIcon sx={{ mr: 1, color: '#0033cc' }} />
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                    My Profile QR Code
                  </Typography>
                </Box>
                <ProfileQRCode userData={userData} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
      
      <Footer />
      
      {/* Modals */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userData={userData}
      />
    </Box>
  );
};

export default Dashboard;