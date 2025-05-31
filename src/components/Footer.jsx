// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

// Import your logo
import pagomigoLogo from '../assets/newpgmlogov4500x200trans.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="site-footer">
      <div className="footer-row footer-logo">
        <img src={pagomigoLogo} alt="Pagomigo Logo" width="100" />
      </div>
      <div className="footer-row footer-links">
        <Link to="/terms">Terms & Conditions</Link>
        <Link to="/privacy">Privacy Policy</Link>
        <Link to="/fees">Fees</Link>
      </div>
      <div className="footer-row footer-copy">
        <p>&copy; {currentYear} Pagomigo.com L.L.C. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;