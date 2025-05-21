// src/components/Transactions/TransactionsList.jsx
import React from 'react';
import { useTransactions } from '../../hooks/useTransactions';
import styles from '../../styles/Transactions.module.css';

const TransactionsList = () => {
  const { transactions, loading, error } = useTransactions();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    let badgeClass;
    
    switch (status) {
      case 'completed':
        badgeClass = styles.statusCompleted;
        break;
      case 'pending':
        badgeClass = styles.statusPending;
        break;
      case 'failed':
        badgeClass = styles.statusFailed;
        break;
      default:
        badgeClass = styles.statusPending;
    }
    
    return <span className={`${styles.statusBadge} ${badgeClass}`}>{status}</span>;
  };

  if (loading && transactions.length === 0) {
    return <div className={styles.loadingMessage}>Loading transactions...</div>;
  }

  if (error && transactions.length === 0) {
    return <div className={styles.errorMessage}>{error}</div>;
  }

  if (transactions.length === 0) {
    return <div className={styles.emptyMessage}>No transactions yet.</div>;
  }

  return (
    <div className={styles.transactionsContainer}>
      <ul className={styles.transactionsList}>
        {transactions.map(transaction => (
          <li key={transaction._id} className={styles.transactionItem}>
            <div className={styles.transactionInfo}>
              <div className={styles.recipient}>
                <span className={styles.recipientName}>{transaction.recipientName}</span>
                <span className={styles.recipientCountry}>{transaction.recipientCountry}</span>
              </div>
              <div className={styles.transactionMeta}>
                <span className={styles.transactionDate}>{formatDate(transaction.createdAt)}</span>
                {getStatusBadge(transaction.status)}
              </div>
            </div>
            <div className={styles.transactionAmount}>
              {formatCurrency(transaction.amountUsd)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionsList;