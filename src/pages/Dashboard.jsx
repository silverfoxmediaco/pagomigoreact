// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { useLanguage } from '../context/LanguageContext';
import EditProfileModal from '../components/UserProfile/EditProfileModal';
import Navigation from '../components/Navigation';
import PlaidVerification from '../Plaid/PlaidVerification';
import PlaidBankingSection from '../Plaid/PlaidBankingSection';
import PersonaVerification from '../Persona/PersonaVerification';
import Footer from '../components/Footer';
import BankingSection from '../UnitBanking/BankingSection';
import ProfileQRCode from '../ProfileQRCode';
import styles from '../styles/Dashboard.module.css';

// Quick Plaid Debug Component - Inline for testing
const QuickPlaidDebug = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (endpoint, method = 'GET', body = null) => {
    const token = localStorage.getItem('token');
    const baseURL = process.env.REACT_APP_API_BASE || '';
    const url = `${baseURL}/api/plaid${endpoint}`;
    
    console.log(`Testing: ${method} ${url}`);
    console.log(`Token: ${token ? token.substring(0, 20) + '...' : 'NO TOKEN'}`);
    
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      
      console.log(`Response status: ${response.status}`);
      console.log(`Response ok: ${response.ok}`);
      
      let responseData;
      try {
        responseData = await response.json();
        console.log('Response data:', responseData);
      } catch (parseError) {
        const textData = await response.text();
        console.log('Response text:', textData);
        responseData = { error: `Could not parse JSON: ${textData}` };
      }

      return {
        status: response.status,
        ok: response.ok,
        data: responseData
      };
    } catch (error) {
      console.error('Network error:', error);
      return {
        status: 'Network Error',
        ok: false,
        data: { error: error.message }
      };
    }
  };

  const runTest = async (testName, endpoint, method = 'GET', body = null) => {
    setLoading(true);
    console.log(`\n=== RUNNING TEST: ${testName} ===`);
    
    const result = await testEndpoint(endpoint, method, body);
    
    setResults(prev => ({
      ...prev,
      [testName]: result
    }));
    
    setLoading(false);
    return result;
  };

  const runAllTests = async () => {
    console.log('=== Starting Plaid Debug Tests ===');
    
    // Test 1: Check if API is alive (fix path)
    await runTest('API Ping', '', 'GET'); // This will test /api/plaid which should fail, then we'll test /api/ping
    
    // Test 1b: Test actual ping endpoint
    const token = localStorage.getItem('token');
    const baseURL = process.env.REACT_APP_API_BASE || '';
    try {
      const pingResult = await fetch(`${baseURL}/api/ping`);
      console.log('Direct ping test:', pingResult.ok ? 'SUCCESS' : 'FAILED');
    } catch (e) {
      console.log('Direct ping failed:', e.message);
    }
    
    // Test 2: Check Plaid config (if endpoint exists)
    await runTest('Plaid Config', '/debug/config', 'GET');
    
    // Test 3: Try bank link token (simpler)
    await runTest('Bank Link Token', '/link-token', 'POST');
    
    // Test 4: Try IDV link token (the failing one)
    await runTest('IDV Link Token', '/identity-verification/create', 'POST');
    
    // Test 5: Check IDV status
    await runTest('IDV Status', '/identity-verification/status', 'GET');
    
    console.log('=== All tests completed ===');
  };

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return { valid: false, message: 'No token found' };
    }
    
    try {
      // Basic JWT structure check
      const parts = token.split('.');
      if (parts.length !== 3) {
        return { valid: false, message: 'Invalid JWT format' };
      }
      
      // Decode payload (don't verify signature in frontend)
      const payload = JSON.parse(atob(parts[1]));
      const now = Date.now() / 1000;
      
      if (payload.exp && payload.exp < now) {
        return { valid: false, message: 'Token expired' };
      }
      
      return { 
        valid: true, 
        message: 'Token appears valid',
        userId: payload.userId,
        exp: payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'No expiration'
      };
    } catch (error) {
      return { valid: false, message: `Token decode error: ${error.message}` };
    }
  };

  const authStatus = checkAuth();

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f5f5f5', 
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '14px',
      marginBottom: '20px'
    }}>
      <h3>Plaid Debug Tool</h3>
      
      {/* Auth Status */}
      <div style={{
        padding: '10px',
        backgroundColor: authStatus.valid ? '#e8f5e9' : '#ffebee',
        borderRadius: '5px',
        marginBottom: '15px'
      }}>
        <strong>Auth Status:</strong> {authStatus.valid ? 'VALID' : 'INVALID'} - {authStatus.message}
        {authStatus.valid && (
          <div style={{ fontSize: '12px', marginTop: '5px' }}>
            User ID: {authStatus.userId}<br/>
            Expires: {authStatus.exp}
          </div>
        )}
      </div>

      {/* Test Button */}
      <button 
        onClick={runAllTests}
        disabled={loading || !authStatus.valid}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#ccc' : '#0033cc',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? 'Running Tests...' : 'Run Debug Tests'}
      </button>

      {/* Results */}
      <div>
        {Object.entries(results).map(([testName, result]) => (
          <div key={testName} style={{
            marginBottom: '15px',
            padding: '10px',
            backgroundColor: result.ok ? '#e8f5e9' : '#ffebee',
            borderRadius: '5px'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
              {result.ok ? 'SUCCESS' : 'FAILED'} - {testName} - Status: {result.status}
            </div>
            
            <details>
              <summary style={{ cursor: 'pointer', fontSize: '12px' }}>
                Click to see details
              </summary>
              <pre style={{
                backgroundColor: '#f0f0f0',
                padding: '10px',
                borderRadius: '3px',
                overflow: 'auto',
                fontSize: '11px',
                marginTop: '5px'
              }}>
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </details>
          </div>
        ))}
      </div>

      {/* Instructions */}
      {!authStatus.valid && (
        <div style={{
          padding: '15px',
          backgroundColor: '#fff3cd',
          borderRadius: '5px',
          marginTop: '15px'
        }}>
          <strong>Warning: Please login first</strong><br/>
          You need to be authenticated to test Plaid endpoints.
        </div>
      )}

      <div style={{
        padding: '15px',
        backgroundColor: '#e3f2fd',
        borderRadius: '5px',
        marginTop: '15px',
        fontSize: '12px'
      }}>
        <strong>Current Status Analysis:</strong><br/>
        1. Open browser console (F12) to see detailed logs<br/>
        2. Bank Link Token: Still seeing identity_verification error - restart server completely<br/>
        3. IDV Link Token: Session already exists - this is normal, Plaid reuses existing sessions<br/>
        4. If you see "already exists" - your IDV is actually working correctly<br/>
        5. Try testing Plaid Link in your actual PlaidVerification component now
      </div>
    </div>
  );
};

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
            {/* DEBUG SECTION - Remove this after fixing Plaid */}
            <section className={styles.dashboardSection}>
              <div className={styles.sectionHeader}>
                <h2>Plaid Debug Tool (Remove after fixing)</h2>
              </div>
              <QuickPlaidDebug />
            </section>

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
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.plaidGrid}>

              {/* Plaid Identity Verification Section */}
              <section id="plaid-verification" className={styles.plaidVerificationSection}>
                <div className={styles.sectionHeader}>
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

            {/* Persona ID Verification Section */}
            <section className={styles.dashboardCard}>
              <div className={styles.sectionHeader}>
                <h2>Persona Identity Verification</h2>
              </div>
              <PersonaVerification />
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