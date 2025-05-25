// src/pages/BillPay.jsx
import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import './BillPay.css';

// Import SVG icons (you'll need to add these to your assets folder)
import electricIcon from '../assets/electric_bolt_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg';
import waterIcon from '../assets/water_drop_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg';
import wifiIcon from '../assets/wifi_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg';
import gasIcon from '../assets/gas_meter_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg';
import houseIcon from '../assets/cottage_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg';
import apartmentIcon from '../assets/apartment_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg';
import carIcon from '../assets/directions_car_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg';
import motorcycleIcon from '../assets/motorcycle_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg';
import insuranceIcon from '../assets/car_crash_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg';
import { useAuth } from '../context/AuthContext';

const BillPay = () => {
  const { user } = useAuth(); // Get current user
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  // UPDATED HANDLEPAYMENT FUNCTION WITH UNIT API INTEGRATION
  const handlePayment = async (paymentType) => {
    if (!user) {
      alert('Please log in to make payments');
      return;
    }

    setLoading(true);
    setPaymentStatus(null);

    try {
      // Replace with your actual Unit API endpoint
      const response = await fetch('/api/unit/bill-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`, // Your auth token
        },
        body: JSON.stringify({
          paymentType: paymentType,
          // You'll need to collect these from user input or forms
          payeeId: 'utility-company-id', // This would come from a form
          amount: 100, // This would come from user input
          accountId: user.unitAccountId, // User's Unit account ID
          memo: `${paymentType} bill payment`
        })
      });

      const result = await response.json();

      if (response.ok) {
        setPaymentStatus(`${paymentType} payment successful!`);
        console.log('Payment successful:', result);
        // Optionally redirect or update UI
      } else {
        throw new Error(result.message || 'Payment failed');
      }

    } catch (error) {
      console.error('Payment failed:', error);
      setPaymentStatus(`Payment failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      
      <div className="billpay-page">
        <h1 className="billpay-title">Bill Pay</h1>
        
        {/* Payment Status Messages */}
        {paymentStatus && (
          <div className={`payment-status ${paymentStatus.includes('failed') ? 'error' : 'success'}`}>
            {paymentStatus}
          </div>
        )}
        
        <main className="billpay">
          {/* Utilities Section */}
          <section className="utilities">
            <h2>Utilities</h2>
            <p>Pay your utilities with ease.</p>
            <div className="utilities-list">
              <div className="utility-item">
                <button 
                  className="utilitiesbtn"
                  onClick={() => handlePayment('Electricity')}
                  disabled={loading}
                >
                  <img src={electricIcon} alt="Electricity" />
                  <span>{loading ? 'Processing...' : 'Pay Electricity'}</span>
                </button>
              </div>
              
              <div className="utility-item">
                <button 
                  className="utilitiesbtn"
                  onClick={() => handlePayment('Water')}
                  disabled={loading}
                >
                  <img src={waterIcon} alt="Water" />
                  <span>{loading ? 'Processing...' : 'Pay Water'}</span>
                </button>
              </div>
              
              <div className="utility-item">
                <button 
                  className="utilitiesbtn"
                  onClick={() => handlePayment('Internet')}
                  disabled={loading}
                >
                  <img src={wifiIcon} alt="Internet" />
                  <span>{loading ? 'Processing...' : 'Pay Internet'}</span>
                </button>
              </div>
              
              <div className="utility-item">
                <button 
                  className="utilitiesbtn"
                  onClick={() => handlePayment('Gas')}
                  disabled={loading}
                >
                  <img src={gasIcon} alt="Gas" />
                  <span>{loading ? 'Processing...' : 'Pay Gas'}</span>
                </button>
              </div>
            </div>
          </section>

          {/* Rent/Mortgage Section */}
          <section className="rentmortgage">
            <h2>Rent / Mortgage</h2>
            <p>Pay your rent or mortgage securely and on time.</p>
            <div className="rentmortgage-list">
              <div className="rentmortgage-item">
                <button 
                  className="rentbtn"
                  onClick={() => handlePayment('Mortgage')}
                  disabled={loading}
                >
                  <img src={houseIcon} alt="House" />
                  <span>{loading ? 'Processing...' : 'Pay Mortgage'}</span>
                </button>
              </div>
              
              <div className="rentmortgage-item">
                <button 
                  className="rentbtn"
                  onClick={() => handlePayment('Rent')}
                  disabled={loading}
                >
                  <img src={apartmentIcon} alt="Apartment" />
                  <span>{loading ? 'Processing...' : 'Pay Rent'}</span>
                </button>
              </div>
            </div>
          </section>

          {/* Automotive Section */}
          <section className="automotive">
            <h2>Car / Truck Loan</h2>
            <p>Manage your automotive loans & Insurance with ease.</p>
            <div className="automotive-list">
              <div className="carloan">
                <button 
                  className="autoloan"
                  onClick={() => handlePayment('Auto Loan')}
                  disabled={loading}
                >
                  <img src={carIcon} alt="Car" />
                  <span>{loading ? 'Processing...' : 'Pay Auto Loan'}</span>
                </button>
              </div>

              <div className="motorcycleloan">
                <button 
                  className="autoloan"
                  onClick={() => handlePayment('Bike Loan')}
                  disabled={loading}
                >
                  <img src={motorcycleIcon} alt="Motorcycle" />
                  <span>{loading ? 'Processing...' : 'Pay Bike Loan'}</span>
                </button>
              </div>
              
              <div className="insurance">
                <button 
                  className="autoloan"
                  onClick={() => handlePayment('Insurance')}
                  disabled={loading}
                >
                  <img src={insuranceIcon} alt="Insurance" />
                  <span>{loading ? 'Processing...' : 'Pay Insurance'}</span>
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
      
      <Footer />
    </>
  );
};

export default BillPay;