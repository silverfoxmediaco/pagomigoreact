// src/components/Transactions/RequestMoneyModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useTransactions } from '../../hooks/useTransactions';
import styles from '../../styles/TransactionModals.module.css';

const RequestMoneyModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    requestedFrom: '',
    requestNote: '',
    amountUsd: ''
  });
  const { requestMoney, loading, error, success } = useTransactions();
  const modalRef = useRef(null);
  
  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Handle escape key to close
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For amount, only allow numbers and decimal point
    if (name === 'amountUsd' && value !== '') {
      const regex = /^\d*\.?\d{0,2}$/;
      if (!regex.test(value)) return;
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.requestedFrom || !formData.requestNote || !formData.amountUsd) {
      return;
    }
    
    // Convert amount to number
    const data = {
      ...formData,
      amountUsd: parseFloat(formData.amountUsd)
    };
    
    const result = await requestMoney(data);
    
    if (result.success) {
      // Reset form
      setFormData({
        requestedFrom: '',
        requestNote: '',
        amountUsd: ''
      });
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer} ref={modalRef}>
        <div className={styles.modalHeader}>
          <h2>Request Money</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>
        
        <div className={styles.modalBody}>
          {error && <div className={styles.errorMessage}>{error}</div>}
          {success && <div className={styles.successMessage}>{success}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="requestedFrom">Request From</label>
              <input
                type="text"
                id="requestedFrom"
                name="requestedFrom"
                value={formData.requestedFrom}
                onChange={handleChange}
                placeholder="Enter the person's name"
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="amountUsd">Amount (USD)</label>
              <div className={styles.amountInput}>
                <span className={styles.currencySymbol}>$</span>
                <input
                  type="text"
                  id="amountUsd"
                  name="amountUsd"
                  value={formData.amountUsd}
                  onChange={handleChange}
                  placeholder="0.00"
                  inputMode="decimal"
                  required
                />
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="requestNote">Note</label>
              <textarea
                id="requestNote"
                name="requestNote"
                value={formData.requestNote}
                onChange={handleChange}
                placeholder="What's this request for?"
                rows="3"
                required
              ></textarea>
            </div>
            
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.requestButton}
                disabled={loading || !formData.requestedFrom || !formData.requestNote || !formData.amountUsd}
              >
                {loading ? 'Requesting...' : 'Request Money'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestMoneyModal;