// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useUserProfile } from '../hooks/useUserProfile';
import EditProfileModal from '../components/UserProfile/EditProfileModal';
import Navigation from '../components/Navigation';
import PlaidVerification from '../Plaid/PlaidVerification';
import PlaidBankingSection from '../Plaid/PlaidBankingSection';
import Footer from '../components/Footer';
import BankingSection from '../UnitBanking/BankingSection';
import ProfileQRCode from '../ProfileQRCode';
import styles from '../styles/Dashboard.module.css';

const Dashboard = () => {
  // Auth0 integration
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  
  // Your existing hooks
  const { userData, loading, error } = useUserProfile();
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

  // Updated useEffect to handle both Auth0 and fallback token
  useEffect(() => {
    const fetchUnitToken = async () => {
      try {
        // If Auth0 is authenticated, use Auth0 token
        if (isAuthenticated) {
          console.log('Using Auth0 token for Unit Banking');
          const token = await getAccessTokenSilently();
          setUnitToken(token);
          console.log('Auth0 token set for Unit');
        } else {
          // Fallback to your existing token system
          console.log('Auth0 not authenticated, using fallback token system');
          const response = await fetch('/api/unit/token');
          const data = await response.json();
          setUnitToken(data.token);
          console.log('Fallback token set for Unit');
        }
      } catch (err) {
        console.error('Failed to fetch Unit token:', err);
        // Ultimate fallback to demo token
        setUnitToken("demo.jwt.token");
        console.log('Using demo token as ultimate fallback');
      }
    };

    fetchUnitToken();
  }, [isAuthenticated, getAccessTokenSilently]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getVerificationStatus = () => {
    if (!userData) return 'Unknown';
    
    if (userData.phone_verified) {
      return <span className={styles.statusVerified}>Verified</span>;
    } else {
      return <span className={styles.statusUnverified}>Unverified</span>;
    }
  };

  const getKycStatus = () => {
    if (!userData) return 'Unknown';
    
    switch (userData.kyc_status) {
      case 'completed':
        return <span className={styles.statusCompleted}>Completed</span>;
      case 'failed':
        return <span className={styles.statusFailed}>Failed</span>;
      case 'pending':
      default:
        return <span className={styles.statusPending}>Pending</span>;
    }
  };

  // Show Auth0 loading state
  if (isLoading) {
    return (
      <div className={styles.dashboardContainer}>
        <Navigation />
        <main className={styles.dashboardContent}>
          <div className={styles.dashboardLoading}>Loading authentication...</div>
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
          <h1>Dashboard</h1>
          {userData && (
            <div className={styles.welcomeMessage}>
              Welcome back, {userData.name}!
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
          <div className={styles.dashboardLoading}>Loading your dashboard...</div>
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
                <h2>My Profile</h2>
                <button 
                  className={styles.editProfileBtn}
                  onClick={() => setIsEditModalOpen(true)}
                >
                  Edit Profile
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
                          <span className={styles.contactLabel}>Phone:</span>
                          <span className={styles.contactValue}>{userData?.phone || 'Not provided'}</span>
                          <span className={styles.phoneStatus}>{getVerificationStatus()}</span>
                        </div>
                        
                        <div className={styles.contactItem}>
                          <span className={styles.contactLabel}>Email:</span>
                          <span className={styles.contactValue}>{userData?.email || 'Not provided'}</span>
                        </div>
                        
                        <div className={styles.contactItem}>
                          <span className={styles.contactLabel}>Address:</span>
                          <span className={styles.contactValue}>{userData?.address || 'Not provided'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className={styles.dashboardCard}>
                  <div className={styles.accountInfo}>
                    <div className={styles.accountBalance}>
                      <h3>Account Balance</h3>
                      <div className={styles.balanceAmount}>{userData ? formatCurrency(userData.balance) : '$0.00'}</div>
                    </div>
                    
                    <div className={styles.accountStatus}>
                      <div className={styles.statusItem}>
                        <span className={styles.statusLabel}>KYC Status:</span>
                        {getKycStatus()}
                      </div>
                      
                      <div className={styles.statusItem}>
                        <span className={styles.statusLabel}>Account Created:</span>
                        <span className={styles.statusValue}>
                          {userData?.createdAt 
                            ? new Date(userData.createdAt).toLocaleDateString()
                            : 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.plaidGrid}>
              <section id="plaid-verification" className={styles.plaidVerificationSection}>
                <div className={styles.sectionHeader}>
                  <h2>Plaid Identity Verification</h2>
                </div>
                <PlaidVerification />
              </section>
              <section className={styles.dashboardCard}>
                <div className={styles.sectionHeader}>
                  <h2>External Bank Accounts</h2>
                </div>
                <PlaidBankingSection />
              </section>
            </section>

            {/* Updated Unit White Label App Section */}
            <section className={styles.dashboardSection}>
              <div className={styles.sectionHeader}>
                <h2>Banking & Transactions</h2>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  Token Status: {unitToken ? 'Ready' : 'Loading...'} | 
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
                    Loading banking interface...
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