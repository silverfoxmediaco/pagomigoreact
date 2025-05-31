// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import { useLanguage } from '../context/LanguageContext';

// Import components 
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import SignupModal from '../components/SignupModal';

// Import images
import heroVideo from '../assets/Spanishgirlshopping.mp4'; 
import mobileVideo from '../assets/spanishgirlshoppingmobile.mp4'; 
import coffeemaker from '../assets/newcoffeemaker.png';
import dogbed from '../assets/newdogbed.png';
import sneakers from '../assets/newsneakers.png';
import gameconsole from '../assets/newgameconsole.png';
import tires from '../assets/newtires.png';
import watch from '../assets/newwatch.png';
import visaRoot from '../assets/visawithnewpgmlogo.png';
import bonitaSenorita from '../assets/bonitasenoritaphone.png';
import sendMoney from '../assets/sendmoneyiphone.png';
import requestMoney from '../assets/requestmoneyiphoneportrait.png';
import billPay from '../assets/billpayportait.png';

const Home = () => {
  const { t } = useLanguage();
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  // Debug effect for state changes
  useEffect(() => {
    console.log('isSignupModalOpen changed to:', isSignupModalOpen);
  }, [isSignupModalOpen]);

  // Animation effect
  useEffect(() => {
    // Animate elements on scroll
    const animatedElements = document.querySelectorAll(".debit-card-text, .debit-card-image");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    animatedElements.forEach(el => observer.observe(el));

    // Cleanup function
    return () => {
      animatedElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  // Enhanced scroll animation effect for retailvision section with parallax background
useEffect(() => {
  let ticking = false;

  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const retailSection = document.querySelector('.retailvision');
        
        if (retailSection) {
          const rect = retailSection.getBoundingClientRect();
          const sectionTop = rect.top + scrollY;
          const sectionHeight = rect.height;
          
          // Only animate when section is in viewport
          if (scrollY >= sectionTop - window.innerHeight && scrollY <= sectionTop + sectionHeight) {
            const payText = document.querySelector('.retailpayh2');
            const easierText = document.querySelector('.retaileasierh2');
            
            // Calculate scroll progress within the section
            const scrollProgress = (scrollY - (sectionTop - window.innerHeight)) / (window.innerHeight + sectionHeight);
            
            if (payText && easierText) {
              // Move "Pagar" from right to left
              const payTranslateX = (1 - scrollProgress) * 300 - 150;
              
              // Move "Más fácil" from left to right  
              const easierTranslateX = (scrollProgress - 0.5) * 300;
              
              payText.style.transform = `translateX(${payTranslateX}px)`;
              easierText.style.transform = `translateX(${easierTranslateX}px)`;
            }

            // ADD THIS: Different parallax speeds for mobile vs desktop
            const isMobile = window.innerWidth <= 768;
            const parallaxSpeed = isMobile ? -0.03 : -0.1; // Much slower on mobile
            
            const backgroundOffset = scrollY * parallaxSpeed;
            retailSection.style.backgroundPosition = `center ${backgroundOffset}px`;
          }
        }
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Clean up event listener
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
}, []);

  const openSignupModal = () => {
    console.log('Join Now button clicked');
    console.log('Setting isSignupModalOpen to true');
    setIsSignupModalOpen(true);
    console.log('Current state will be:', true);
    window.dispatchEvent(new CustomEvent('open-signup-modal'));
    console.log('Custom event dispatched');
  };

  const closeSignupModal = () => {
    console.log('closeSignupModal called');
    setIsSignupModalOpen(false);
  };

  return (
    <>
      <Navigation />
      
      <main className="hero-section">
        <div className="video-background">
          <div className="video-overlay"></div>
          <video autoPlay muted loop id="hero-video">
            <source src={heroVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <video autoPlay muted loop playsInline preload="auto" id="mobile-video" className="hero-video">
            <source src={mobileVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="hero-text">
          <h1 className="heroh1">{t('heroTitle')}</h1>
          <h2 className="heroh2">{t('heroSubtitle')}</h2>
          <div className="cta-buttons">
            <Link to="/moneymover" className="send-cta-button">{t('sendRequestCTA')}</Link>
          </div>
          <div>
            <h3 className="heroh3">{t('joinMessage')}</h3>
            <button id="signupbtn" onClick={openSignupModal}>{t('joinNowCTA')}</button>
          </div>
        </div>
      </main>

      <section className="retailsection">
        <h2 className="retailsectionh2">{t('shopAnywhere')}</h2>
        <div className="retailsectiongrid">
          <div className="retailitem">
            <div className="retailimagecontainer">
              <img src={coffeemaker} alt="coffee maker" className="coffeemaker" />
            </div>
          </div>
          <div className="retailitem">
            <div className="retailimagecontainer">
              <img src={dogbed} alt="Dog bed" className="dogbed" />
            </div>
          </div>
          <div className="retailitem">
            <div className="retailimagecontainer">
              <img src={sneakers} alt="sneakers" className="sneakers" />
            </div>
          </div>
          <div className="retailitem">
            <div className="retailimagecontainer">
              <img src={gameconsole} alt="gameconsole" className="gameconsole" />
            </div>
          </div>
          <div className="retailitem">
            <div className="retailimagecontainer">
              <img src={tires} alt="new tires" className="newtires" />
            </div>
          </div>
          <div className="retailitem">
            <div className="retailimagecontainer">
              <img src={watch} alt="new watch" className="newwatch" />
            </div>
          </div>
        </div>
      </section>

      {/* Simple parallax section - no complex hooks needed */}
      <section className='retailvision'>
        <h2 className='retailpayh2'>{t('pay')}</h2>
        <h2 className='retaileasierh2'>{t('Easier')}</h2>
      </section>

      <section className="debit-card-section">
        <div className="debit-card-grid">
          <div className="debit-card-text">
            <h2>{t('debitCardTitle')}</h2>
            <img src={visaRoot} alt="pagomigo visa root" className="visa" />
            <p>{t('debitCardDesc')}</p>
      
            <div className="features-list">
              <div className="feature-item">
                <h3>{t('instantAccess')}</h3>
                <p>{t('instantAccessDesc')}</p>
              </div>
              <div className="feature-item">
                <h3>{t('touchlessPayments')}</h3>
                <p>{t('touchlessPaymentsDesc')}</p>
              </div>
              <div className="feature-item">
                <h3>{t('billPayFeature')}</h3>
                <p>{t('billPayFeatureDesc')}</p>
              </div>
            </div>
          </div>
      
          <div className="debit-card-image">
            <img src={bonitaSenorita} alt="Bonita senorita using her phone" />
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="featuresh2">{t('features')}</h2>
        <div className="features-grid">
          <div className="feature-item">
            <Link to="/moneymover">
              <img src={sendMoney} alt="Send Money Icon" />
            </Link>
            <h3>{t('sendMoney')}</h3>
            <p>{t('sendMoneyDesc')}</p>
          </div>
          <div className="feature-item">
            <Link to="/moneymover">
              <img src={requestMoney} alt="Request Money Icon" />
            </Link>
            <h3>{t('requestMoney')}</h3>
            <p>{t('requestMoneyDesc')}</p>
          </div>
          <div className="feature-item">
            <Link to="/billpay">
              <img src={billPay} alt="Pay Bills Icon" />
            </Link>
            <h3>{t('payBills')}</h3>
            <p>{t('payBillsDesc')}</p>
          </div>
        </div>
      </section>
      
      <SignupModal 
        isOpen={isSignupModalOpen}
        onClose={closeSignupModal}
      />
      
      <Footer />
    </>
  );
};

export default Home;