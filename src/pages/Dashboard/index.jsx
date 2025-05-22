// src/pages/Dashboard/index.jsx
import React, { useState, useEffect } from 'react';
import { useUserProfile } from '../../hooks/useUserProfile';
import EditProfileModal from './UserProfile/EditProfileModal';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import TransactionsList from '../../components/Transactions/TransactionsList';
import RequestsList from '../../components/Transactions/RequestsList';
import SendMoneyModal from '../../components/Transactions/SendMoneyModal';
import RequestMoneyModal from '../../components/Transactions/RequestMoneyModal';
import BankingSection from '../../components/Banking/BankingSection';
import ProfileQRCode from '../../components/ProfileQRCode';
import styles from '../../styles/Dashboard.module.css';

const Dashboard = () => {
  const { userData, loading, error } = useUserProfile();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSendMoneyModalOpen, setIsSendMoneyModalOpen] = useState(false);
  const [isRequestMoneyModalOpen, setIsRequestMoneyModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('transactions'); // 'transactions' or 'requests'
  const [unitToken, setUnitToken] = useState("demo.jwt.token"); // Replace with your actual token

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
          url: "https://ui.dev.unit.sh/resources/outlay.png",
          fontColor: "#fafafa"
        }
      ]
    }
  };

  // Add useEffect to fetch Unit JWT token from your backend when ready
  useEffect(() => {
    // Example token fetching (uncomment and implement when ready)
    // const fetchUnitToken = async () => {
    //   try {
    //     const response = await fetch('/api/unit/token');
    //     const data = await response.json();
    //     setUnitToken(data.token);
    //   } catch (err) {
    //     console.error('Failed to fetch Unit token:', err);
    //   }
    // };
    // fetchUnitToken();
  }, []);

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
            
            {/* Unit White Label App Section */}
            <section className={styles.dashboardSection}>
              <div className={styles.sectionHeader}>
                <h2>Banking & Transactions</h2>
              </div>
              <div className={styles.unitAppContainer}>
                <unit-elements-white-label-app
                  jwt-token={unitToken}
                  settings-json={JSON.stringify(unitSettings)}
                ></unit-elements-white-label-app>
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
      
      <SendMoneyModal
        isOpen={isSendMoneyModalOpen}
        onClose={() => setIsSendMoneyModalOpen(false)}
      />
      
      <RequestMoneyModal
        isOpen={isRequestMoneyModalOpen}
        onClose={() => setIsRequestMoneyModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;