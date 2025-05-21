// src/components/Signup.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Signup.css';
import SignupForm from './SignupForm';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const { verificationSent } = useAuth();
  const navigate = useNavigate();

  // If verification is already sent, redirect to verification page
  if (verificationSent) {
    navigate('/verify');
    return null;
  }

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>Create Your Account</h2>
        
        <SignupForm className="page-form" />
        
        <div className="login-link">
          <p>Already have an account? <Link to="/login">Log In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;