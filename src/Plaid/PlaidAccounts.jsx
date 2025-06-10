// src/Plaid/PlaidAccounts.jsx
import React, { useState, useEffect } from 'react';
import { usePlaid } from './usePlaid';
import { formatCurrency } from '../utils/formatters';
import './plaid-accounts.css';

const PlaidAccounts = () => {
  const { 
    accounts, 
    loading, 
    error, 
    success, 
    openPlaidLink, 
    checkBalance,
    loadAccounts 
  } = usePlaid();

  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showTransactions, setShowTransactions] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [balanceInfo, setBalanceInfo] = useState({});
  const [loadingBalance, setLoadingBalance] = useState(false);

  useEffect(() => {
    // Load accounts when component mounts
    loadAccounts();
  }, [loadAccounts]);

  const handleCheckBalance = async (account) => {
    setLoadingBalance(true);
    try {
      const balance = await checkBalance(account.id);
      setBalanceInfo(prev => ({
        ...prev,
        [account.id]: balance
      }));
      
      // Display balance in an alert or modal
      alert(`${account.name} Balance:\nCurrent: ${formatCurrency(balance.current)}\nAvailable: ${formatCurrency(balance.available || balance.current)}`);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
      alert('Failed to retrieve balance. Please try again.');
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleViewTransactions = (account) => {
    setSelectedAccount(account);
    setShowTransactions(true);
    // In a real implementation, you would fetch transactions here
    // For now, we'll show mock data
    setTransactions([
      {
        id: '1',
        name: 'Grocery Store',
        amount: -45.32,
        date: '2025-01-08',
        category: 'Food and Drink',
        pending: false
      },
      {
        id: '2',
        name: 'Direct Deposit',
        amount: 2500.00,
        date: '2025-01-05',
        category: 'Transfer',
        pending: false
      },
      {
        id: '3',
        name: 'Electric Bill',
        amount: -120.50,
        date: '2025-01-03',
        category: 'Service',
        pending: true
      }
    ]);
  };

  const handleCloseTransactions = () => {
    setShowTransactions(false);
    setSelectedAccount(null);
    setTransactions([]);
  };

  const formatAmount = (amount) => {
    const formatted = formatCurrency(Math.abs(amount));
    return amount < 0 ? `-${formatted}` : formatted;
  };

  return (
    <>
      {/* Header */}
      <header className="main-header">
        <img src="/assets/logomain.png" alt="PagoMigo Logo" />
        <div className="hamburger" onClick={() => document.querySelector('.slideout-menu').classList.toggle('open')}>
          <svg width="30" height="30" viewBox="0 0 30 30">
            <path d="M5 7h20M5 15h20M5 23h20" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      </header>

      {/* Slideout Menu */}
      <nav className="slideout-menu">
        <div className="close-btn" onClick={() => document.querySelector('.slideout-menu').classList.remove('open')}>
          <svg width="25" height="25" viewBox="0 0 25 25">
            <path d="M6 6l13 13M19 6L6 19" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <ul>
          <li><a href="/dashboard">Dashboard</a></li>
          <li><a href="/plaid-accounts">Connected Accounts</a></li>
          <li><a href="/settings">Settings</a></li>
          <li><a href="/logout">Logout</a></li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="connected-accounts">
        <div className="page-header">
          <h1>Connected Bank Accounts</h1>
          <p>Manage your linked bank accounts and view transactions</p>
        </div>

        {/* Connect Account Section */}
        <div className="accounts-section">
          <div className="connect-account-button-container">
            <button 
              className="primary-btn"
              onClick={openPlaidLink}
              disabled={loading}
            >
              <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/>
              </svg>
              {loading ? 'Connecting...' : 'Connect New Bank Account'}
            </button>
          </div>

          {/* Messages */}
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {/* No Accounts State */}
          {!loading && accounts.length === 0 && (
            <div className="no-account-container">
              <h3>No Bank Accounts Connected</h3>
              <p>Connect your bank accounts to manage your finances in one place.</p>
            </div>
          )}

          {/* Accounts List */}
          {accounts.length > 0 && (
            <div className="accounts-container">
              <h3>Your Connected Accounts</h3>
              <ul className="accounts-list">
                {accounts.map(account => (
                  <li key={account.id} className="bank-account-item">
                    <div className="account-info">
                      <svg className="account-type-icon" viewBox="0 0 30 30" fill="#0562ff">
                        <path d="M15 3L3 9v2h24V9L15 3zm-9 5h18v2H6V8zm1 4v10h4V12H7zm6 0v10h4V12h-4zm6 0v10h4V12h-4zM4 24h22v2H4v-2z"/>
                      </svg>
                      <div className="account-details">
                        <span className="account-name">{account.name}</span>
                        <span className="account-institution">{account.institution}</span>
                        <span className="account-masked-number">•••• {account.mask}</span>
                      </div>
                    </div>
                    <div className="account-actions">
                      <button 
                        className="view-transactions-btn"
                        onClick={() => handleViewTransactions(account)}
                      >
                        Transactions
                      </button>
                      <button 
                        className="check-balance-btn"
                        onClick={() => handleCheckBalance(account)}
                        disabled={loadingBalance}
                      >
                        {loadingBalance ? 'Loading...' : 'Balance'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Transactions Section */}
        {showTransactions && selectedAccount && (
          <div className="transactions-section">
            <div className="section-header">
              <h3>Recent Transactions - {selectedAccount.name}</h3>
              <button className="close-btn" onClick={handleCloseTransactions}>×</button>
            </div>
            {transactions.length === 0 ? (
              <p>No transactions to display</p>
            ) : (
              <ul className="transactions-list">
                {transactions.map(transaction => (
                  <li key={transaction.id} className="transaction-item">
                    <div className="transaction-details">
                      <span className="transaction-name">{transaction.name}</span>
                      <span className="transaction-date">{transaction.date}</span>
                      <span className="transaction-category">{transaction.category}</span>
                    </div>
                    <div>
                      <span className={`transaction-amount ${transaction.amount < 0 ? 'negative' : 'positive'}`}>
                        {formatAmount(transaction.amount)}
                      </span>
                      {transaction.pending && <span className="pending-badge">Pending</span>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-row">
          <div className="footer-logo">
            <img src="/assets/logomain.png" alt="PagoMigo" />
          </div>
        </div>
        <div className="footer-row">
          <div className="footer-links">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/support">Support</a>
          </div>
        </div>
        <div className="footer-row">
          <div className="footer-copy">
            <p>&copy; 2025 PagoMigo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default PlaidAccounts;