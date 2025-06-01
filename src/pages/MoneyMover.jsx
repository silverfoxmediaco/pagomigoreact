// src/pages/MoneyMover.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import './MoneyMover.css';

const MoneyMover = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('send');
  const [userBalance, setUserBalance] = useState('$500.00');
  // const [kycStatus, setKycStatus] = useState('pending');
  const [kycStatus, setKycStatus] = useState('approved'); // Force approved for testing
  const [userRegion, setUserRegion] = useState('north_america');
  const [hasUnitAccount, setHasUnitAccount] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const [unitSendForm, setUnitSendForm] = useState({
    receiver: '',
    amount: '',
    note: ''
  });

  useEffect(() => {
    if (user) {
      // checkKycStatus(); // COMMENTED OUT - Skip KYC check
      checkUnitAccount();
      fetchUserBalance();
    }
  }, [user]);

  // Helper function to determine region from phone number
  const determineRegionFromPhone = (phone) => {
    if (!phone) return 'north_america';
    
    // North America (US, Canada)
    if (phone.startsWith('+1')) {
      return 'north_america';
    }
    
    // Central America country codes
    if (phone.startsWith('+52') ||  // Mexico
        phone.startsWith('+502') || // Guatemala
        phone.startsWith('+503') || // El Salvador
        phone.startsWith('+504') || // Honduras
        phone.startsWith('+505') || // Nicaragua
        phone.startsWith('+506') || // Costa Rica
        phone.startsWith('+507')) { // Panama
      return 'central_america';
    }
    
    // South America (add more country codes as needed)
    if (phone.startsWith('+54') ||  // Argentina
        phone.startsWith('+55') ||  // Brazil
        phone.startsWith('+56') ||  // Chile
        phone.startsWith('+57') ||  // Colombia
        phone.startsWith('+58') ||  // Venezuela
        phone.startsWith('+51') ||  // Peru
        phone.startsWith('+593') || // Ecuador
        phone.startsWith('+591')) { // Bolivia
      return 'south_america';
    }
    
    return 'north_america'; // Default
  };

  // COMMENTED OUT - Check KYC status
  /*
  const checkKycStatus = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      
      if (response.ok) {
        const userData = await response.json();
        
        // Determine user region (you can modify this logic based on your needs)
        const region = userData.region || determineRegionFromPhone(userData.phone) || 'north_america';
        setUserRegion(region);
        
        // Check KYC status based on region
        let kycStatus = 'pending';
        
        if (region === 'north_america') {
          // For North America - check Plaid identity verification
          kycStatus = userData.plaid_identity_status || userData.kyc_status || 'pending';
        } else {
          // For Central/South America - check Persona KYC
          kycStatus = userData.persona_kyc_status || userData.kyc_status || 'pending';
        }
        
        setKycStatus(kycStatus);
      }
    } catch (error) {
      console.error('Error checking KYC status:', error);
    }
  };
  */

  // Check Unit account status
  const checkUnitAccount = async () => {
    try {
      const response = await fetch('/api/unit/accounts/me', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      
      if (response.status === 404) {
        setHasUnitAccount(false);
      } else {
        setHasUnitAccount(true);
      }
    } catch (error) {
      console.error('Error checking Unit account:', error);
      setHasUnitAccount(false);
    }
  };

  // Fetch user balance
  const fetchUserBalance = async () => {
    try {
      // For now, always show $500.00 as in the original
      setUserBalance('$500.00');
      
      // You can uncomment and modify this when ready for real API integration
      /*
      const response = await fetch('/api/unit/accounts/balance', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserBalance(`$${(data.balance / 100).toFixed(2)}`);
      }
      */
      
    } catch (error) {
      console.error('Error fetching balance:', error);
      setUserBalance('$500.00');
    }
  };

  // Handle send money
  const handleSendMoney = async (e) => {
    e.preventDefault();
    
    // COMMENTED OUT - KYC verification check
    /*
    if (kycStatus !== 'approved') {
      alert('Identity verification required before sending money.');
      return;
    }
    */

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/transactions/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          recipientName: sendForm.recipientName,
          recipientCountry: sendForm.recipientCountry,
          amountUsd: parseFloat(sendForm.amountUsd)
        })
      });

      if (response.ok) {
        alert('Money sent successfully!');
        setSendForm({ recipientName: '', recipientCountry: '', amountUsd: '' });
        fetchUserBalance();
      } else {
        const result = await response.json();
        setError(result.message || 'Failed to send money. Please try again.');
      }
    } catch (error) {
      console.error('Send money error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle request money
  const handleRequestMoney = async (e) => {
    e.preventDefault();
    
    // COMMENTED OUT - KYC verification check
    /*
    if (kycStatus !== 'approved') {
      alert('Identity verification required before requesting money.');
      return;
    }
    */

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/requests/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          requestedFrom: requestForm.requestedFrom,
          requestNote: requestForm.requestNote,
          amountUsd: parseFloat(requestForm.amountUsd)
        })
      });

      if (response.ok) {
        alert('Money request sent successfully!');
        setRequestForm({ requestedFrom: '', requestNote: '', amountUsd: '' });
      } else {
        const result = await response.json();
        setError(result.message || 'Failed to request money. Please try again.');
      }
    } catch (error) {
      console.error('Request money error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Unit send money
  const handleUnitSendMoney = async (e) => {
    e.preventDefault();
    
    // COMMENTED OUT - KYC verification check
    /*
    if (kycStatus !== 'approved') {
      alert('Identity verification required before sending money.');
      return;
    }
    */

    if (!unitSendForm.receiver || !unitSendForm.amount) {
      setError('Please fill in all required fields.');
      return;
    }

    const amount = parseFloat(unitSendForm.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/unit/payments/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          receiver: unitSendForm.receiver,
          amount: Math.round(amount * 100), // Convert to cents
          description: unitSendForm.note
        })
      });

      if (response.ok) {
        alert('Money sent successfully via Unit!');
        setUnitSendForm({ receiver: '', amount: '', note: '' });
        fetchUserBalance();
      } else {
        const result = await response.json();
        setError(result.message || 'Failed to send money. Please try again.');
      }
    } catch (error) {
      console.error('Unit send error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Setup Unit account
  const setupUnitAccount = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/unit/accounts/create', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });

      if (response.ok) {
        alert('Banking account created successfully!');
        setHasUnitAccount(true);
      } else {
        const result = await response.json();
        alert(result.message || 'Failed to create banking account');
      }
    } catch (error) {
      console.error('Error setting up Unit account:', error);
      alert('An error occurred while setting up your banking account');
    } finally {
      setLoading(false);
    }
  };

  // COMMENTED OUT - KYC redirect function
  /*
  const redirectToKyc = () => {
    if (userRegion === 'north_america') {
      alert('We need to verify your identity using Plaid. You\'ll be redirected to complete identity verification.');
      // Redirect to your Plaid identity verification page
      window.location.href = '/dashboard#plaid-verification'; // or wherever your Plaid component is
    } else {
      alert('We need to verify your identity using Persona. You\'ll be redirected to complete KYC verification.');
      // Redirect to Persona KYC page (you'll need to implement this)
      window.location.href = '/persona-kyc';
    }
  };
  */

  const isKycApproved = kycStatus === 'approved';

  return (
    <>
      <Navigation />
      
      <main className="money-mover">
        {/* COMMENTED OUT - KYC Warning Banner */}
        {/*
        {!isKycApproved && (
          <div className="kyc-warning-banner">
            <p>
              Your identity verification is required before you can send or request money.
              {userRegion === 'north_america' 
                ? ' (Plaid Identity Verification for North American users)'
                : ' (Persona KYC for Central/South American users)'
              }
            </p>
            <button onClick={redirectToKyc} className="primary-btn">
              Verify Identity
            </button>
          </div>
        )}
        */}

        {/* Balance Section */}
        <section className="balance-section">
          <div className="balance-card">
            <div className="balance-label">Available Balance</div>
            <div className="balance-amount">{userBalance}</div>
          </div>
        </section>

        {/* Tabs */}
        <div className="tabs">
          <button 
            className={activeTab === 'send' ? 'active' : ''}
            onClick={() => setActiveTab('send')}
          >
            Send Money
          </button>
          <button 
            className={activeTab === 'request' ? 'active' : ''}
            onClick={() => setActiveTab('request')}
          >
            Request Money
          </button>
          <button 
            className={activeTab === 'unit' ? 'active' : ''}
            onClick={() => setActiveTab('unit')}
          >
            Bank Transfer
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Send Money Section */}
        {activeTab === 'send' && (
          <section className="form-section">
            <h2>Send Money</h2>
            <form onSubmit={handleSendMoney}>
              <input
                type="text"
                placeholder="Recipient Phone"
                value={sendForm.recipientName}
                onChange={(e) => setSendForm({...sendForm, recipientName: e.target.value})}
                required
                // disabled={!isKycApproved} // COMMENTED OUT - Remove verification requirement
              />
              <input
                type="text"
                placeholder="Country Code (e.g., MX)"
                value={sendForm.recipientCountry}
                onChange={(e) => setSendForm({...sendForm, recipientCountry: e.target.value})}
                required
                // disabled={!isKycApproved} // COMMENTED OUT - Remove verification requirement
              />
              <input
                type="number"
                placeholder="Amount in USD"
                value={sendForm.amountUsd}
                onChange={(e) => setSendForm({...sendForm, amountUsd: e.target.value})}
                required
                // disabled={!isKycApproved} // COMMENTED OUT - Remove verification requirement
              />
              <button 
                type="submit" 
                disabled={loading}
                // disabled={loading || !isKycApproved} // COMMENTED OUT - Remove verification requirement
                // onClick={!isKycApproved ? redirectToKyc : undefined} // COMMENTED OUT - Remove verification redirect
              >
                {loading ? 'Sending...' : 'Send'}
              </button>
            </form>
          </section>
        )}

        {/* Request Money Section */}
        {activeTab === 'request' && (
          <section className="form-section">
            <h2>Request Money</h2>
            <form onSubmit={handleRequestMoney}>
              <input
                type="text"
                placeholder="Username or Phone"
                value={requestForm.requestedFrom}
                onChange={(e) => setRequestForm({...requestForm, requestedFrom: e.target.value})}
                required
                // disabled={!isKycApproved} // COMMENTED OUT - Remove verification requirement
              />
              <input
                type="text"
                placeholder="Reason / Note"
                value={requestForm.requestNote}
                onChange={(e) => setRequestForm({...requestForm, requestNote: e.target.value})}
                required
                // disabled={!isKycApproved} // COMMENTED OUT - Remove verification requirement
              />
              <input
                type="number"
                placeholder="Amount in USD"
                value={requestForm.amountUsd}
                onChange={(e) => setRequestForm({...requestForm, amountUsd: e.target.value})}
                required
                // disabled={!isKycApproved} // COMMENTED OUT - Remove verification requirement
              />
              <button 
                type="submit" 
                disabled={loading}
                // disabled={loading || !isKycApproved} // COMMENTED OUT - Remove verification requirement
                // onClick={!isKycApproved ? redirectToKyc : undefined} // COMMENTED OUT - Remove verification redirect
              >
                {loading ? 'Requesting...' : 'Request'}
              </button>
            </form>
          </section>
        )}

        {/* Unit Transfer Section */}
        {activeTab === 'unit' && (
          <>
            {!hasUnitAccount ? (
              <div className="no-account-container">
                <h3>Banking Account Required</h3>
                <p>To use instant transfers, you need to set up a Unit banking account.</p>
                <button 
                  onClick={setupUnitAccount} 
                  className="primary-btn"
                  disabled={loading}
                >
                  {loading ? 'Setting up...' : 'Set Up Banking Account'}
                </button>
              </div>
            ) : (
              <section className="form-section">
                <h2>Bank Transfer</h2>
                <p className="section-description">
                  Send money instantly to other Pagomigo users with Unit accounts.
                </p>
                <form onSubmit={handleUnitSendMoney}>
                  <div className="form-group">
                    <label htmlFor="unit-receiver-input">Recipient</label>
                    <input
                      id="unit-receiver-input"
                      type="text"
                      placeholder="Phone or email"
                      value={unitSendForm.receiver}
                      onChange={(e) => setUnitSendForm({...unitSendForm, receiver: e.target.value})}
                      required
                      // disabled={!isKycApproved} // COMMENTED OUT - Remove verification requirement
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="unit-amount-input">Amount</label>
                    <div className="amount-input-wrapper">
                      <span className="currency-symbol">$</span>
                      <input
                        id="unit-amount-input"
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="0.00"
                        value={unitSendForm.amount}
                        onChange={(e) => setUnitSendForm({...unitSendForm, amount: e.target.value})}
                        required
                        // disabled={!isKycApproved} // COMMENTED OUT - Remove verification requirement
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="unit-note-input">Note (Optional)</label>
                    <input
                      id="unit-note-input"
                      type="text"
                      placeholder="What's it for?"
                      value={unitSendForm.note}
                      onChange={(e) => setUnitSendForm({...unitSendForm, note: e.target.value})}
                      // disabled={!isKycApproved} // COMMENTED OUT - Remove verification requirement
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={loading}
                    // disabled={loading || !isKycApproved} // COMMENTED OUT - Remove verification requirement
                    // onClick={!isKycApproved ? redirectToKyc : undefined} // COMMENTED OUT - Remove verification redirect
                  >
                    {loading ? 'Sending...' : 'Send via Unit'}
                  </button>
                </form>
              </section>
            )}
          </>
        )}
      </main>

      <Footer />
    </>
  );
};

export default MoneyMover;