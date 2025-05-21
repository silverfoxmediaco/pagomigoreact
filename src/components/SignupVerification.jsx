// src/components/SignupVerification.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/SignupVerification.css';

const SignupVerification = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const { verifyCode, phoneForVerification, sendVerificationCode, loading } = useAuth();
  const navigate = useNavigate();

  const handleResendCode = async () => {
    setMessage('');
    setIsError(false);
    
    const result = await sendVerificationCode(phoneForVerification);
    
    if (result.success) {
      setMessage('Verification code resent!');
    } else {
      setMessage(result.error || 'Failed to resend code');
      setIsError(true);
    }
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
    
    const result = await verifyCode(verificationCode);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setMessage(result.error || 'Invalid verification code');
      setIsError(true);
    }
  };

  return (
    <div className="verification-container">
      <div className="verification-card">
        <h2>Verify Your Phone</h2>
        <p>A verification code has been sent to {phoneForVerification}</p>
        
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
              placeholder="Enter verification code"
              maxLength="6"
            />
          </div>
          
          <button 
            type="submit" 
            className="primary-btn"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
        
        <div className="resend-container">
          <p>Didn't receive the code?</p>
          <button 
            onClick={handleResendCode} 
            className="text-btn"
            disabled={loading}
          >
            Resend Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupVerification;