// src/pages/UnitBanking/index.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import styles from './UnitBanking.module.css';
import { API_BASE } from '../config';

const UnitBankingPage = () => {
  const [jwtToken, setJwtToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Verify authentication
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Fetch JWT token for Unit
    const fetchUnitToken = async () => {
      try {
        setIsLoading(true);
        
        // For development with mock data
        if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
          console.log('Using mock JWT for Unit');
          setJwtToken('demo.jwt.token');
          setIsLoading(false);
          return;
        }
        
        // For production with real API
        const response = await fetch(`${API_BASE}/api/unit/jwt-token`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to get Unit authentication token');
        }
        
        const data = await response.json();
        
        if (data.jwtToken) {
          setJwtToken(data.jwtToken);
        } else {
          throw new Error('Invalid token received');
        }
      } catch (err) {
        console.error('Error fetching Unit JWT token:', err);
        setError('Could not initialize banking module. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUnitToken();
  }, [navigate]);
  
  // Handle message events from Unit's iframe
  useEffect(() => {
    const handleUnitMessage = (event) => {
      // Make sure the message is from Unit
      if (event.origin.includes('unit.sh') || event.origin.includes('unit.co')) {
        console.log('Message from Unit:', event.data);
        
        // Handle different event types here
        // For example, if user completes an action or needs to navigate elsewhere
      }
    };
    
    window.addEventListener('message', handleUnitMessage);
    
    return () => {
      window.removeEventListener('message', handleUnitMessage);
    };
  }, []);
  
  return (
    <div className={styles.bankingPageContainer}>
      <Navigation />
      
      <main className={styles.bankingPageContent}>
        <h1>Your Banking</h1>
        
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <p>Loading your banking experience...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p>{error}</p>
            <button 
              className={styles.retryButton}
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className={styles.unitComponentContainer}>
            {/* The Unit White Label Banking Component */}
            <unit-elements-white-label-app
              jwt-token={jwtToken}
            ></unit-elements-white-label-app>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default UnitBankingPage;