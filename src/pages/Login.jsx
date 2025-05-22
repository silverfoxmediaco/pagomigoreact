// src/provider/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/Login.css';

// Fixed import path for AuthContext - three levels up then into context
import { useAuth } from '../context/AuthContext';

// Fixed path for components - two levels up
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import SignupModal from '../components/SignupModal'; // Add this import

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await login({ username, password });
      
      if (result.success) {
        // Redirect to the page user was trying to access or dashboard
        navigate(from, { replace: true });
      } else {
        setErrorMessage(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      setErrorMessage('An error occurred during login. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openSignupModal = () => {
    console.log('Opening signup modal from login page'); // Add debug log
    window.dispatchEvent(new CustomEvent('open-signup-modal'));
  };

  return (
    <>
      <Navigation />
      
      <div className="login-container">
        <div className="login-form-container">
          <h2>Welcome Back</h2>
          <p className="login-subtitle">Login to your Pagomigo account</p>
          
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
              <div className="forgot-password">
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <div className="signup-prompt">
            Don't have an account?{' '}
            <button className="signup-link" onClick={openSignupModal}>
              Sign Up
            </button>
          </div>
        </div>
      </div>
      
      {/* Add the SignupModal component */}
      <SignupModal />
      
      <Footer />
    </>
  );
};

export default Login;