// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_BASE } from '../config'; // Add this if you have a config file with API_BASE

// Create the auth context
const AuthContext = createContext();

// Provider component that wraps your app and makes auth object available to any child component that calls useAuth()
export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationSent, setVerificationSent] = useState(false);
  const [phoneForVerification, setPhoneForVerification] = useState('');

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if there's a token in localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setIsAuthenticated(false);
          setUser(null);
          setLoading(false);
          return;
        }
        
        // For development purposes, let's set some mock user data
        // In production, uncomment the API call to verify token
        setIsAuthenticated(true);
        
        // If you have user info stored in localStorage, you can use that
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
          setUser(JSON.parse(userInfo));
        } else {
          // Mock user data for development
          setUser({
            name: 'Demo User',
            username: 'demouser',
            phone: '+12345678901',
            phone_verified: true,
            email: 'demo@example.com',
            address: '123 Main St',
            kyc_status: 'pending',
            balance: 500,
            createdAt: new Date().toISOString()
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Login
  const login = async (credentials) => {
    try {
      // For development, you can use this mock response
      // In production, uncomment the API call
      /*
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      
      const data = await response.json();
      
      // Save token and user info
      localStorage.setItem('token', data.token);
      
      if (data.user) {
        localStorage.setItem('userInfo', JSON.stringify(data.user));
        setUser(data.user);
      }
      */
      
      // Mock response for development
      console.log('Login with:', credentials);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock token and user
      const token = 'mock-token-' + Date.now();
      const mockUser = {
        name: 'Demo User',
        username: 'demouser',
        phone: credentials.phone,
        phone_verified: true,
        email: 'demo@example.com',
        address: '123 Main St',
        kyc_status: 'pending',
        balance: 500,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('token', token);
      localStorage.setItem('userInfo', JSON.stringify(mockUser));
      
      setUser(mockUser);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  // Register
  const register = async (userData) => {
    try {
      // For development, you can use this mock response
      // In production, uncomment the API call
      /*
      const response = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
      
      const data = await response.json();
      */
      
      // Mock response for development
      console.log('Register with:', userData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response
      const mockResponse = {
        success: true,
        testMode: true, // For bypassing verification
        token: 'mock-token-' + Date.now()
      };
      
      if (mockResponse.testMode) {
        // Auto-login in test mode
        const token = mockResponse.token;
        const mockUser = {
          name: userData.name,
          username: userData.username,
          phone: userData.phone,
          phone_verified: true,
          email: '',
          address: '',
          kyc_status: 'pending',
          balance: 500,
          createdAt: new Date().toISOString()
        };
        
        localStorage.setItem('token', token);
        localStorage.setItem('userInfo', JSON.stringify(mockUser));
        
        setUser(mockUser);
        setIsAuthenticated(true);
        
        return { success: true, testMode: true };
      } else {
        // Set verification state
        setPhoneForVerification(userData.phone);
        setVerificationSent(true);
        
        return { success: true, verificationNeeded: true };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: error.message };
    }
  };

  // Verify code (for SMS verification)
  const verifyCode = async (code) => {
    try {
      // For development, simulate verification
      console.log('Verifying code:', code, 'for phone:', phoneForVerification);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful verification
      const token = 'mock-token-' + Date.now();
      const mockUser = {
        name: 'New User',
        username: 'newuser',
        phone: phoneForVerification,
        phone_verified: true,
        email: '',
        address: '',
        kyc_status: 'pending',
        balance: 500,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('token', token);
      localStorage.setItem('userInfo', JSON.stringify(mockUser));
      
      setUser(mockUser);
      setIsAuthenticated(true);
      setVerificationSent(false);
      setPhoneForVerification('');
      
      return { success: true };
    } catch (error) {
      console.error('Verification error:', error);
      return { success: false, error: error.message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Call logout API if available
      if (token) {
        try {
          // Uncomment for production
          /*
          await fetch(`${API_BASE}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          */
          console.log('Logging out...');
        } catch (error) {
          console.warn('Logout API error:', error);
          // Continue with local logout even if API call fails
        }
      }
      
      // Remove token and user info
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      
      // Unit cleanup (uncomment when using production tokens)
      // localStorage.removeItem('unitCustomerToken');
      // localStorage.removeItem('unitVerifiedCustomerToken');
      
      setIsAuthenticated(false);
      setUser(null);
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      
      // Still clear local auth state even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      
      // Unit cleanup (uncomment when using production tokens)
      // localStorage.removeItem('unitCustomerToken');
      // localStorage.removeItem('unitVerifiedCustomerToken');
      
      setIsAuthenticated(false);
      setUser(null);
      
      return { success: true, warning: 'Logged out locally but server logout failed' };
    }
  };

  // Context value
  const contextValue = {
    isAuthenticated,
    user,
    loading,
    verificationSent,
    phoneForVerification,
    login,
    register,
    logout,
    verifyCode
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;