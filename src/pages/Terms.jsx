// src/pages/Terms.jsx
import React from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import './Privacy.css'; // Reusing the same CSS file

const Terms = () => {
  return (
    <div className="page-container">
      <Navigation />
      <main className="privacy">
        <h1>Terms and Conditions</h1>
        <p>Effective Date: April 25, 2025</p>

        <h2>1. Introduction</h2>
        <p>Welcome to Pagomigo. These Terms and Conditions ("Terms") govern your use of our services, including peer-to-peer transfers, digital wallet functionality, card issuance, and related financial products offered via pagomigo.com.</p>

        <h2>2. Account Eligibility</h2>
        <p>You must be 18 years of age or older to open a Pagomigo account. By registering, you confirm that you meet the eligibility requirements and are legally capable of agreeing to these Terms.</p>

        <h2>3. Identity and Compliance</h2>
        <p>Pagomigo complies with financial regulations including Know Your Customer (KYC) and Anti-Money Laundering (AML) policies. You agree to provide accurate identity documents and undergo verification procedures.</p>

        <h2>4. Services Provided</h2>
        <p>Pagomigo allows users to send, receive, request money, pay bills, and access virtual card features. All usage must comply with U.S. and international financial laws.</p>

        <h2>5. Fees and Charges</h2>
        <p>Fees may apply for certain services such as currency conversions, instant transfers, or third-party integrations. Pagomigo will notify you of any applicable fees before completing transactions.</p>

        <h2>6. User Responsibilities</h2>
        <ul>
          <li>Keep login credentials confidential</li>
          <li>Only use the platform for lawful activities</li>
          <li>Immediately report suspicious or unauthorized account activity</li>
        </ul>

        <h2>7. Termination</h2>
        <p>Pagomigo reserves the right to suspend or terminate your account without notice if you violate these Terms or engage in fraudulent, abusive, or prohibited activities.</p>

        <h2>8. Disclaimers</h2>
        <p>We do not guarantee uninterrupted access to our services. Pagomigo is not liable for loss of funds due to unauthorized access resulting from user negligence.</p>

        <h2>9. Modifications</h2>
        <p>We may update these Terms periodically. You will be notified of changes via email or the website. Continued use of the service implies acceptance of the revised Terms.</p>

        <h2>10. Governing Law</h2>
        <p>These Terms are governed by the laws of the State of Texas and applicable U.S. federal laws.</p>

        <h2>11. Contact</h2>
        <p>If you have questions, please contact us at <a href="mailto:support@pagomigo.com">support@pagomigo.com</a>.</p>

        
      </main>
      <Footer />
    </div>
  );
};

export default Terms;