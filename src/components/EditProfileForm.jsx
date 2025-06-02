// src/pages/Dashboard/UserProfile/EditProfileForm.jsx
import React, { useState, useEffect } from 'react';
import { useUserInfo } from '../pages/Dashboard/UserProfile/Userinfo';

const EditProfileForm = ({ onSuccess, className = '', userData }) => {
  const { updateProfile } = useUserInfo();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    address: '',
    zipCode: ''
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        username: userData.username || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        zipCode: userData.zipCode || ''
      });
    }
  }, [userData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setLoading(true);
    
    // Basic validation
    if (!formData.name || !formData.username || !formData.email) {
      setMessage('Name, username, and email are required');
      setIsError(true);
      setLoading(false);
      return;
    }
    
    try {
      // Use the updateProfile function from Userinfo
      const result = await updateProfile(formData);
      
      if (result.success) {
        setMessage(result.message || 'Profile updated successfully!');
        setIsError(false);
        
        setTimeout(() => {
          if (onSuccess) {
            onSuccess(formData); // Pass the updated data back
          }
        }, 1500);
      } else {
        setMessage(result.error || 'Failed to update profile');
        setIsError(true);
      }
    } catch (error) {
      setMessage('Failed to update profile. Please try again.');
      setIsError(true);
    } finally {
      setLoading(false);
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
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="address">Address</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter your address"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="zipCode">ZIP Code</label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            placeholder="Enter your ZIP/postal code"
          />
        </div>
        
        <button 
          type="submit" 
          className={className.includes('modal') ? 'signup-btn' : 'primary-btn'} 
          disabled={loading}
        >
          {loading ? 'Updating Profile...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default EditProfileForm;