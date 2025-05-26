// src/pages/Fees.jsx
import React from 'react';
import './Fees.css';

// Import components 
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const Fees = () => {
  return (
    <>
      <Navigation />
      
      <main className="fees-main">
        <div className="fees-container">
          <div className="fees-header">
            <h1>Pagomigo Fees & Pricing</h1>
            <p className="fees-subtitle">Transparent pricing designed for the Hispanic community</p>
          </div>

          {/* Account & Card Services */}
          <section className="fees-section">
            <h2>Account & Card Services</h2>
            
            <div className="fees-subsection">
              <h3>Account Management</h3>
              <div className="fees-grid">
                <div className="fee-item">
                  <span className="fee-description">Opening a Pagomigo account</span>
                  <span className="fee-amount free">FREE</span>
                </div>
                <div className="fee-item">
                  <span className="fee-description">Monthly maintenance fee</span>
                  <span className="fee-amount free">$0 (No monthly fees)</span>
                </div>
                <div className="fee-item">
                  <span className="fee-description">Account closure</span>
                  <span className="fee-amount free">FREE</span>
                </div>
              </div>
            </div>

            <div className="fees-subsection">
              <h3>Debit Card Services</h3>
              <div className="fees-grid">
                <div className="fee-item">
                  <span className="fee-description">Card issuance (first card)</span>
                  <span className="fee-amount free">FREE</span>
                </div>
                <div className="fee-item">
                  <span className="fee-description">Replacement card</span>
                  <span className="fee-amount">$5.00</span>
                </div>
                <div className="fee-item">
                  <span className="fee-description">Expedited card delivery</span>
                  <span className="fee-amount">$15.00</span>
                </div>
                <div className="fee-item">
                  <span className="fee-description">Card activation</span>
                  <span className="fee-amount free">FREE</span>
                </div>
              </div>
            </div>
          </section>

          {/* Money Transfers */}
          <section className="fees-section">
            <h2>Money Transfers</h2>
            
            <div className="fees-subsection">
              <h3>Domestic Transfers (Within US)</h3>
              <div className="fees-grid">
                <div className="fee-item">
                  <span className="fee-description">Pagomigo to Pagomigo</span>
                  <span className="fee-amount free">FREE</span>
                </div>
                <div className="fee-item">
                  <span className="fee-description">Bank account transfers (standard)</span>
                  <span className="fee-amount free">FREE</span>
                </div>
                <div className="fee-item">
                  <span className="fee-description">Instant transfers</span>
                  <span className="fee-amount">$1.75 per transaction</span>
                </div>
              </div>
            </div>

            <div className="fees-subsection">
              <h3>International Transfers</h3>
              <div className="international-transfers">
                <div className="transfer-region">
                  <h4>To Mexico</h4>
                  <div className="fees-grid">
                    <div className="fee-item">
                      <span className="fee-description">Standard processing</span>
                      <span className="fee-amount">1.5% + $2.99 fixed fee</span>
                    </div>
                    <div className="fee-item">
                      <span className="fee-description">Express delivery (under 30 minutes)</span>
                      <span className="fee-amount">Additional $3.99</span>
                    </div>
                  </div>
                </div>

                <div className="transfer-region">
                  <h4>To Central America</h4>
                  <div className="fees-grid">
                    <div className="fee-item">
                      <span className="fee-description">Standard processing</span>
                      <span className="fee-amount">2.0% + $3.49 fixed fee</span>
                    </div>
                    <div className="fee-item">
                      <span className="fee-description">Express delivery</span>
                      <span className="fee-amount">Additional $4.99</span>
                    </div>
                  </div>
                </div>

                <div className="transfer-region">
                  <h4>To South America</h4>
                  <div className="fees-grid">
                    <div className="fee-item">
                      <span className="fee-description">Standard processing</span>
                      <span className="fee-amount">2.5% + $3.99 fixed fee</span>
                    </div>
                    <div className="fee-item">
                      <span className="fee-description">Express delivery</span>
                      <span className="fee-amount">Additional $5.99</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="fees-subsection">
              <h3>Transfer Limits</h3>
              <div className="fees-grid">
                <div className="fee-item">
                  <span className="fee-description">Daily limit</span>
                  <span className="fee-amount">$2,500</span>
                </div>
                <div className="fee-item">
                  <span className="fee-description">Monthly limit</span>
                  <span className="fee-amount">$10,000</span>
                </div>
                <div className="fee-item">
                  <span className="fee-description">Single transaction (no verification)</span>
                  <span className="fee-amount">$999</span>
                </div>
              </div>
            </div>
          </section>

          {/* ATM & Cash Services */}
          <section className="fees-section">
            <h2>ATM & Cash Services</h2>
            
            <div className="fees-subsection">
              <h3>ATM Withdrawals</h3>
              <div className="fees-grid">
                <div className="fee-item">
                  <span className="fee-description">In-network ATMs</span>
                  <span className="fee-amount free">FREE (up to 4 per month)</span>
                </div>
                <div className="fee-item">
                  <span className="fee-description">Out-of-network ATMs</span>
                  <span className="fee-amount">$2.50 per transaction</span>
                </div>
                <div className="fee-item">
                  <span className="fee-description">International ATM usage</span>
                  <span className="fee-amount">$3.50 + foreign bank fees</span>
                </div>
              </div>
            </div>

            <div className="fees-subsection">
              <h3>Cash Services</h3>
              <div className="fees-grid">
                <div className="fee-item">
                  <span className="fee-description">Cash deposits at partner locations</span>
                  <span className="fee-amount free">FREE (up to $500/month, then $1.99)</span>
                </div>
                <div className="fee-item">
                  <span className="fee-description">Mobile check deposits</span>
                  <span className="fee-amount free">FREE</span>
                </div>
                <div className="fee-item">
                  <span className="fee-description">Physical check deposits</span>
                  <span className="fee-amount">$1.50 per check</span>
                </div>
              </div>
            </div>
          </section>

          {/* Currency Exchange */}
          <section className="fees-section">
            <h2>Currency Exchange</h2>
            <div className="fees-grid">
              <div className="fee-item">
                <span className="fee-description">USD to Mexican Peso</span>
                <span className="fee-amount">Market rate + 2.0% spread</span>
              </div>
              <div className="fee-item">
                <span className="fee-description">All other currencies</span>
                <span className="fee-amount">Market rate + 2.5% spread</span>
              </div>
            </div>
          </section>

          {/* Using Cards for Transfers */}
          <section className="fees-section">
            <h2>Payment Methods</h2>
            <div className="fees-grid">
              <div className="fee-item">
                <span className="fee-description">Bank account funding</span>
                <span className="fee-amount free">FREE</span>
              </div>
              <div className="fee-item">
                <span className="fee-description">Debit card funding</span>
                <span className="fee-amount">2.9% + $0.30 fixed fee</span>
              </div>
              <div className="fee-item">
                <span className="fee-description">Credit card funding</span>
                <span className="fee-amount">3.5% + $0.30 fixed fee</span>
              </div>
            </div>
          </section>

          {/* Currency Table */}
          <section className="fees-section">
            <h2>Fixed Fees by Currency (International Transfers)</h2>
            <div className="currency-table">
              <div className="currency-row">
                <span className="currency-name">Mexican Peso (MXN)</span>
                <span className="currency-fee">$2.99</span>
              </div>
              <div className="currency-row">
                <span className="currency-name">Guatemalan Quetzal (GTQ)</span>
                <span className="currency-fee">$3.49</span>
              </div>
              <div className="currency-row">
                <span className="currency-name">Honduran Lempira (HNL)</span>
                <span className="currency-fee">$3.49</span>
              </div>
              <div className="currency-row">
                <span className="currency-name">Colombian Peso (COP)</span>
                <span className="currency-fee">$3.99</span>
              </div>
              <div className="currency-row">
                <span className="currency-name">Peruvian Sol (PEN)</span>
                <span className="currency-fee">$3.99</span>
              </div>
              <div className="currency-row">
                <span className="currency-name">Ecuadorian USD</span>
                <span className="currency-fee">$2.99</span>
              </div>
            </div>
          </section>

          {/* Money-Saving Tips */}
          <section className="fees-section tips-section">
            <h2>Ways to Save Money</h2>
            
            <div className="tips-grid">
              <div className="tip-category">
                <h3>Free Services to Maximize</h3>
                <ul>
                  <li>Send money to other Pagomigo users</li>
                  <li>Use in-network ATMs for cash withdrawals</li>
                  <li>Fund transfers from your bank account, not cards</li>
                  <li>Use mobile check deposit instead of physical deposits</li>
                  <li>Schedule bill payments in advance (not same-day)</li>
                </ul>
              </div>
              
              <div className="tip-category">
                <h3>Money-Saving Tips</h3>
                <ul>
                  <li>Bundle international transfers to reduce per-transaction fees</li>
                  <li>Monitor exchange rates for optimal transfer timing</li>
                  <li>Use standard processing instead of express when possible</li>
                  <li>Take advantage of free cash deposits under $500/month</li>
                  <li>Use QR code payments instead of card swipes</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Footer Notes */}
          <section className="fees-footer-notes">
            <div className="notes-grid">
              <div className="note-item">
                <h4>Fee Schedule Notes</h4>
                <ul>
                  <li>All fees are subject to change with 30 days written notice</li>
                  <li>Exchange rates are updated in real-time during business hours</li>
                  <li>Same-day services available Monday-Friday 8 AM - 8 PM EST</li>
                </ul>
              </div>
              
              <div className="note-item">
                <h4>Competitive Advantage</h4>
                <ul>
                  <li>Lower fees to Mexico vs traditional remittance (3-6% + $5-15)</li>
                  <li>Faster delivery times (30 minutes vs 1-3 days)</li>
                  <li>No monthly maintenance fees</li>
                  <li>Multi-language customer support</li>
                </ul>
              </div>
            </div>
            
            <div className="contact-info">
              <p><strong>For questions about fees:</strong> Contact customer support at <a href="mailto:soporte@pagomigo.com">soporte@pagomigo.com</a> or 1-800-PAGOMIGO</p>
              <p className="transparency-note">Pagomigo is committed to transparent pricing with no hidden fees. All costs are clearly displayed before you complete any transaction.</p>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default Fees;