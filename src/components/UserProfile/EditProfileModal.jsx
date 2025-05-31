// src/components/UserProfile/EditProfileModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import styles from '../../styles/EditProfileModal.module.css';

const EditProfileModal = ({ isOpen, onClose, userData }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const modalRef = useRef(null);
  const phoneInputRef = useRef(null);

  // Handle modal animation states
  useEffect(() => {
    if (isOpen) {
      console.log('Modal opening - starting animation');
      setShouldRender(true);
      setTimeout(() => {
        setIsAnimating(true);
      }, 10);
    } else {
      console.log('Modal closing - starting close animation');
      setIsAnimating(false);
      setTimeout(() => {
        setShouldRender(false);
      }, 300);
    }
  }, [isOpen]);

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

  // Handle click outside modal to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (shouldRender) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [shouldRender, onClose]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (shouldRender) {
      document.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [shouldRender, onClose]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Custom updateProfile function that calls your API directly
  const updateProfile = async (profileData) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Updating profile with data:', profileData);

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const result = await response.json();
      console.log('Profile update result:', result);
      
      return { success: true, data: result };
    } catch (err) {
      console.error('Error updating profile:', err);
      return { success: false, error: err.message };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    console.log('Form submitted with data:', formData);
    
    // Basic validation
    if (!formData.name || !formData.username || !formData.email) {
      setError('Name, username, and email are required');
      setLoading(false);
      return;
    }
    
    try {
      const result = await updateProfile(formData);
      
      if (result.success) {
        setSuccess('Profile updated successfully!');
        console.log('Profile updated successfully, closing modal in 1.5s');
        
        setTimeout(() => {
          onClose();
          // Force dashboard to refetch user data by dispatching a custom event
          window.dispatchEvent(new CustomEvent('profile-updated'));
        }, 1500);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <div 
      className={styles['edit-profile-overlay']}
    >
      <div 
        className={`${styles['edit-profile-container']} ${isAnimating ? styles['slide-up'] : ''}`}
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles['edit-profile-handle']}>
          <div className={styles['handle-bar']}></div>
        </div>
        
        <div className={styles['edit-profile-header']}>
          <h2>Edit Profile</h2>
          <button 
            className={styles['close-button']} 
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        
        <div className={styles['edit-profile-body']}>
          {error && <div className={`${styles.message} ${styles.error}`}>{error}</div>}
          {success && <div className={`${styles.message} ${styles.success}`}>{success}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className={styles['form-group']}>
              <label htmlFor="edit-name">Full Name</label>
              <input
                type="text"
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div className={styles['form-group']}>
              <label htmlFor="edit-username">Username</label>
              <input
                type="text"
                id="edit-username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                required
              />
            </div>
            
            <div className={styles['form-group']}>
              <label htmlFor="edit-email">Email</label>
              <input
                type="email"
                id="edit-email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className={styles['form-group']}>
              <label htmlFor="edit-phone">Phone Number</label>
              <input
                type="tel"
                id="edit-phone"
                name="phone"
                ref={phoneInputRef}
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </div>
            
            <div className={styles['form-group']}>
              <label htmlFor="edit-address">Address</label>
              <input
                type="text"
                id="edit-address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your address"
              />
            </div>
            
            <div className={styles['form-actions']}>
              <button 
                type="button" 
                className={styles['cancel-btn']}
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className={styles['save-btn']}
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