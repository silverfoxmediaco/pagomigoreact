// src/pages/MoneyMover/index.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import '../../styles/MoneyMover.css';
import { API_BASE } from '../../config';

const MoneyMover = () => {
  const [activeTab, setActiveTab] = useState('send');
  const [balance, setBalance] = useState('$0.00');
  const [kycStatus, setKycStatus] = useState('pending');
  const [hasUnitAccount, setHasUnitAccount] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Form states
  const [sendForm, setSendForm] = useState({
    recipientName: '',
    recipientCountry: '',
    amountUsd: ''
  });
  
  const [requestForm, setRequestForm] = useState({
    requestedFrom: '',
    requestNote: '',
    amountUsd: ''
  });
  
  const [unitForm, setUnitForm] = useState({
    receiver: '',
    amount: '',
    note: ''
  });
  
  const navigate = useNavigate();
  
  // Initialize on component mount
  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Check URL parameters to set initial tab
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    
    if (action === 'send') {
      setActiveTab('send');
    } else if (action === 'request') {
      setActiveTab('request');
    } else if (action === 'unit') {
      setActiveTab('unit');
    }
    
    // Fetch data
    checkKycStatus();
    checkUnitAccount();
    fetchUserBalance();
  }, [navigate]);
  
  // Check KYC status
  const checkKycStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const res = await fetch(`${API_BASE}/api/user/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const user = await res.json();
        const status = user.kyc_status || 'pending';
        setKycStatus(status);
        localStorage.setItem('kycStatus', status);
      }
    } catch (error) {
      console.error('Error checking KYC status:', error);
    }
  };
  
  // Check if user has a Unit account
  const checkUnitAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE}/api/unit/accounts/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setHasUnitAccount(response.status !== 404);
    } catch (error) {
      console.error('Error checking Unit account:', error);
      setHasUnitAccount(false);
    }
  };
  
  // Fetch user balance
  const fetchUserBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // For demonstration, use a static balance
      // In production, you would make an API call here
      setBalance('$500.00');
      
      // Uncomment for real API integration
      /*
      const res = await fetch(`${API_BASE}/api/user/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const profile = await res.json();
        setBalance(formatCurrency(profile.balance));
      }
      */
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance('$500.00');
    }
  };
  
  // Redirect to KYC page
  const redirectToKyc = (action) => {
    // Store the intended action to return to after KYC
    localStorage.setItem('pendingAction', action);
    
    // Show a friendly message
    alert('To keep your account secure, we need to verify your identity before you can send or receive money. Let\'s complete this quick process now!');
    
    // Redirect to KYC page
    navigate('/identity-verification');
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError(null);
    setSuccess(null);
  };
  
  // Handle send form input change
  const handleSendInputChange = (e) => {
    const { name, value } = e.target;
    setSendForm({
      ...sendForm,
      [name]: value
    });
  };
  
  // Handle request form input change
  const handleRequestInputChange = (e) => {
    const { name, value } = e.target;
    setRequestForm({
      ...requestForm,
      [name]: value
    });
  };
  
  // Handle unit form input change
  const handleUnitInputChange = (e) => {
    const { name, value } = e.target;
    
    // Only allow numbers and decimal point for amount
    if (name === 'amount' && value !== '') {
      const regex = /^\d*\.?\d{0,2}$/;
      if (!regex.test(value)) return;
    }
    
    setUnitForm({
      ...unitForm,
      [name]: value
    });
  };
  
  // Handle send money form submission
  const handleSendSubmit = async (e) => {
    e.preventDefault();
    
    // Check KYC status first
    if (kycStatus !== 'completed' && kycStatus !== 'approved') {
      redirectToKyc('send');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validate form
      if (!sendForm.recipientName || !sendForm.recipientCountry || !sendForm.amountUsd) {
        setError('All fields are required');
        setLoading(false);
        return;
      }
      
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/transactions/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientName: sendForm.recipientName,
          recipientCountry: sendForm.recipientCountry,
          amountUsd: parseFloat(sendForm.amountUsd)
        })
      });
      
      // For demo purposes, simulate successful API response
      setSuccess('Money sent successfully!');
      
      // Reset form
      setSendForm({
        recipientName: '',
        recipientCountry: '',
        amountUsd: ''
      });
      
      // Update balance
      fetchUserBalance();
    } catch (err) {
      setError('Failed to send money. Please try again.');
      console.error('Send money error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle request money form submission
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    
    // Check KYC status first
    if (kycStatus !== 'completed' && kycStatus !== 'approved') {
      redirectToKyc('request');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validate form
      if (!requestForm.requestedFrom || !requestForm.requestNote || !requestForm.amountUsd) {
        setError('All fields are required');
        setLoading(false);
        return;
      }
      
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/requests/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          requestedFrom: requestForm.requestedFrom,
          requestNote: requestForm.requestNote,
          amountUsd: parseFloat(requestForm.amountUsd)
        })
      });
      
      // For demo purposes, simulate successful API response
      setSuccess('Money request sent successfully!');
      
      // Reset form
      setRequestForm({
        requestedFrom: '',
        requestNote: '',
        amountUsd: ''
      });
    } catch (err) {
      setError('Failed to request money. Please try again.');
      console.error('Request money error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle unit send form submission
  const handleUnitSubmit = async (e) => {
    e.preventDefault();
    
    // Check KYC status first
    if (kycStatus !== 'completed' && kycStatus !== 'approved') {
      redirectToKyc('unit');
      return;
    }
    
    // Check if user has Unit account
    if (!hasUnitAccount) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validate form
      if (!unitForm.receiver || !unitForm.amount) {
        setError('Recipient and amount are required');
        setLoading(false);
        return;
      }
      
      const token = localStorage.getItem('token');
      const amountInCents = Math.round(parseFloat(unitForm.amount) * 100);
      
      const res = await fetch(`${API_BASE}/api/unit/payments/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiver: unitForm.receiver,
          amount: amountInCents,
          description: unitForm.note
        })
      });
      
      // For demo purposes, simulate successful API response
      setSuccess('Money sent successfully via Unit!');
      
      // Reset form
      setUnitForm({
        receiver: '',
        amount: '',
        note: ''
      });
      
      // Update balance
      fetchUserBalance();
    } catch (err) {
      setError('Failed to send money via Unit. Please try again.');
      console.error('Unit send error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle setup Unit account
  const handleSetupUnitAccount = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/unit/accounts/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // For demo purposes, simulate successful API response
      setSuccess('Banking account created successfully!');
      setHasUnitAccount(true);
    } catch (err) {
      setError('Failed to create banking account. Please try again.');
      console.error('Unit account setup error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Navigation />
      
      <main className="money-mover">
        {/* KYC Warning Banner */}
        {(kycStatus !== 'completed' && kycStatus !== 'approved') && (
          <div className="kyc-warning-banner">
            <p>Your identity verification is required before you can send or request money.</p>
            <button 
              className="primary-btn"
              onClick={() => redirectToKyc('transaction')}
            >
              Verify Identity
            </button>
          </div>
        )}
        
        {/* Balance Section */}
        <section className="balance-section">
          <div className="balance-card">
            <div className="balance-label">Available Balance</div>
            <div className="balance-amount">{balance}</div>
          </div>
        </section>
        
        {/* Success/Error Messages */}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        {/* Tabs */}
        <div className="tabs">
          <button 
            className={activeTab === 'send' ? 'active' : ''}
            onClick={() => handleTabChange('send')}
          >
            Send Money
          </button>
          <button 
            className={activeTab === 'request' ? 'active' : ''}
            onClick={() => handleTabChange('request')}
          >
            Request Money
          </button>
          <button 
            className={activeTab === 'unit' ? 'active' : ''}
            onClick={() => handleTabChange('unit')}
          >
            Bank Transfer
          </button>
        </div>
        
        {/* Send Money Section */}
        <section 
          className={`form-section ${activeTab !== 'send' ? 'hidden' : ''}`}
        >
          <h2>Send Money</h2>
          <form onSubmit={handleSendSubmit}>
            <input 
              type="text" 
              name="recipientName" 
              placeholder="Recipient Phone" 
              value={sendForm.recipientName}
              onChange={handleSendInputChange}
              required 
            />
            <input 
              type="text" 
              name="recipientCountry" 
              placeholder="Country Code (e.g., MX)" 
              value={sendForm.recipientCountry}
              onChange={handleSendInputChange}
              required 
            />
            <input 
              type="number" 
              name="amountUsd" 
              placeholder="Amount in USD" 
              value={sendForm.amountUsd}
              onChange={handleSendInputChange}
              required 
            />
            <button 
              type="submit" 
              disabled={loading || (kycStatus !== 'completed' && kycStatus !== 'approved')}
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </section>
        
        {/* Request Money Section */}
        <section 
          className={`form-section ${activeTab !== 'request' ? 'hidden' : ''}`}
        >
          <h2>Request Money</h2>
          <form onSubmit={handleRequestSubmit}>
            <input 
              type="text" 
              name="requestedFrom" 
              placeholder="Username or Phone" 
              value={requestForm.requestedFrom}
              onChange={handleRequestInputChange}
              required 
            />
            <input 
              type="text" 
              name="requestNote" 
              placeholder="Reason / Note" 
              value={requestForm.requestNote}
              onChange={handleRequestInputChange}
              required 
            />
            <input 
              type="number" 
              name="amountUsd" 
              placeholder="Amount in USD" 
              value={requestForm.amountUsd}
              onChange={handleRequestInputChange}
              required 
            />
            <button 
              type="submit" 
              disabled={loading || (kycStatus !== 'completed' && kycStatus !== 'approved')}
            >
              {loading ? 'Requesting...' : 'Request'}
            </button>
          </form>
        </section>
        
        {/* Unit Transfer Section */}
        <section 
          className={`form-section ${activeTab !== 'unit' ? 'hidden' : ''}`}
        >
          <h2>Bank Transfer</h2>
          <p className="section-description">
            Send money instantly to other Pagomigo users with Unit accounts.
          </p>
          
          {hasUnitAccount ? (
            <form onSubmit={handleUnitSubmit}>
              <div className="form-group">
                <label htmlFor="receiver">Recipient</label>
                <input 
                  id="receiver" 
                  name="receiver" 
                  type="text" 
                  placeholder="Phone or email" 
                  value={unitForm.receiver}
                  onChange={handleUnitInputChange}
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="amount">Amount</label>
                <div className="amount-input-wrapper">
                  <span className="currency-symbol">$</span>
                  <input 
                    id="amount" 
                    name="amount" 
                    type="text" 
                    placeholder="0.00" 
                    value={unitForm.amount}
                    onChange={handleUnitInputChange}
                    required 
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="note">Note (Optional)</label>
                <input 
                  id="note" 
                  name="note" 
                  type="text" 
                  placeholder="What's it for?" 
                  value={unitForm.note}
                  onChange={handleUnitInputChange}
                />
              </div>
              <button 
                type="submit" 
                disabled={loading || (kycStatus !== 'completed' && kycStatus !== 'approved')}
              >
                {loading ? 'Sending...' : 'Send via Unit'}
              </button>
            </form>
          ) : (
            <div className="no-account-container">
              <h3>Banking Account Required</h3>
              <p>To use instant transfers, you need to set up a Unit banking account.</p>
              <button 
                className="primary-btn"
                onClick={handleSetupUnitAccount}
                disabled={loading}
              >
                {loading ? 'Setting Up...' : 'Set Up Banking Account'}
              </button>
            </div>
          )}
        </section>
      </main>
      
      <Footer />
    </>
  );
};

export default MoneyMover;