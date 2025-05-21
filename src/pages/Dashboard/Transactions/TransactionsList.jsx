// src/pages/Dashboard/Transactions/TransactionsList.jsx
import React from 'react';
import { useTransactions } from '../../../hooks/useTransactions';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import styles from '../../../styles/Transactions.module.css';

const TransactionsList = () => {
  const { transactions, loading, error } = useTransactions();
  
  if (loading) return <div className={styles.loading}>Loading transactions...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  
  return (
    <section className={styles.transactions}>
      <h3>Recent Transactions</h3>
      {transactions.length === 0 ? (
        <p>No transactions found</p>
      ) : (
        <ul className={styles.transactionList}>
          {transactions.map(transaction => (
            <li key={transaction.id} className={styles.transactionItem}>
              <div className={styles.transactionDetails}>
                <span className={styles.transactionParty}>{transaction.merchant || transaction.name}</span>
                <span className={styles.transactionDate}>{formatDate(transaction.date)}</span>
                {transaction.category && (
                  <span className={styles.transactionCategory}>{transaction.category}</span>
                )}
              </div>
              <span className={`${styles.transactionAmount} ${transaction.amount > 0 ? styles.positive : styles.negative}`}>
                {formatCurrency(transaction.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default TransactionsList;