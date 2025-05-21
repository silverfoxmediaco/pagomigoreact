// src/components/SignupModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SignupModal.css';
import SignupForm from './SignupForm';

const SignupModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const modalRef = useRef(null);

  // Listen for custom event to open modal
  useEffect(() => {
    const handleOpenModal = () => {
      setIsOpen(true);
    };

    window.addEventListener('open-signup-modal', handleOpenModal);
    
    return () => {
      window.removeEventListener('open-signup-modal', handleOpenModal);
    };
  }, []);

  // Handle click outside modal to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen]);

  // Handle successful signup
  const handleSignupSuccess = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container" ref={modalRef}>
        <div className="modal-header">
          <h2>Create Your Account</h2>
          <button className="close-button" onClick={() => setIsOpen(false)}>&times;</button>
        </div>
        
        <div className="modal-body">
          <SignupForm 
            onSuccess={handleSignupSuccess} 
            className="modal-form"
          />
          
          <div className="login-link">
            <p>Already have an account? <a href="/login" onClick={(e) => {
              e.preventDefault();
              setIsOpen(false);
              navigate('/login');
            }}>Log In</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupModal;