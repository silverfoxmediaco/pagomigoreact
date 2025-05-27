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
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  
  const { updateProfile, loading, error, success } = useUserProfile();
  const modalRef = useRef(null);
  const phoneInputRef = useRef(null);

  // Handle modal animation states
  useEffect(() => {
    if (isOpen) {
      console.log('Modal opening - starting animation');
      setShouldRender(true);
      // Small delay to ensure DOM is ready before starting animation
      setTimeout(() => {
        setIsAnimating(true);
      }, 10);
    } else {
      console.log('Modal closing - starting close animation');
      setIsAnimating(false);
      // Wait for animation to complete before unmounting
      setTimeout(() => {
        setShouldRender(false);
      }, 300); // Match the CSS transition duration
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

  // Initialize intl-tel-input on mount
  useEffect(() => {
    if (shouldRender && phoneInputRef.current) {
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
  }, [shouldRender, formData.phone]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    // Get formatted phone number from intl-tel-input if available
    let profileData = { ...formData };
    if (phoneInputRef.current && phoneInputRef.current.iti) {
      profileData.phone = phoneInputRef.current.iti.getNumber();
      console.log('Phone number from intl-tel-input:', profileData.phone);
    }
    
    const result = await updateProfile(profileData);
    console.log('Update profile result:', result);
    
    if (result.success) {
      console.log('Profile updated successfully, closing modal');
      onClose();
    }
  };

  if (!shouldRender) {
    console.log('Modal NOT rendering - shouldRender is false');
    return null;
  }

  console.log('Modal SHOULD be rendering now!');
  console.log('Modal props:', { isOpen, shouldRender, isAnimating, userData: !!userData });
  console.log('CSS styles object:', styles);
  console.log('Form data:', formData);

  return (
    <div 
      className={styles['edit-profile-overlay']}
      onClick={() => console.log('Overlay clicked!')}
    >
      <div 
        className={`${styles['edit-profile-container']} ${isAnimating ? styles['slide-up'] : ''}`}
        ref={modalRef}
        onClick={(e) => {
          e.stopPropagation();
          console.log('Modal container clicked!');
        }}
      >
        <div className={styles['edit-profile-handle']}>
          <div className={styles['handle-bar']}></div>
        </div>
        
        <div className={styles['edit-profile-header']}>
          <h2>Edit Profile</h2>
          <button 
            className={styles['close-button']} 
            onClick={() => {
              console.log('Close button clicked');
              onClose();
            }}
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
              />
            </div>
            
            <div className={styles['form-group']}>
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