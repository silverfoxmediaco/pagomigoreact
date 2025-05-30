// src/components/SignupModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/SignupModal.css';
import SignupForm from './SignupForm';

const SignupModal = ({ isOpen: propIsOpen, onClose }) => {
  console.log('SignupModal rendered with isOpen:', propIsOpen);
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsError, setShowTermsError] = useState(false);
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

  // Listen for custom event to open modal
  useEffect(() => {
    const handleOpenModal = () => {
      console.log('Custom event received - opening modal');
      if (propIsOpen === undefined) {
        setInternalIsOpen(true);
      }
    };

    window.addEventListener('open-signup-modal', handleOpenModal);
    
    return () => {
      window.removeEventListener('open-signup-modal', handleOpenModal);
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
    // Reset form state when closing
    setTermsAccepted(false);
    setShowTermsError(false);
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
  }, [isOpen, handleClose]);

  // Handle successful signup
  const handleSignupSuccess = () => {
    // Check terms acceptance before allowing signup to proceed
    if (!termsAccepted) {
      setShowTermsError(true);
      return false; // Prevent signup from proceeding
    }
    
    setShowTermsError(false);
    handleClose();
    return true;
  };

  // Handle terms checkbox change
  const handleTermsChange = (e) => {
    setTermsAccepted(e.target.checked);
    if (e.target.checked) {
      setShowTermsError(false);
    }
  };

  // Custom signup form wrapper to handle terms validation
  const SignupFormWrapper = () => {
    const [formRef, setFormRef] = useState(null);

    useEffect(() => {
      if (formRef) {
        const form = formRef.querySelector('form');
        if (form) {
          const originalSubmit = form.onsubmit;
          form.onsubmit = (e) => {
            if (!termsAccepted) {
              e.preventDefault();
              setShowTermsError(true);
              return false;
            }
            setShowTermsError(false);
            // Call original submit if terms are accepted
            if (originalSubmit) {
              return originalSubmit(e);
            }
          };
        }
      }
    }, [formRef]);

    return (
      <div ref={setFormRef}>
        <SignupForm 
          onSuccess={handleSignupSuccess} 
          className="slide-modal-form"
        />
      </div>
    );
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
          <h2>Create Your Account</h2>
          <button className="close-button" onClick={handleClose}>&times;</button>
        </div>
        
        <div className="slide-modal-body">
          <SignupFormWrapper />
          
          <div className="terms-checkbox">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={handleTermsChange}
                className="terms-checkbox-input"
              />
              <span className="checkbox-checkmark"></span>
              <span className="checkbox-text">
                I agree to the{' '}
                <Link 
                    to="/privacy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="terms-link"
                  >
                    Privacy Policy
                  </Link>
                  {' '}and{' '}
                  <Link 
                    to="/terms" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="terms-link"
                  >
                    Terms & Conditions
                  </Link>
              </span>
            </label>
            {showTermsError && (
              <div className="terms-error" style={{
                color: '#dc3545',
                fontSize: '14px',
                marginTop: '5px'
              }}>
                Please accept the Terms & Conditions to continue
              </div>
            )}
          </div>
          
          <div className="login-link">
            <p>Already have an account? <a href="/login" onClick={(e) => {
              e.preventDefault();
              handleClose();
              navigate('/login');
            }}>Log In</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupModal;