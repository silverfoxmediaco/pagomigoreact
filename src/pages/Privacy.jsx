// src/pages/Privacy.jsx
import React from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import './Privacy.css';

const Privacy = () => {
  return (
    <div className="page-container">
      <Navigation />
      <main className="privacy">
        <div>
          <h1>Privacy Policy</h1>
        </div>
        <div>
          <h2>1. Who We Are</h2>
          <p>Pagomigo L.L.C. ("Pagomigo", "we", "our", or "us") operates <a href="https://www.pagomigo.com">https://www.pagomigo.com</a>, a digital wallet and money transfer platform designed to support the Hispanic and Latino communities in the U.S. and abroad.</p>

          <h2>2. What Information We Collect</h2>
          <ul>
            <li>Personal information: Full name, phone number, email address, and government-issued ID (for identity verification)</li>
            <li>Financial data: Linked account information, transaction history, payment details</li>
            <li>Device and usage data: IP address, browser type, location, and pages visited</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use your data to:</p>
          <ul>
            <li>Create and manage your Pagomigo account</li>
            <li>Process and secure transactions</li>
            <li>Verify your identity (KYC & AML compliance)</li>
            <li>Send communications and support messages</li>
            <li>Improve and personalize the user experience</li>
          </ul>

          <h2>4. How We Share Your Information</h2>
          <p>We may share your information with:</p>
          <ul>
            <li>Financial partners like Stripe, card issuers, and banking providers</li>
            <li>Government and regulatory bodies (as required by law)</li>
            <li>Service providers helping us operate our platform (e.g., SMS, analytics)</li>
          </ul>

          <h2>5. Your Rights</h2>
          <p>You may request to:</p>
          <ul>
            <li>Access or correct your personal data</li>
            <li>Delete your account and associated data</li>
            <li>Withdraw consent for non-essential communications</li>
          </ul>
          <p>To make a request, email <a href="mailto:support@pagomigo.com">support@pagomigo.com</a>.</p>

          <h2>6. Data Security</h2>
          <p>We implement industry-standard encryption and data protection measures. However, no digital service is 100% secure. Use strong passwords and protect your login information.</p>

          <h2>7. Cookies & Tracking</h2>
          <p>Pagomigo may use cookies to remember your preferences and track usage patterns. You can manage cookie preferences in your browser settings.</p>

          <h2>8. Children's Privacy</h2>
          <p>Our services are not intended for children under 13. We do not knowingly collect information from minors.</p>

          <h2>9. Changes to This Policy</h2>
          <p>We may update this Privacy Policy periodically. We will notify users through the website or email when major changes are made.</p>

          <h2>10. Contact Us</h2>
          <p>Have questions? Contact us at <a href="mailto:support@pagomigo.com">support@pagomigo.com</a>.</p>

          <p>&copy; 2025 Pagomigo L.L.C. All rights reserved.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;