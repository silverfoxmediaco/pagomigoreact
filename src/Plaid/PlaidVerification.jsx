// src/pages/Dashboard/Verification/PlaidVerification.jsx
import React from 'react';
import { usePlaid } from './usePlaid';
import styles from './PlaidVerification.module.css';

const PlaidVerification = () => {
  const { 
    verificationStatus, 
    loading, 
    error, 
    success, 
    openIdentityVerification 
  } = usePlaid();

  const getStatusClass = () => {
    switch (verificationStatus) {
      case 'success':
      case 'approved':
        return styles.approved;
      case 'failed':
        return styles.failed;
      default:
        return styles.pending;
    }
  };

  const getStatusText = () => {
    switch (verificationStatus) {
      case 'success':
      case 'approved':
        return 'Verified';
      case 'failed':
        return 'Verification Failed';
      case 'pending_review':
        return 'Under Review';
      default:
        return 'Verification Pending';
    }
  };

  const getMessage = () => {
    switch (verificationStatus) {
      case 'success':
      case 'approved':
        return 'Your identity has been successfully verified.';
      case 'failed':
        return 'There was an issue with your verification. Please try again.';
      case 'pending_review':
        return 'Your verification is being reviewed. We\'ll notify you when it\'s complete.';
      default:
        return 'Complete identity verification to unlock all features of your account.';
    }
  };

  const showVerifyButton = !['success', 'approved', 'pending_review'].includes(verificationStatus);

  return (
    <section className={styles.plaidVerificationSection}>
      <div className={styles.sectionHeader}>
        <h2>For North America and Europe Use Plaid to Verify Your Identity</h2>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}
      {success && <div className={styles.successMessage}>{success}</div>}

      <div className={styles.verificationStatus}>
        <div className={styles.statusBadge}></div>
        <span className={styles.statusText}>{getStatusText()}</span>
      </div>

      <p className={styles.description}>{getMessage()}</p>

      {showVerifyButton && (
        <button 
          className={styles.plaidverifyBtn}
          onClick={openIdentityVerification}
          disabled={loading}
        >
          {loading ? 'Starting Verification...' : 'Verify Your Identity'}
        </button>
      )}
    </section>
  );
};

export default PlaidVerification;
