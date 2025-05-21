// src/pages/Dashboard/Banking/PlaidBankingSection.jsx
import React from 'react';
import { usePlaid } from '../../../hooks/usePlaid';
import { formatCurrency } from '../../../utils/formatters';
import styles from '../../../styles/Banking.module.css';

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
      
      // Format balance for display
      const currentBalance = formatCurrency(balance.current);
      const availableBalance = formatCurrency(balance.available || balance.current);
      
      // Show in alert (in a real app, you'd use a modal or toast)
      alert(`Current balance: ${currentBalance}\nAvailable balance: ${availableBalance}`);
    } catch (err) {
      alert('Failed to retrieve balance');
    }
  };

  return (
    <section className={styles.plaidSection}>
      <div className={styles.sectionHeader}>
        <h3>Plaid Connected Bank Accounts</h3>
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
          <p>Connect your bank accounts to easily track balances and transactions in one place.</p>
        </div>
      )}
      
      {/* Accounts list */}
      {accounts.length > 0 && (
        <div className={styles.accountsContainer}>
          <ul className={styles.accountsList}>
            {accounts.map(account => (
              <li key={account.id} className={styles.bankAccountItem}>
                <div className={styles.accountInfo}>
                  <div className={styles.accountDetails}>
                    <span className={styles.accountName}>{account.name}</span>
                    <span className={styles.accountInstitution}>{account.institution}</span>
                    <span className={styles.accountMaskedNumber}>•••• {account.mask}</span>
                  </div>
                </div>
                <div className={styles.accountActions}>
                  <button 
                    className={styles.checkBalanceBtn}
                    onClick={() => handleCheckBalance(account.id)}
                  >
                    Balance
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default PlaidBankingSection;