// src/pages/Dashboard/UserProfile/EditProfileModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/SignupModal.css'; // Use the same CSS file
import EditProfileForm from '../../../components/EditProfileForm';

const EditProfileModal = ({ isOpen: propIsOpen, onClose, userData }) => {
  console.log('EditProfileModal rendered with isOpen:', propIsOpen);
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  const modalRef = useRef(null);

  // Use props if provided, otherwise use internal state
  const isOpen = propIsOpen !== undefined ? propIsOpen : internalIsOpen;
  const closeModal = onClose || (() => setInternalIsOpen(false));

  // Handle opening animation
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable body scroll when modal closes
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Listen for custom event to open modal (for backward compatibility)
  useEffect(() => {
    const handleOpenModal = () => {
      console.log('Custom event received - opening edit profile modal');
      if (propIsOpen === undefined) {
        setInternalIsOpen(true);
      }
    };

    window.addEventListener('open-edit-profile-modal', handleOpenModal);
    
    return () => {
      window.removeEventListener('open-edit-profile-modal', handleOpenModal);
    };
  }, [propIsOpen]);

  // Handle click on overlay to close
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Handle close with animation
  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      closeModal();
    }, 300); // Match the CSS animation duration
  };

  // Handle escape key to close modal
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

  // Handle successful profile update
  const handleUpdateSuccess = () => {
    handleClose();
  };

  console.log('Modal state - isOpen:', isOpen, 'isAnimating:', isAnimating);
  
  if (!isOpen) {
    return null;
  }

  return (
    <div className="slide-modal-overlay" onClick={handleOverlayClick}>
      <div 
        className={`slide-modal-container ${isAnimating ? 'slide-up' : 'slide-down'}`}
        ref={modalRef}
      >
        <div className="slide-modal-handle">
          <div className="handle-bar"></div>
        </div>
        
        <div className="slide-modal-header">
          <h2>Edit Profile</h2>
          <button className="close-button" onClick={handleClose}>&times;</button>
        </div>
        
        <div className="slide-modal-body">
          <EditProfileForm 
            onSuccess={handleUpdateSuccess} 
            className="slide-modal-form"
            userData={userData}
          />
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;