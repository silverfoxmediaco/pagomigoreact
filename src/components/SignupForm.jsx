// src/components/SignupForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PhoneInput from 'react-phone-number-input';


const SignupForm = ({ onSuccess, className = '' }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Special handler for phone input
  const handlePhoneChange = (value) => {
    setFormData({
      ...formData,
      phone: value || ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    
    // Debug phone number format
    console.log('=== SIGNUP FORM DEBUG ===');
    console.log('Full form data:', formData);
    console.log('Phone field:', formData.phone);
    console.log('Phone type:', typeof formData.phone);
    console.log('Phone length:', formData.phone?.length);
    console.log('Phone starts with +:', formData.phone?.startsWith('+'));
    console.log('========================');
    
    // Basic validation
    if (!formData.name || !formData.username || !formData.password) {
      setMessage('All fields are required');
      setIsError(true);
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      setIsError(true);
      return;
    }
    
    // Phone validation - react-phone-number-input provides properly formatted numbers
    if (!formData.phone) {
      setMessage('Please enter a valid phone number');
      setIsError(true);
      return;
    }
    
    // Additional phone validation
    if (!formData.phone.startsWith('+')) {
      setMessage('Phone number must include country code');
      setIsError(true);
      return;
    }
    
    const { confirmPassword, ...signupData } = formData;
    
    console.log('=== SENDING TO REGISTER ===');
    console.log('Signup data being sent:', signupData);
    console.log('==========================');
    
    const result = await register(signupData);
    
    if (result.success) {
      if (onSuccess) {
        onSuccess();
      }
      
      if (result.testMode) {
        // In test mode, go directly to dashboard
        navigate('/dashboard');
      } else if (result.verificationNeeded) {
        // Navigate to verification page
        navigate('/verify');
      }
    } else {
      setMessage(result.error || 'Registration failed');
      setIsError(true);
    }
  };

  return (
    <div className={className}>
      {message && (
        <div className={`message ${isError ? 'error' : 'success'}`}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <PhoneInput
            placeholder="Enter phone number"
            value={formData.phone}
            onChange={handlePhoneChange}
            defaultCountry="US"
            countries={['US', 'CA', 'MX', 'GT', 'BZ', 'SV', 'HN', 'NI', 'CR', 'PA', 'CO', 'VE', 'GY', 'SR', 'BR', 'EC', 'PE', 'BO', 'PY', 'UY', 'AR', 'CL', 'ES']} 
            className="phone-input"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Choose a username"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            required
          />
        </div>
        
        <button 
          type="submit" 
          className={className.includes('modal') ? 'signup-btn' : 'primary-btn'} 
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
};

export default SignupForm;