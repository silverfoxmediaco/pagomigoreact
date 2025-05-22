// src/components/Banking/PlaidBankingSection.jsx
import React from 'react';
import { usePlaid } from '../../hooks/usePlaid';
import styles from '../../styles/Banking.module.css';

const PlaidBankingSection = () => {
  const { 
    accounts, 
    loading, 
    error, 
    success, 
    openPlaidLink, 
    checkBalance 
  } = usePlaid();

  const handleCheckBalance = async (accountId) => {
    try {
      const balance = await checkBalance(accountId);
      const formatCurrency = (amount) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
      
      alert(`Balance: ${formatCurrency(balance.current)}\nAvailable: ${formatCurrency(balance.available || balance.current)}`);
    } catch (err) {
      alert('Failed to retrieve balance');
    }
  };

  return (
    <section className={styles.plaidSection}>
      <div className={styles.sectionHeader}>
        <h3>Connected Bank Accounts</h3>
        <p>Link your external bank accounts for easy transfers</p>
      </div>

      {/* Success/error messages */}
      {error && <div className={styles.errorMessage}>{error}</div>}
      {success && <div className={styles.successMessage}>{success}</div>}

      {/* Connect bank button */}
      <div className={styles.bankingActions}>
        <button 
          className={`${styles.bankingBtn} ${styles.primaryBtn}`}
          onClick={openPlaidLink}
          disabled={loading}
        >
          {loading ? 'Connecting...' : 'Connect Bank Account'}
        </button>
      </div>

      {/* No accounts message */}
      {!loading && accounts.length === 0 && (
        <div className={styles.noAccountContainer}>
          <h4>No Bank Accounts Connected</h4>
          <p>Connect your bank accounts to easily fund your Pagomigo wallet and verify your identity.</p>
        </div>
      )}

      {/* Accounts list */}
      {accounts.length > 0 && (
        <div className={styles.accountsContainer}>
          <h4>Your Connected Accounts:</h4>
          <div className={styles.accountsList}>
            {accounts.map(account => (
              <div key={account.id} className={styles.bankAccountItem}>
                <div className={styles.accountInfo}>
                  <div className={styles.accountDetails}>
                    <span className={styles.accountName}>{account.name}</span>
                    <span className={styles.accountInstitution}>{account.institution}</span>
                    <span className={styles.accountNumber}>•••• {account.mask}</span>
                  </div>
                </div>
                <div className={styles.accountActions}>
                  <button 
                    className={styles.checkBalanceBtn}
                    onClick={() => handleCheckBalance(account.id)}
                  >
                    Check Balance
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default PlaidBankingSection;