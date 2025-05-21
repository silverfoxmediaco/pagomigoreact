// src/pages/Dashboard/Banking/BankingSection.jsx
import React, { useState } from 'react';
import { useBanking } from '../../../hooks/useBanking';
import PlaidAccounts from './PlaidAccounts';
import SendMoneyPanel from './SendMoneyPanel';
import RequestMoneyPanel from './RequestMoneyPanel';
import styles from '../../../styles/Banking.module.css';

const BankingSection = () => {
  const { balance, loading } = useBanking();
  const [activePanel, setActivePanel] = useState(null);
  
  const togglePanel = (panel) => {
    setActivePanel(activePanel === panel ? null : panel);
  };
  
  return (
    <section id="banking" className={styles.bankingSection}>
      <div className={styles.sectionHeader}>
        <h3>Banking</h3>
        <div className={styles.balanceInfo}>
          <span className={styles.balanceLabel}>Cash Balance:</span>
          <span className={styles.balanceAmount}>
            {loading ? '$--' : formatCurrency(balance)}
          </span>
        </div>
      </div>
      
      <div className={styles.bankingActions}>
        <button 
          className={`${styles.bankingBtn} ${styles.primaryBtn}`}
          onClick={() => togglePanel('send')}
        >
          Send Money
        </button>
        <button 
          className={`${styles.bankingBtn} ${styles.secondaryBtn}`}
          onClick={() => togglePanel('request')}
        >
          Request Money
        </button>
        <button 
          className={`${styles.bankingBtn} ${styles.secondaryBtn}`}
          onClick={() => togglePanel('deposit')}
        >
          Deposit
        </button>
      </div>
      
      {activePanel === 'send' && <SendMoneyPanel onClose={() => setActivePanel(null)} />}
      {activePanel === 'request' && <RequestMoneyPanel onClose={() => setActivePanel(null)} />}
      
      <PlaidAccounts />
    </section>
  );
};

export default BankingSection;