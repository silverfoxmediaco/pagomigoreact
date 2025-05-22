// src/components/SignupModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SignupModal.css';
import SignupForm from './SignupForm';

const SignupModal = ({ isOpen: propIsOpen, onClose }) => {
  console.log('SignupModal rendered with isOpen:', propIsOpen);
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const navigate = useNavigate();
  const modalRef = useRef(null);

  // Use props if provided, otherwise use internal state
  const isOpen = propIsOpen !== undefined ? propIsOpen : internalIsOpen;
  const closeModal = onClose || (() => setInternalIsOpen(false));

  // Listen for custom event to open modal (for backward compatibility)
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

  // Handle click outside modal to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeModal]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, closeModal]);

  // Handle successful signup
  const handleSignupSuccess = () => {
    closeModal();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container" ref={modalRef}>
        <div className="modal-header">
          <h2>Create Your Account</h2>
          <button className="close-button" onClick={closeModal}>&times;</button>
        </div>
        
        <div className="modal-body">
          <SignupForm 
            onSuccess={handleSignupSuccess} 
            className="modal-form"
          />
          
          <div className="login-link">
            <p>Already have an account? <a href="/login" onClick={(e) => {
              e.preventDefault();
              closeModal();
              navigate('/login');
            }}>Log In</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupModal;