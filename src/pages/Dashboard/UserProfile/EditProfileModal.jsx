// src/components/UserProfile/EditProfileModal.jsx
import React, { useState, useEffect } from 'react';
import '../../../styles/EditProfileModal.module.css';

const EditProfileModal = ({ isOpen, onClose, userData }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Initialize form data when userData changes
  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        username: userData.username || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || ''
      });
    }
  }, [userData]);

  // Handle opening animation
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle close with animation
  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
      setMessage('');
    }, 300);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Here you would normally make an API call to update the user profile
      // For now, we'll simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setMessage('Profile updated successfully!');
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="edit-profile-overlay" onClick={handleOverlayClick}>
      <div className={`edit-profile-container ${isAnimating ? 'slide-up' : 'slide-down'}`}>
        <div className="edit-profile-handle">
          <div className="handle-bar"></div>
        </div>
        
        <div className="edit-profile-header">
          <h2>Edit Profile</h2>
          <button className="close-button" onClick={handleClose}>&times;</button>
        </div>
        
        <div className="edit-profile-body">
          {message && (
            <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
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
                onChange={handleInputChange}
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
                onChange={handleInputChange}
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
                onChange={handleInputChange}
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
                onChange={handleInputChange}
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
                onChange={handleInputChange}
                placeholder="Enter your address"
              />
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="save-btn"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;