// src/components/SignupForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PhoneInput from 'react-phone-number-input';

// ZIP/Postal code validation and routing logic for all Spanish-speaking countries
const determineVerificationService = (zipCode) => {
  if (!zipCode) return 'persona'; // Default fallback
  
  const cleanZip = zipCode.replace(/\s/g, '').toUpperCase();
  
  // US ZIP codes (5 digits or 5+4 format) - Route to Plaid
  if (/^\d{5}(-?\d{4})?$/.test(cleanZip)) {
    const numericZip = parseInt(cleanZip.split('-')[0]);
    if (isUSZipRange(numericZip)) {
      return 'plaid';
    }
  }
  
  // Canadian postal codes (A1A1A1 or A1A 1A1 format) - Route to Plaid
  if (/^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(cleanZip)) {
    return 'plaid';
  }
  
  // UK postal codes (various formats) - Route to Plaid
  if (/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i.test(cleanZip)) {
    return 'plaid';
  }
  
  // Spanish postal codes (5 digits, 01000-52999) - Route to Persona
  if (/^\d{5}$/.test(cleanZip)) {
    const numericZip = parseInt(cleanZip);
    if (numericZip >= 1000 && numericZip <= 52999) {
      return 'persona';
    }
  }
  
  // Mexican postal codes (5 digits, 01000-99999) - Route to Persona
  if (/^\d{5}$/.test(cleanZip)) {
    const numericZip = parseInt(cleanZip);
    if (numericZip >= 1000 && numericZip <= 99999 && !isUSZipRange(numericZip)) {
      return 'persona';
    }
  }
  
  // Colombian postal codes (6 digits) - Route to Persona
  if (/^\d{6}$/.test(cleanZip)) {
    return 'persona';
  }
  
  // Venezuelan postal codes (4 digits) - Route to Persona
  if (/^\d{4}$/.test(cleanZip)) {
    return 'persona';
  }
  
  // Argentinian postal codes (4 digits or 8 alphanumeric) - Route to Persona
  if (/^\d{4}$/.test(cleanZip) || /^[A-Z]\d{4}[A-Z]{3}$/.test(cleanZip)) {
    return 'persona';
  }
  
  // Chilean postal codes (7 digits) - Route to Persona
  if (/^\d{7}$/.test(cleanZip)) {
    return 'persona';
  }
  
  // Peruvian postal codes (5 digits, Lima 15000-15999, others vary) - Route to Persona
  if (/^\d{5}$/.test(cleanZip)) {
    const numericZip = parseInt(cleanZip);
    if (numericZip >= 15000 && numericZip <= 15999) { // Lima
      return 'persona';
    }
    if (numericZip >= 4000 && numericZip <= 23999) { // Other Peru regions
      return 'persona';
    }
  }
  
  // Ecuadorian postal codes (6 digits) - Route to Persona
  if (/^\d{6}$/.test(cleanZip)) {
    return 'persona';
  }
  
  // Bolivian postal codes (no standardized system, often no postal codes) - Route to Persona
  // Paraguayan postal codes (4 digits) - Route to Persona
  if (/^\d{4}$/.test(cleanZip)) {
    return 'persona';
  }
  
  // Uruguayan postal codes (5 digits) - Route to Persona
  if (/^\d{5}$/.test(cleanZip)) {
    const numericZip = parseInt(cleanZip);
    if (numericZip >= 10000 && numericZip <= 99999) {
      return 'persona';
    }
  }
  
  // Central American countries - Route to Persona
  // Guatemala, El Salvador, Honduras, Nicaragua, Costa Rica, Panama
  // Most use 5-digit codes or no standardized system
  if (/^\d{5}$/.test(cleanZip)) {
    const numericZip = parseInt(cleanZip);
    // Guatemala: 01001-22027
    if (numericZip >= 1001 && numericZip <= 22027) {
      return 'persona';
    }
    // Costa Rica: 10000-70000s
    if (numericZip >= 10000 && numericZip <= 79999) {
      return 'persona';
    }
  }
  
  // Dominican Republic (5 digits) - Route to Persona
  if (/^\d{5}$/.test(cleanZip)) {
    const numericZip = parseInt(cleanZip);
    if (numericZip >= 10100 && numericZip <= 91000) {
      return 'persona';
    }
  }
  
  // Puerto Rico (US territory, 5+4 digits starting with 006-009) - Route to Plaid
  if (/^00[6-9]\d{2}(-?\d{4})?$/.test(cleanZip)) {
    return 'plaid';
  }
  
  // Default for any unrecognized format - Route to Persona
  return 'persona';
};

// Helper to distinguish US ZIP codes from other 5-digit codes
const isUSZipRange = (zip) => {
  // US ZIP code ranges (comprehensive)
  const usRanges = [
    [501, 544],      // Arkansas
    [550, 567],      // Arkansas  
    [601, 647],      // Mississippi
    [650, 658],      // Mississippi
    [660, 662],      // Mississippi
    [700, 714],      // Louisiana
    [716, 738],      // Louisiana
    [750, 799],      // Texas
    [800, 816],      // Colorado
    [820, 831],      // Wyoming/Colorado
    [832, 838],      // Idaho
    [840, 847],      // Utah
    [850, 860],      // Arizona
    [863, 865],      // Arizona
    [870, 884],      // New Mexico
    [889, 891],      // Nevada
    [893, 898],      // Nevada
    [900, 961],      // California
    [970, 986],      // Oregon/Washington
    [990, 994],      // Washington
    [995, 999],      // Alaska
    [1000, 2799],    // Massachusetts/Rhode Island/New Hampshire/Maine/Vermont
    [3000, 3899],    // Pennsylvania/New Jersey
    [4000, 4999],    // Kentucky/Indiana
    [5000, 5999],    // Iowa/Minnesota/Wisconsin/South Dakota/North Dakota
    [6000, 6999],    // Illinois/Kansas/Missouri/Nebraska
    [7000, 7999],    // Arkansas/Louisiana/Oklahoma/Texas
    [8000, 8999],    // Colorado/Montana/North Dakota/South Dakota/Utah/Wyoming
    [9000, 9999],    // California/Nevada/Oregon/Washington/Alaska/Hawaii
    [10000, 14999],  // New York/Pennsylvania/Delaware
    [15000, 19699],  // Pennsylvania/Delaware
    [20000, 20599],  // Washington DC
    [20600, 21999],  // Maryland
    [22000, 24699],  // Virginia/West Virginia
    [25000, 26999],  // West Virginia
    [27000, 28999],  // North Carolina/South Carolina
    [29000, 29999],  // South Carolina
    [30000, 39999],  // Georgia/Florida/Alabama/Tennessee/Mississippi
    [40000, 42799],  // Kentucky/Indiana
    [43000, 45999],  // Ohio
    [46000, 47999],  // Indiana
    [48000, 49999],  // Michigan
    [50000, 52999],  // Iowa/Minnesota
    [53000, 54999],  // Wisconsin
    [55000, 56999],  // Minnesota
    [57000, 57999],  // South Dakota
    [58000, 58999],  // North Dakota
    [59000, 59999],  // Montana
    [60000, 62999],  // Illinois
    [63000, 65999],  // Missouri
    [66000, 67999],  // Kansas
    [68000, 69999],  // Nebraska
    [70000, 71499],  // Louisiana
    [71600, 72999],  // Arkansas
    [73000, 74999],  // Oklahoma
    [75000, 79999],  // Texas
    [80000, 81999],  // Colorado
    [82000, 83199],  // Wyoming
    [83200, 83999],  // Idaho
    [84000, 84999],  // Utah
    [85000, 86999],  // Arizona
    [87000, 88499],  // New Mexico
    [89000, 89999],  // Nevada
    [90000, 96199],  // California
    [96700, 96999],  // Hawaii
    [97000, 97999],  // Oregon
    [98000, 99499]   // Washington
  ];
  
  return usRanges.some(([min, max]) => zip >= min && zip <= max);
};

const SignupForm = ({ onSuccess, className = '' }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: '',
    zipCode: '' // Add ZIP code field
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
    
    // Debug email and form data
    console.log('=== SIGNUP FORM DEBUG ===');
    console.log('Full form data:', formData);
    console.log('Email field:', formData.email);
    console.log('Email type:', typeof formData.email);
    console.log('Phone field:', formData.phone);
    console.log('ZIP Code field:', formData.zipCode);
    console.log('========================');
    
    // Basic validation - email and ZIP code are now required, phone is optional
    if (!formData.name || !formData.email || !formData.username || !formData.password || !formData.zipCode) {
      setMessage('Name, email, username, password, and ZIP/postal code are required');
      setIsError(true);
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage('Please enter a valid email address');
      setIsError(true);
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      setIsError(true);
      return;
    }
    
    // Phone validation is now optional
    if (formData.phone && !formData.phone.startsWith('+')) {
      setMessage('Phone number must include country code (or leave blank)');
      setIsError(true);
      return;
    }

    // ZIP code validation
    if (!formData.zipCode.trim()) {
      setMessage('ZIP/postal code is required');
      setIsError(true);
      return;
    }
    
    // Determine verification service based on ZIP code
    const verificationService = determineVerificationService(formData.zipCode);
    console.log('Determined verification service:', verificationService, 'for ZIP:', formData.zipCode);
    
    const { confirmPassword, ...signupData } = formData;
    
    // Add verification service to signup data
    signupData.verificationService = verificationService;
    
    console.log('=== SENDING TO REGISTER ===');
    console.log('Signup data being sent:', signupData);
    console.log('==========================');
    
    const result = await register(signupData);
    
    if (result.success) {
      // Store verification service for onboarding
      localStorage.setItem('verificationService', verificationService);
      
      if (onSuccess) {
        onSuccess();
      }
      
      if (result.testMode) {
        // In test mode, go directly to dashboard
        navigate('/dashboard');
      } else if (result.verificationNeeded) {
        // Navigate to verification page
        navigate('/verify');
      } else {
        // Navigate to onboarding verification
        navigate('/onboarding/verify');
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
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email address"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Phone Number (Optional)</label>
          <PhoneInput
            placeholder="Enter phone number (optional)"
            value={formData.phone}
            onChange={handlePhoneChange}
            defaultCountry="US"
            countries={['US', 'CA', 'MX', 'GT', 'BZ', 'SV', 'HN', 'NI', 'CR', 'PA', 'CO', 'VE', 'GY', 'SR', 'BR', 'EC', 'PE', 'BO', 'PY', 'UY', 'AR', 'CL', 'ES']} 
            className="phone-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="zipCode">ZIP/Postal Code</label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            placeholder="US: 12345, Canada: A1A 1A1, Mexico: 01234, Spain: 28001"
            required
          />
          <small style={{ color: '#666', fontSize: '0.9rem', display: 'block', marginTop: '0.25rem' }}>
            Enter your postal code to get the best identity verification for your country
          </small>
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