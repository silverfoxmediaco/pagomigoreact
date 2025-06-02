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
import styles from '../styles/Dashboard.module.css';

const Dashboard = () => {
  const { t } = useLanguage();
  
  // Auth0 integration
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  
  // Your existing hooks
  const { userData, loading, error, fetchProfile } = useUserProfile();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSendMoneyModalOpen, setIsSendMoneyModalOpen] = useState(false);
  const [isRequestMoneyModalOpen, setIsRequestMoneyModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('transactions');
  
  // Updated token state
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
      // If fetchProfile is available from useUserProfile, use it
      if (fetchProfile) {
        fetchProfile();
      } else {
        // Fallback to page reload
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

  const getVerificationStatus = () => {
    if (!userData) return t('unknown');
    
    if (userData.phone_verified) {
      return <span className={styles.statusVerified}>{t('verified')}</span>;
    } else {
      return <span className={styles.statusUnverified}>{t('unverified')}</span>;
    }
  };

  const getKycStatus = () => {
    if (!userData) return t('unknown');
    
    switch (userData.kyc_status) {
      case 'completed':
        return <span className={styles.statusCompleted}>{t('completed')}</span>;
      case 'failed':
        return <span className={styles.statusFailed}>{t('failed')}</span>;
      case 'pending':
      default:
        return <span className={styles.statusPending}>{t('pending')}</span>;
    }
  };

  // Show Auth0 loading state
  if (isLoading) {
    return (
      <div className={styles.dashboardContainer}>
        <Navigation />
        <main className={styles.dashboardContent}>
          <div className={styles.dashboardLoading}>{t('loading')} authentication...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <Navigation />
      
      <main className={styles.dashboardContent}>
        <div className={styles.dashboardHeader}>
          <h1>{t('dashboard')}</h1>
          {userData && (
            <div className={styles.welcomeMessage}>
              {t('welcomeBack')}, {userData.name}!
            </div>
          )}
          {/* Auth0 user info if available */}
          {isAuthenticated && user && (
            <div className={styles.welcomeMessage} style={{ fontSize: '14px', color: '#666' }}>
              Auth0 User: {user.email}
            </div>
          )}
        </div>
        
        {loading && !userData ? (
          <div className={styles.dashboardLoading}>{t('loading')} your dashboard...</div>
        ) : error && !userData ? (
          <div className={styles.dashboardError}>
            {error}
            <button onClick={() => window.location.reload()} className={styles.reloadBtn}>
              Reload
            </button>
          </div>
        ) : (
          <>
            {/* User Profile Section */}
            <section className={styles.dashboardSection}>
              <div className={styles.sectionHeader}>
                <h2>{t('myProfile')}</h2>
                <button 
                  className={styles.editProfileBtn}
                  onClick={() => setIsEditModalOpen(true)}
                >
                  {t('editProfile')}
                </button>
              </div>
              
              <div className={styles.dashboardCards}>
                <div className={styles.dashboardCard}>
                  <div className={styles.profileInfo}>
                    <div className={styles.profileAvatar}>
                      {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    
                    <div className={styles.profileDetails}>
                      <h3>{userData?.name || 'User'}</h3>
                      <p className={styles.username}>@{userData?.username || 'username'}</p>
                      
                      <div className={styles.profileContact}>
                        <div className={styles.contactItem}>
                          <span className={styles.contactLabel}>{t('phone')}:</span>
                          <span className={styles.contactValue}>{userData?.phone || t('notProvided')}</span>
                          <span className={styles.phoneStatus}>{getVerificationStatus()}</span>
                        </div>
                        
                        <div className={styles.contactItem}>
                          <span className={styles.contactLabel}>{t('email')}:</span>
                          <span className={styles.contactValue}>{userData?.email || t('notProvided')}</span>
                        </div>
                        
                        <div className={styles.contactItem}>
                          <span className={styles.contactLabel}>{t('address')}:</span>
                          <span className={styles.contactValue}>{userData?.address || t('notProvided')}</span>
                        </div>

                        <div className={styles.contactItem}>
                          <span className={styles.contactLabel}>ZIP Code:</span>
                          <span className={styles.contactValue}>{userData?.zipCode || t('notProvided')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className={styles.dashboardCard}>
                  <div className={styles.accountInfo}>
                    <div className={styles.accountBalance}>
                      <h3>{t('accountBalance')}</h3>
                      <div className={styles.balanceAmount}>{userData ? formatCurrency(userData.balance) : '$0.00'}</div>
                    </div>
                    
                    <div className={styles.accountStatus}>
                      <div className={styles.statusItem}>
                        <span className={styles.statusLabel}>{t('kycStatus')}:</span>
                        {getKycStatus()}
                      </div>
                      
                      <div className={styles.statusItem}>
                        <span className={styles.statusLabel}>{t('accountCreated')}:</span>
                        <span className={styles.statusValue}>
                          {userData?.createdAt 
                            ? new Date(userData.createdAt).toLocaleDateString()
                            : t('unknown')}
                        </span>
                      </div>

                      <div className={styles.statusItem}>
                        <span className={styles.statusLabel}>Verification Service:</span>
                        <span className={styles.statusValue}>
                          {userData?.verificationService || 'Not set'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* External Bank Accounts Section */}
            <section className={styles.dashboardSection}>
              <div className={styles.sectionHeader}>
                <h2>External Bank Accounts</h2>
              </div>
              <div className={styles.dashboardCard}>
                <PlaidBankingSection />
              </div>
            </section>

            {/* Updated Unit White Label App Section */}
            <section className={styles.dashboardSection}>
              <div className={styles.sectionHeader}>
                <h2>Banking & Transactions</h2>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  Token Status: {unitToken ? 'Ready' : t('loading') + '...'} | 
                  Auth Method: {isAuthenticated ? 'Auth0' : 'Traditional'}
                </div>
              </div>
              <div className={styles.unitAppContainer}>
                {unitToken ? (
                  <unit-elements-white-label-app
                    jwt-token={unitToken}
                    settings-json={JSON.stringify(unitSettings)}
                  ></unit-elements-white-label-app>
                ) : (
                  <div style={{ 
                    padding: '20px', 
                    textAlign: 'center', 
                    backgroundColor: '#f5f5f5', 
                    borderRadius: '8px' 
                  }}>
                    {t('loading')} banking interface...
                  </div>
                )}
              </div>
            </section>
            
            {/* QR Code Section */}
            <section className={styles.dashboardSection}>
              <div className={styles.sectionHeader}>
                <h2>My Profile QR Code</h2>
              </div>
              <div className={styles.dashboardCard}>
                <ProfileQRCode userData={userData} />
              </div>
            </section>
          </>
        )}
      </main>
      
      <Footer />
      
      {/* Modals */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userData={userData}
      />
      
    </div>
  );
};

export default Dashboard;