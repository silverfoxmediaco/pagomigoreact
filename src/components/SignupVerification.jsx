// src/components/SignupVerification.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/SignupVerification.css';

const SignupVerification = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  
  // EMAIL VERIFICATION (ACTIVE)
  const { verifyCode, emailForVerification, sendVerificationCode, loading } = useAuth();
  
  /* 
  // PHONE VERIFICATION (COMMENTED OUT UNTIL A2P 10DLC REGISTRATION IS COMPLETED)
  const { verifyCode, phoneForVerification, sendVerificationCode, loading } = useAuth();
  */
  
  const navigate = useNavigate();

  const handleResendCode = async () => {
    setMessage('');
    setIsError(false);
    
    // EMAIL VERIFICATION RESEND (ACTIVE)
    const name = emailForVerification ? emailForVerification.split('@')[0] : '';
    const result = await sendVerificationCode(emailForVerification, name);
    
    if (result.success) {
      setMessage('Verification email resent! Check your inbox.');
    } else {
      setMessage(result.error || 'Failed to resend verification email');
      setIsError(true);
    }
    
    /*
    // PHONE VERIFICATION RESEND (COMMENTED OUT UNTIL A2P 10DLC REGISTRATION IS COMPLETED)
    const result = await sendVerificationCode(phoneForVerification);
    
    if (result.success) {
      setMessage('Verification code resent!');
    } else {
      setMessage(result.error || 'Failed to resend code');
      setIsError(true);
    }
    */
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    
    if (!verificationCode.trim()) {
      setMessage('Please enter the verification code');
      setIsError(true);
      return;
    }
    
    if (verificationCode.length !== 6) {
      setMessage('Verification code must be 6 digits');
      setIsError(true);
      return;
    }
    
    const result = await verifyCode(verificationCode);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setMessage(result.error || 'Invalid verification code');
      setIsError(true);
    }
  };

  // Helper function to mask email for display
  const maskEmail = (email) => {
    if (!email) return '';
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) return email;
    const maskedLocal = localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1];
    return `${maskedLocal}@${domain}`;
  };

  return (
    <div className="verification-container">
      <div className="verification-card">
        {/* EMAIL VERIFICATION UI (ACTIVE) */}
        <h2>Verify Your Email</h2>
        <p>A verification code has been sent to {maskEmail(emailForVerification)}</p>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
          Check your email inbox and spam folder for the 6-digit verification code.
        </p>
        
        {/* 
        PHONE VERIFICATION UI (COMMENTED OUT UNTIL A2P 10DLC REGISTRATION IS COMPLETED)
        <h2>Verify Your Phone</h2>
        <p>A verification code has been sent to {phoneForVerification}</p>
        */}
        
        {message && (
          <div className={`message ${isError ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="verificationCode">Verification Code</label>
            <input
              type="text"
              id="verificationCode"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 6-digit verification code"
              maxLength="6"
              pattern="[0-9]{6}"
              inputMode="numeric"
            />
          </div>
          
          <button 
            type="submit" 
            className="primary-btn"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>
        
        <div className="resend-container">
          {/* EMAIL VERIFICATION RESEND (ACTIVE) */}
          <p>Didn't receive the email?</p>
          <button 
            onClick={handleResendCode} 
            className="text-btn"
            disabled={loading}
          >
            Resend Verification Email
          </button>
          
          {/* 
          PHONE VERIFICATION RESEND (COMMENTED OUT UNTIL A2P 10DLC REGISTRATION IS COMPLETED)
          <p>Didn't receive the code?</p>
          <button 
            onClick={handleResendCode} 
            className="text-btn"
            disabled={loading}
          >
            Resend Code
          </button>
          */}
        </div>
      </div>
    </div>
  );
};

export default SignupVerification;