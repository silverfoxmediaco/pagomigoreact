// src/components/Persona/PersonaVerification.jsx
import React from 'react';
import { usePersona } from './usePersona';
import styles from './PersonaVerification.module.css';

const PersonaVerification = () => {
  const { 
    verificationStatus, 
    loading, 
    error, 
    success, 
    startVerification 
  } = usePersona();

  const getStatusClass = () => {
    switch (verificationStatus) {
      case 'completed':
      case 'approved':
        return styles.approved;
      case 'failed':
      case 'declined':
        return styles.failed;
      case 'pending_review':
        return styles.pendingReview;
      default:
        return styles.pending;
    }
  };

  const getStatusText = () => {
    switch (verificationStatus) {
      case 'completed':
      case 'approved':
        return 'Verified';
      case 'failed':
      case 'declined':
        return 'Verification Failed';
      case 'pending_review':
        return 'Under Review';
      case 'created':
        return 'Started';
      default:
        return 'Verification Pending';
    }
  };

  const getMessage = () => {
    switch (verificationStatus) {
      case 'completed':
      case 'approved':
        return 'Your identity has been successfully verified with Persona.';
      case 'failed':
      case 'declined':
        return 'There was an issue with your verification. Please try again or contact support.';
      case 'pending_review':
        return 'Your verification is being reviewed by our team. We\'ll notify you when it\'s complete.';
      case 'created':
        return 'Verification started. Please complete the process to continue.';
      default:
        return 'Complete identity verification to unlock all features of your account and comply with regulations.';
    }
  };

  const shouldShowVerifyButton = () => {
    return !['completed', 'approved', 'pending_review'].includes(verificationStatus);
  };

  return (
    <section className={styles.personaVerificationSection}>
      <div className={styles.sectionHeader}>
        <h2>For Central America, South America & Spain - Verify Your Identity</h2>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}
      {success && <div className={styles.successMessage}>{success}</div>}

      <div className={styles.verificationCard}>
        <div className={styles.verificationStatus}>
          <div className={`${styles.statusBadge} ${getStatusClass()}`}></div>
          <span className={styles.statusText}>{getStatusText()}</span>
        </div>

        <p className={styles.description}>{getMessage()}</p>

        {shouldShowVerifyButton() && (
          <button 
            className={styles.personaVerifyBtn}
            onClick={startVerification}
            disabled={loading}
          >
            {loading ? 'Starting Verification...' : 'Verify Your Identity with Persona'}
          </button>
        )}

        <div className={styles.supportedRegions}>
          <h4>Supported Regions:</h4>
          <ul>
            <li>🇲🇽 Mexico</li>
            <li>🇨🇴 Colombia</li>
            <li>🇦🇷 Argentina</li>
            <li>🇵🇪 Peru</li>
            <li>🇪🇸 Spain</li>
            <li>🇨🇷 Costa Rica</li>
            <li>🇬🇹 Guatemala</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default PersonaVerification;