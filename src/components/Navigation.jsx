// src/components/Navigation.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import '../styles/Navigation.css';

// Import your images - Update paths as needed
import pagomigoLogo from '../assets/pagomigologo.png';
import menuIcon from '../assets/menuicon.svg';
import closeIcon from '../assets/closeicon.svg';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // Check for token on component mount
  useEffect(() => {
    console.log('Navigation component - checking authentication');
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  // Handle logout
  const handleLogout = async (e) => {
    e.preventDefault();
    console.log('Logout clicked');
    
    const token = localStorage.getItem('token');
    
    try {
      // Try to call the logout API
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }).catch(err => console.warn('Logout API error:', err));
      
      // Remove token and redirect regardless of API response
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setIsMenuOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still perform client-side logout
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setIsMenuOpen(false);
      navigate('/login');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const slideoutMenu = document.getElementById('slideoutMenu');
      const hamburger = document.getElementById('hamburger');
      
      if (isMenuOpen && slideoutMenu && !slideoutMenu.contains(event.target) && !hamburger.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    // Handle ESC key press
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isMenuOpen]);

  // Open signup modal
  const openSignupModal = () => {
    setIsMenuOpen(false);
    window.dispatchEvent(new CustomEvent('open-signup-modal'));
  };

  return (
    <header className="main-header">
      <div className="logo">
        <Link to="/">
          <img src={pagomigoLogo} id="logo" alt="pagomigologo" />
        </Link>
      </div>
      
      {/* Language Switcher - positioned between logo and hamburger */}
      <LanguageSwitcher />
      
      <img 
        src={menuIcon} 
        alt="Menu" 
        className="hamburger" 
        id="hamburger" 
        onClick={toggleMenu}
      />
      
      <nav className={`slideout-menu ${isMenuOpen ? 'open' : ''}`} id="slideoutMenu">
        <img 
          src={closeIcon} 
          alt="Close" 
          className="close-btn" 
          id="closeMenu" 
          onClick={() => setIsMenuOpen(false)}
        />
        <ul id="navList">
          <li><Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>{t('dashboard')}</Link></li>
          <li><Link to="/moneymover" onClick={() => setIsMenuOpen(false)}>{t('sendRequest')}</Link></li>
          <li><Link to="/" onClick={() => setIsMenuOpen(false)}>{t('home')}</Link></li>
          <li><Link to="/billpay" onClick={() => setIsMenuOpen(false)}>{t('billPay')}</Link></li>
          <li id="authMenuItem">
            {isAuthenticated ? (
              <a href="#" className="logout-button" onClick={handleLogout}>{t('logout')}</a>
            ) : (
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>{t('login')}</Link>
            )}
          </li>
          {!isAuthenticated && (
            <li>
              <button className="nav-button" onClick={openSignupModal}>{t('signup')}</button>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Navigation;