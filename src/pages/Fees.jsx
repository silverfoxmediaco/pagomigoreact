// src/pages/Fees.jsx
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './Fees.css';

// Import components 
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const Fees = () => {
  const { t } = useLanguage();

  return (
    <>
      <Navigation />
      
      <main className="fees-main">
        <div className="fees-container">
          <div className="fees-header">
            <h1>{t('feesTitle')}</h1>
            <p className="fees-subtitle">{t('feesSubtitle')}</p>
          </div>

          {/* Account & Card Services */}
          <section className="fees-section">
            <h2>{t('accountCardServices')}</h2>
            
            <div className="fees-subsection">
              <h3>{t('accountManagement')}</h3>
              <div className="fees-grid">
                <div className="fee-item">
                  <span className="fee-description">{t('openingAccount')}</span>
                  <span className="fee-amount free">{t('free')}</span>
                </div>
                <div className="fee-item">
                  <span className="fee-description">{t('monthlyMaintenance')}</span>
                  <span className="fee-amount free">{t('noMonthlyFees')}</span>
                </div>
                <div className="fee-item">
                  <span className="fee-description">{t('accountClosure')}</span>
                  <span className="fee-amount free">{t('free')}</span>
                </div>
              </div>
            </div>

            <div className="fees-subsection">
              <h3>{t('debitCardServices')}</h3>
              <div className="fees-grid">
                <div className="fee-item">
                  <span className="fee-description">{t('cardIssuance')}</span>
                  <span className="fee-amount free">{t('free')}</span>
                </div>
                <div className="fee-item">
                  <span className="fee-description">{t('replacementCard')}</span>
                  <span className="fee-amount">$5.00</span>
                </div>
                <div className="fee-item">
                  <span className="fee-description">{t('expeditedDelivery')}</span>
                  <span className="fee-amount">$15.00</span>
                </div>
                <div className="fee-item">
                  <span className="fee-description">{t('cardActivation')}</span>
                  <span className="fee-amount free">{t('free')}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Money Transfers */}
          <section className="fees-section">
            <h2>{t('moneyTransfers')}</h2>
            
            <div className="fees-subsection">
              <h3>{t('domesticTransfers')}</h3>
              <div className="fees-grid">
                <div className="fee-item">
                  <span className="fee-description">{t('pagoToPago')}</span>
                  <span className="fee-amount free">{t('free')}</span>
                </div>
                <div className="fee-item">
                  <span className="fee-description">{t('bankTransfers')}</span>
                  <span className="fee-amount free">{t('free')}</span>
                </div>
                <div className="fee-item">
                  <span className="fee-description">{t('instantTransfers')}</span>
                  <span className="fee-amount">$1.75 {t('perTransaction')}</span>
                </div>
              </div>
            </div>

            <div className="fees-subsection">
              <h3>{t('internationalTransfers')}</h3>
              <div className="international-transfers">
                <div className="transfer-region">
                  <h4>{t('toMexico')}</h4>
                  <div className="fees-grid">
                    <div className="fee-item">
                      <span className="fee-description">{t('standardProcessing')}</span>
                      <span className="fee-amount">1.5% + $2.99 {t('fixedFee')}</span>
                    </div>
                    <div className="fee-item">
                      <span className="fee-description">{t('expressDelivery')}</span>
                      <span className="fee-amount">{t('additional')} $3.99</span>
                    </div>
                  </div>
                </div>

                <div className="transfer-region">
                  <h4>{t('toCentralAmerica')}</h4>
                  <div className="fees-grid">
                    <div className="fee-item">
                      <span className="fee-description">{t('standardProcessing')}</span>
                      <span className="fee-amount">2.0% + $3.49 {t('fixedFee')}</span>
                    </div>
                    <div className="fee-item">
                      <span className="fee-description">{t('expressDelivery')}</span>
                      <span className="fee-amount">{t('additional')} $4.99</span>
                    </div>
                  </div>
                </div>

                <div className="transfer-region">
                  <h4>{t('toSouthAmerica')}</h4>
                  <div className="fees-grid">
                    <div className="fee-item">
                      <span className="fee-description">{t('standardProcessing')}</span>
                      <span className="fee-amount">2.5% + $3.99 {t('fixedFee')}</span>
                    </div>
                    <div className="fee-item">
                      <span className="fee-description">{t('expressDelivery')}</span>
                      <span className="fee-amount">{t('additional')} $5.99</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="fees-subsection">
              <h3>{t('transferLimits')}</h3>
              <div className="fees-grid">
                <div className="fee-item">
                  <span className="fee-description">{t('dailyLimit')}</span>
                  <span className="fee-amount">$2,500</span>
                </div>
                <div className="fee-item">
                  <span className="fee-description">{t('monthlyLimit')}</span>
                  <span className="fee-amount">$10,000</span>
                </div>
                <div className="fee-item">
                  <span className="fee-description">{t('singleTransaction')}</span>
                  <span className="fee-amount">$999</span>
                </div>
              </div>
            </div>
          </section>

          {/* ATM & Cash Services */}
          <section className="fees-section">
            <h2>{t('atmCashServices')}</h2>
            
            <div className="fees-subsection">
              <h3>{t('atmWithdrawals')}</h3>
              <div className="fees-grid">
                <div className="fee-item">
                  <span className="fee-description">{t('inNetworkAtms')}</span>
                  <span className="fee-amount free">{t('free')} {t('upToFourPerMonth')}</span>
                </div>
                <div className="fee-item">
                  <span className="fee-description">{t('outOfNetworkAtms')}</span>
                  <span className="fee-amount">$2.50 {t('perTransaction')}</span>
                </div>
                <div className="fee-item">
                  <span className="fee-description">{t('internationalAtm')}</span>
                  <span className="fee-amount">$3.50 {t('foreignBankFees')}</span>
                </div>
              </div>
            </div>

            <div className="fees-subsection">
              <h3>{t('cashServices')}</h3>
              <div className="fees-grid">
                <div className="fee-item">
                  <span className="fee-description">{t('cashDeposits')}</span>
                  <span className="fee-amount free">{t('free')} {t('upTo500Month')}</span>
                </div>
                <div className="fee-item">
                  <span className="fee-description">{t('mobileCheckDeposits')}</span>
                  <span className="fee-amount free">{t('free')}</span>
                </div>
                <div className="fee-item">
                  <span className="fee-description">{t('physicalCheckDeposits')}</span>
                  <span className="fee-amount">$1.50 {t('perCheck')}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Currency Exchange */}
          <section className="fees-section">
            <h2>{t('currencyExchange')}</h2>
            <div className="fees-grid">
              <div className="fee-item">
                <span className="fee-description">{t('usdToMxn')}</span>
                <span className="fee-amount">{t('marketRateSpread')}</span>
              </div>
              <div className="fee-item">
                <span className="fee-description">{t('allOtherCurrencies')}</span>
                <span className="fee-amount">{t('marketRateSpreadOther')}</span>
              </div>
            </div>
          </section>

          {/* Using Cards for Transfers */}
          <section className="fees-section">
            <h2>{t('paymentMethods')}</h2>
            <div className="fees-grid">
              <div className="fee-item">
                <span className="fee-description">{t('bankAccountFunding')}</span>
                <span className="fee-amount free">{t('free')}</span>
              </div>
              <div className="fee-item">
                <span className="fee-description">{t('debitCardFunding')}</span>
                <span className="fee-amount">2.9% + $0.30 {t('fixedFee')}</span>
              </div>
              <div className="fee-item">
                <span className="fee-description">{t('creditCardFunding')}</span>
                <span className="fee-amount">3.5% + $0.30 {t('fixedFee')}</span>
              </div>
            </div>
          </section>

          {/* Currency Table */}
          <section className="fees-section">
            <h2>{t('fixedFeesByCurrency')}</h2>
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
            <h2>{t('waysToSave')}</h2>
            
            <div className="tips-grid">
              <div className="tip-category">
                <h3>{t('freeServicesToMaximize')}</h3>
                <ul>
                  <li>{t('sendToOtherUsers')}</li>
                  <li>{t('useInNetworkAtms')}</li>
                  <li>{t('fundFromBank')}</li>
                  <li>{t('useMobileDeposit')}</li>
                  <li>{t('scheduleBillPayments')}</li>
                </ul>
              </div>
              
              <div className="tip-category">
                <h3>{t('moneySavingTips')}</h3>
                <ul>
                  <li>{t('bundleTransfers')}</li>
                  <li>{t('monitorRates')}</li>
                  <li>{t('useStandardProcessing')}</li>
                  <li>{t('freeDepositsUnder500')}</li>
                  <li>{t('useQrPayments')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Footer Notes */}
          <section className="fees-footer-notes">
            <div className="notes-grid">
              <div className="note-item">
                <h4>{t('feeScheduleNotes')}</h4>
                <ul>
                  <li>{t('feesSubjectToChange')}</li>
                  <li>{t('exchangeRatesUpdated')}</li>
                  <li>{t('sameDayServices')}</li>
                </ul>
              </div>
              
              <div className="note-item">
                <h4>{t('competitiveAdvantage')}</h4>
                <ul>
                  <li>{t('lowerFeesToMexico')}</li>
                  <li>{t('fasterDelivery')}</li>
                  <li>{t('noMonthlyMaintenanceFees')}</li>
                  <li>{t('multiLanguageSupport')}</li>
                </ul>
              </div>
            </div>
            
            <div className="contact-info">
              <p><strong>{t('questionsAboutFees')}</strong> {t('contactSupport')} <a href="mailto:soporte@pagomigo.com">soporte@pagomigo.com</a> or 1-800-PAGOMIGO</p>
              <p className="transparency-note">{t('transparencyNote')}</p>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default Fees;