// src/components/Transactions/RequestsList.jsx
import React from 'react';
import { useTransactions } from '../../hooks/useTransactions';
import styles from '../../styles/Requests.module.css';

const RequestsList = () => {
  const { 
    requests, 
    loading, 
    error, 
    success, 
    payRequest, 
    declineRequest 
  } = useTransactions();

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

  const handlePayRequest = async (requestId) => {
    if (window.confirm('Are you sure you want to pay this request?')) {
      await payRequest(requestId);
    }
  };

  const handleDeclineRequest = async (requestId) => {
    if (window.confirm('Are you sure you want to decline this request?')) {
      await declineRequest(requestId);
    }
  };

  if (loading && requests.length === 0) {
    return <div className={styles.loadingMessage}>Loading requests...</div>;
  }

  if (error && requests.length === 0) {
    return <div className={styles.errorMessage}>{error}</div>;
  }

  if (success) {
    return <div className={styles.successMessage}>{success}</div>;
  }

  if (requests.length === 0) {
    return <div className={styles.emptyMessage}>No money requests.</div>;
  }

  return (
    <div className={styles.requestsContainer}>
      <ul className={styles.requestsList}>
        {requests.filter(request => request.status === 'pending').map(request => (
          <li key={request._id} className={styles.requestItem}>
            <div className={styles.requestInfo}>
              <div className={styles.requester}>
                <span className={styles.requesterName}>{request.requestedFrom}</span>
                <span className={styles.requestNote}>{request.requestNote}</span>
              </div>
              <div className={styles.requestMeta}>
                <span className={styles.requestDate}>{formatDate(request.createdAt)}</span>
              </div>
            </div>
            <div className={styles.requestAmount}>
              {formatCurrency(request.amountUsd)}
            </div>
            <div className={styles.requestActions}>
              <button 
                className={styles.payButton}
                onClick={() => handlePayRequest(request._id)}
              >
                Pay
              </button>
              <button 
                className={styles.declineButton}
                onClick={() => handleDeclineRequest(request._id)}
              >
                Decline
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RequestsList;