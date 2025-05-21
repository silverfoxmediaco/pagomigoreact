// src/components/Transactions/SendMoneyModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import '../../../styles/TransactionModals.css';

const SendMoneyModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    recipientName: '',
    recipientCountry: '',
    amountUsd: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
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
    if (!formData.recipientName || !formData.recipientCountry || !formData.amountUsd) {
      setError('All fields are required');
      return;
    }
    
    // Convert amount to number
    const data = {
      ...formData,
      amountUsd: parseFloat(formData.amountUsd)
    };
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Mock transaction for now
      // In a real application, you would call your API here
      console.log('Sending money:', data);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Money sent successfully!');
      setFormData({
        recipientName: '',
        recipientCountry: '',
        amountUsd: ''
      });
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to send money');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay">
      <div className="modal-container" ref={modalRef}>
        <div className="modal-header">
          <h2>Send Money</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="recipientName">Recipient Name</label>
              <input
                type="text"
                id="recipientName"
                name="recipientName"
                value={formData.recipientName}
                onChange={handleChange}
                placeholder="Enter recipient's name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="recipientCountry">Recipient Country</label>
              <input
                type="text"
                id="recipientCountry"
                name="recipientCountry"
                value={formData.recipientCountry}
                onChange={handleChange}
                placeholder="Enter recipient's country"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="amountUsd">Amount (USD)</label>
              <div className="amount-input">
                <span className="currency-symbol">$</span>
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
            
            <div className="modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="send-button"
                disabled={loading || !formData.recipientName || !formData.recipientCountry || !formData.amountUsd}
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

export default SendMoneyModal;