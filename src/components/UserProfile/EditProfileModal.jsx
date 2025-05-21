// src/components/UserProfile/EditProfileModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useUserProfile } from '../../hooks/useUserProfile';
import styles from '../../styles/EditProfileModal.module.css';

const EditProfileModal = ({ isOpen, onClose, userData }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    address: ''
  });
  const { updateProfile, loading, error, success } = useUserProfile();
  const modalRef = useRef(null);
  const phoneInputRef = useRef(null);

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

  // Initialize intl-tel-input on mount
  useEffect(() => {
    if (isOpen && phoneInputRef.current) {
      try {
        // Check if intlTelInput is available
        if (window.intlTelInput) {
          const iti = window.intlTelInput(phoneInputRef.current, {
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.13/js/utils.js",
            preferredCountries: ['us', 'ca', 'mx'],
            separateDialCode: true,
            initialCountry: 'us'
          });
          
          // Set initial value
          if (formData.phone) {
            iti.setNumber(formData.phone);
          }
          
          // Store the instance for later use
          phoneInputRef.current.iti = iti;
          
          // Return cleanup function
          return () => {
            if (phoneInputRef.current && phoneInputRef.current.iti) {
              phoneInputRef.current.iti.destroy();
            }
          };
        }
      } catch (error) {
        console.error('Error initializing phone input:', error);
      }
    }
  }, [isOpen, formData.phone]);

  // Handle click outside modal to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get formatted phone number from intl-tel-input if available
    let profileData = { ...formData };
    if (phoneInputRef.current && phoneInputRef.current.iti) {
      profileData.phone = phoneInputRef.current.iti.getNumber();
    }
    
    const result = await updateProfile(profileData);
    
    if (result.success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.editModalOverlay}>
      <div className={styles.editModalContainer} ref={modalRef}>
        <div className={styles.editModalHeader}>
          <h2>Edit Profile</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>
        
        <div className={styles.editModalBody}>
          {error && <div className={styles.errorMessage}>{error}</div>}
          {success && <div className={styles.successMessage}>{success}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="edit-name">Full Name</label>
              <input
                type="text"
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="edit-username">Username</label>
              <input
                type="text"
                id="edit-username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="edit-email">Email</label>
              <input
                type="email"
                id="edit-email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="edit-phone">Phone Number</label>
              <input
                type="tel"
                id="edit-phone"
                name="phone"
                ref={phoneInputRef}
                defaultValue={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </div>
            
            <div className={styles.formGroup}>
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
            
            <div className={styles.editModalActions}>
              <button 
                type="button" 
                className={styles.cancelBtn}
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className={styles.saveBtn}
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