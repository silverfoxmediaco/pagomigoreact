// src/components/Banking/BankTransferModal.jsx
import React, { useState } from 'react';
import useUnitBanking from './useUnitBanking';
import styles from './UnitBanking.module.css';

const BankTransferModal = ({ isOpen, onClose }) => {
  const [form, setForm] = useState({
    receiver: '',
    amount: '',
    description: ''
  });
  
  const { loading, error, makeBankTransfer } = useUnitBanking();
  const [success, setSuccess] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Only allow numbers and decimal point for amount
    if (name === 'amount' && value !== '') {
      const regex = /^\d*\.?\d{0,2}$/;
      if (!regex.test(value)) return;
    }
    
    setForm({
      ...form,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    
    try {
      // Validate form
      if (!form.receiver || !form.amount) {
        return; // Form validation is handled by required attributes
      }
      
      const amountInCents = Math.round(parseFloat(form.amount) * 100);
      
      const result = await makeBankTransfer({
        receiver: form.receiver,
        amount: amountInCents,
        description: form.description
      });
      
      if (result.success) {
        setSuccess('Money sent successfully!');
        setForm({
          receiver: '',
          amount: '',
          description: ''
        });
        
        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err) {
      // Error is handled by the hook
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <h2>Transfer Money</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.modalBody}>
          {error && <div className={styles.errorMessage}>{error}</div>}
          {success && <div className={styles.successMessage}>{success}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="receiver">Recipient</label>
              <input 
                id="receiver" 
                name="receiver" 
                type="text" 
                placeholder="Phone or email" 
                value={form.receiver}
                onChange={handleInputChange}
                required 
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="amount">Amount</label>
              <div className={styles.amountInputWrapper}>
                <span className={styles.currencySymbol}>$</span>
                <input 
                  id="amount" 
                  name="amount" 
                  type="text" 
                  placeholder="0.00" 
                  value={form.amount}
                  onChange={handleInputChange}
                  required 
                />
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="description">Note (Optional)</label>
              <input 
                id="description" 
                name="description" 
                type="text" 
                placeholder="What's it for?" 
                value={form.description}
                onChange={handleInputChange}
              />
            </div>
            
            <div className={styles.modalActions}>
              <button 
                type="button" 
                className={styles.cancelButton} 
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className={styles.sendButton}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Money'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BankTransferModal;