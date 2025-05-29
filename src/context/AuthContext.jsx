// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_BASE } from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [phoneForVerification, setPhoneForVerification] = useState('');
  const [pendingUserData, setPendingUserData] = useState(null); // Store user data during verification

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      
      try {
        // Verify token with backend
        const response = await fetch(`${API_BASE}/api/user/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // Token invalid, clear it
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Authentication check failed:', err);
        setError('Authentication check failed');
        setIsAuthenticated(false);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Register function - now uses Twilio verification
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Store user data for after verification
      setPendingUserData(userData);
      
      // Send SMS verification using Twilio
      const verificationResult = await sendVerificationCode(userData.phone);
      
      if (verificationResult.success) {
        setPhoneForVerification(userData.phone);
        setVerificationSent(true);
        return { success: true, verificationNeeded: true };
      } else {
        return { success: false, error: verificationResult.error };
      }
      
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Send verification code using NEW Twilio endpoint
  const sendVerificationCode = async (phone) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call your NEW Twilio endpoint
      const response = await fetch(`${API_BASE}/api/sms/send-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phoneNumber: phone }) // Note: phoneNumber not phone
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send verification code');
      }
      
      setPhoneForVerification(phone);
      setVerificationSent(true);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Verify code using NEW Twilio endpoint
  const verifyCode = async (code) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!phoneForVerification) {
        throw new Error('Phone number not found');
      }
      
      // Call your NEW Twilio verification endpoint
      const response = await fetch(`${API_BASE}/api/sms/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: phoneForVerification, // Note: phoneNumber not phone
          code: code
        })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Verification failed');
      }
      
      if (!data.verified) {
        throw new Error('Invalid verification code');
      }
      
      // Now that phone is verified, create the user account
      if (pendingUserData) {
        const accountResult = await createUserAccount(pendingUserData);
        if (accountResult.success) {
          // Store token and set authenticated state
          localStorage.setItem('token', accountResult.token);
          setUser(accountResult.user);
          setIsAuthenticated(true);
          setVerificationSent(false);
          setPhoneForVerification('');
          setPendingUserData(null);
          
          return { success: true };
        } else {
          throw new Error(accountResult.error || 'Failed to create account');
        }
      } else {
        throw new Error('User data not found');
      }
      
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Create user account after verification (you'll need this endpoint in your backend)
  const createUserAccount = async (userData) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...userData,
          phoneVerified: true // Mark phone as verified
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Account creation failed');
      }
      
      return { success: true, token: data.token, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Login function (unchanged)
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Store token
      localStorage.setItem('token', data.token);
      
      // Set authenticated state
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function (unchanged)
  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Call logout endpoint (optional)
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Always clear local state regardless of server response
      localStorage.removeItem('token');
      
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Get user profile (unchanged)
  const getUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsAuthenticated(false);
        throw new Error('Not authenticated');
      }
      
      const response = await fetch(`${API_BASE}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      
      const userData = await response.json();
      setUser(userData);
      return userData;
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      error,
      verificationSent,
      phoneForVerification,
      register,
      login,
      logout,
      sendVerificationCode,
      verifyCode,
      getUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for accessing auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;