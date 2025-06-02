// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { useLanguage } from '../context/LanguageContext';
import EditProfileModal from '../components/UserProfile/EditProfileModal';
import Navigation from '../components/Navigation';
import PlaidBankingSection from '../Plaid/PlaidBankingSection';
import Footer from '../components/Footer';
import BankingSection from '../UnitBanking/BankingSection';
import ProfileQRCode from '../ProfileQRCode';

// MUI Components
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  Box,
  Divider,
  IconButton,
  Alert,
  Skeleton,
  useTheme,
  useMediaQuery,
  Paper
} from '@mui/material';
import {
  Edit as EditIcon,
  AccountBalanceWallet as WalletIcon,
  Verified as VerifiedIcon,
  Pending as PendingIcon,
  Error as ErrorIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  CreditCard as CreditCardIcon
} from '@mui/icons-material';

const Dashboard = () => {
  const { t } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  
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

  // FIXED: Updated useEffect to handle both Auth0 and fallback token with proper authentication
  useEffect(() => {
    const fetchUnitToken = async () => {
      try {
        // Get the authentication token
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

        // Make authenticated request to Unit token endpoint
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
        // Use demo token as fallback
        setUnitToken("demo.jwt.token");
        console.log('Using demo token as fallback');
      }
    };

    fetchUnitToken();
  }, [isAuthenticated, getAccessTokenSilently]);

  // Add profile refresh listener
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

  const getVerificationStatusChip = () => {
    if (!userData) return <Chip label={t('unknown')} size="small" color="default" />;
    
    if (userData.phone_verified) {
      return <Chip icon={<VerifiedIcon />} label={t('verified')} size="small" color="success" />;
    } else {
      // COMMENTED OUT: Remove unverified text for now
      // return <Chip icon={<PendingIcon />} label={t('unverified')} size="small" color="warning" />;
      return null;
    }
  };

  const getKycStatusChip = () => {
    if (!userData) return <Chip label={t('unknown')} size="small" color="default" />;
    
    switch (userData.kyc_status) {
      case 'completed':
        return <Chip icon={<VerifiedIcon />} label={t('completed')} size="small" color="success" />;
      case 'failed':
        return <Chip icon={<ErrorIcon />} label={t('failed')} size="small" color="error" />;
      case 'pending':
      default:
        return <Chip icon={<PendingIcon />} label={t('pending')} size="small" color="warning" />;
    }
  };

  // Show Auth0 loading state
  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navigation />
        <Container maxWidth="xl" sx={{ flex: 1, py: 4 }}>
          <Skeleton variant="text" height={60} sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} md={6} lg={3} key={item}>
                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f5f7fb' }}>
      <Navigation />
      
      <Container maxWidth="xl" sx={{ flex: 1, py: { xs: 2, md: 4 } }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ 
            fontSize: { xs: '2rem', md: '2.5rem' },
            fontWeight: 600,
            color: '#1a1a1a'
          }}>
            {t('dashboard')}
          </Typography>
          {userData && (
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              {t('welcomeBack')}, {userData.name}!
            </Typography>
          )}
          {/* Auth0 user info if available */}
          {isAuthenticated && user && (
            <Typography variant="body2" color="text.secondary">
              Auth0 User: {user.email}
            </Typography>
          )}
        </Box>
        
        {loading && !userData ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <Box>
              <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 2 }} />
            </Box>
          </Box>
        ) : error && !userData ? (
          <Alert 
            severity="error" 
            action={
              <Button color="inherit" size="small" onClick={() => window.location.reload()}>
                Reload
              </Button>
            }
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        ) : (
          <>
            {/* Profile and Account Overview - Updated Layout */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* Profile Card - 60% width on desktop, 100% on mobile */}
              <Grid item xs={12} md={6}>
                <Card elevation={2} sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                      <Typography variant="h5" component="h2" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                        {t('myProfile')}
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => setIsEditModalOpen(true)}
                        size="small"
                      >
                        {t('editProfile')}
                      </Button>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
                      <Avatar 
                        sx={{ 
                          width: { xs: 80, sm: 100 }, 
                          height: { xs: 80, sm: 100 }, 
                          bgcolor: '#0033cc',
                          fontSize: { xs: '1.5rem', sm: '2rem' },
                          fontWeight: 600
                        }}
                      >
                        {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                      </Avatar>
                      
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {userData?.name || 'User'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          @{userData?.username || 'username'}
                        </Typography>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <PhoneIcon color="action" fontSize="small" />
                              <Typography variant="body2" color="text.secondary">
                                {t('phone')}:
                              </Typography>
                              <Typography variant="body2">
                                {userData?.phone || t('notProvided')}
                              </Typography>
                              {getVerificationStatusChip()}
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <EmailIcon color="action" fontSize="small" />
                              <Typography variant="body2" color="text.secondary">
                                {t('email')}:
                              </Typography>
                              <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                {userData?.email || t('notProvided')}
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <HomeIcon color="action" fontSize="small" />
                              <Typography variant="body2" color="text.secondary">
                                {t('address')}:
                              </Typography>
                              <Typography variant="body2">
                                {userData?.address || t('notProvided')}
                              </Typography>
                            </Box>
                          </Grid>

                          {userData?.zipCode && (
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                  ZIP Code:
                                </Typography>
                                <Typography variant="body2">
                                  {userData.zipCode}
                                </Typography>
                              </Box>
                            </Grid>
                          )}

                          {userData?.verificationService && (
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Verification Service:
                                </Typography>
                                <Chip 
                                  label={userData.verificationService} 
                                  size="small" 
                                  variant="outlined"
                                  color={userData.verificationService === 'plaid' ? 'primary' : 'secondary'}
                                />
                              </Box>
                            </Grid>
                          )}
                        </Grid>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Account Balance Card - 40% width on desktop, 100% on mobile */}
              <Grid item xs={12} md={6}>
                <Card elevation={2} sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <WalletIcon color="primary" />
                      <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                        {t('accountBalance')}
                      </Typography>
                    </Box>
                    
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        color: '#0033cc', 
                        fontWeight: 700, 
                        mb: 3,
                        fontSize: { xs: '2rem', sm: '2.5rem' }
                      }}
                    >
                      {userData ? formatCurrency(userData.balance) : '$0.00'}
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ space: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {t('kycStatus')}:
                        </Typography>
                        {getKycStatusChip()}
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
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* External Bank Accounts - Full Width */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <Card elevation={2}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 3 }}>
                      External Bank Accounts
                    </Typography>
                    <PlaidBankingSection />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Banking & Transactions - Full Width */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <Card elevation={2}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                        Banking & Transactions
                      </Typography>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Token Status: {unitToken ? 'Ready' : t('loading') + '...'} | 
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Auth Method: {isAuthenticated ? 'Auth0' : 'Traditional'}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ 
                      minHeight: 400,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {unitToken ? (
                        <unit-elements-white-label-app
                          jwt-token={unitToken}
                          settings-json={JSON.stringify(unitSettings)}
                        ></unit-elements-white-label-app>
                      ) : (
                        <Box sx={{ 
                          p: 3, 
                          textAlign: 'center', 
                          bgcolor: '#f5f5f5', 
                          borderRadius: 2,
                          width: '100%'
                        }}>
                          <Typography color="text.secondary">
                            {t('loading')} banking interface...
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {/* QR Code Section */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6} lg={4}>
                <Card elevation={2}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 3 }}>
                      My Profile QR Code
                    </Typography>
                    <ProfileQRCode userData={userData} />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
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