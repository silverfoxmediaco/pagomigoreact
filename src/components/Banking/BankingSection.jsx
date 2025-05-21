// src/components/Banking/BankingSection.jsx
import React, { useState } from 'react';
import BankTransferModal from './BankTransferModal';
import useUnitBanking from '../../hooks/useUnitBanking';
import styles from '../../styles/Banking.module.css';

const BankingSection = () => {
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  
  const {
    unitAccounts,
    hasAccount,
    loading,
    error,
    createUnitAccount,
    clearError
  } = useUnitBanking();

  const handleSetupUnitAccount = async () => {
    try {
      await createUnitAccount();
    } catch (err) {
      // Error is already handled by the hook
    }
  };

  if (loading) {
    return <div className={styles.loadingContainer}>Loading banking information...</div>;
  }

  return (
    <section className={styles.bankingContainer}>
      <h2>Banking</h2>
      
      {error && (
        <div className={styles.errorContainer}>
          {error}
          <button className={styles.retryButton} onClick={clearError}>
            Dismiss
          </button>
        </div>
      )}
      
      {hasAccount ? (
        <>
          {unitAccounts.length > 0 ? (
            <div className={styles.accountsContainer}>
              {unitAccounts.map((account) => (
                <div key={account.id} className={styles.accountCard}>
                  <div className={styles.accountInfo}>
                    <h3>{account.name || 'Bank Account'}</h3>
                    <div className={styles.accountType}>{account.type}</div>
                  </div>
                  <div className={styles.accountBalance}>
                    ${account.balance ? (account.balance / 100).toFixed(2) : '0.00'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noBankingContainer}>
              <p>No accounts found. Please try again or contact support.</p>
            </div>
          )}
          
          <div className={styles.actionButtons}>
            <button 
              className={`${styles.actionBtn} ${styles.transferBtn}`}
              onClick={() => setIsTransferModalOpen(true)}
            >
              Transfer Money
            </button>
            <button className={`${styles.actionBtn} ${styles.depositBtn}`}>
              Deposit
            </button>
            <button className={`${styles.actionBtn} ${styles.statementsBtn}`}>
              Statements
            </button>
          </div>
        </>
      ) : (
        <div className={styles.setupBankingCard}>
          <h3>Set Up Banking</h3>
          <p>Connect your banking account to send and receive money instantly.</p>
          <button 
            className={styles.setupButton}
            onClick={handleSetupUnitAccount}
          >
            Set Up Banking
          </button>
        </div>
      )}
      
      <BankTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />
    </section>
  );
};

export default BankingSection;