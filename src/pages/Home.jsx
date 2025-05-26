// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

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
import visaRoot from '../assets/pagomigodisplayimage.png';
import bonitaSenorita from '../assets/bonitasenoritaphone.png';
import sendMoney from '../assets/sendmoneyiphone.png';
import requestMoney from '../assets/requestmoneyiphoneportrait.png';
import billPay from '../assets/billpayportait.png';


const Home = () => {
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

  // Scroll animation effect for retailvision section
  useEffect(() => {
    const handleScroll = () => {
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
            const payTranslateX = (1 - scrollProgress) * 300 - 150; // Starts at 150px right, ends at -150px left
            
            // Move "Más fácil" from left to right  
            const easierTranslateX = (scrollProgress - 0.5) * 300; // Starts at -150px left, ends at 150px right
            
            payText.style.transform = `translateX(${payTranslateX}px)`;
            easierText.style.transform = `translateX(${easierTranslateX}px)`;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    
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
          <h1 className="heroh1">Envía dinero con inteligencia,<br />seguridad y velocidad.</h1>
          <h2 className="heroh2">The only Digital Wallet You Need.</h2>
          <div className="cta-buttons">
            <Link to="/moneymover" className="send-cta-button">Send/Request Payment</Link>
          </div>
          <div>
            <h3 className="heroh3">Únete ahora para empezar a enviar y recibir dinero.</h3>
            <button id="signupbtn" onClick={openSignupModal}>Join Now</button>
          </div>
        </div>
        </main>

      <section className="retailsection">
        <h2 className="retailsectionh2">Shop Anywhere Using Pagomigo!</h2>
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

      <section className="debit-card-section">
        <div className="debit-card-grid">
          <div className="debit-card-text">
            <h2>Use Your Pagomigo Debit Card Anywhere</h2>
            <img src={visaRoot} alt="pagomigo visa root" className="visa" />
            <p>Shop online or in-store, pay bills, and access your money instantly with your Pagomigo debit card. Your card is accepted wherever Mastercard or Visa is accepted.</p>
      
            <div className="features-list">
              <div className="feature-item">
                <h3>Instant Access</h3>
                <p>Use your card to make purchases or withdraw cash from ATMs across the U.S.</p>
              </div>
              <div className="feature-item">
                <h3>Touchless Payments</h3>
                <p>Scan a QR code or tap your phone to pay securely using NFC technology.</p>
              </div>
              <div className="feature-item">
                <h3>Bill Pay</h3>
                <p>Pay utility bills, rent, and more directly from your Pagomigo wallet.</p>
              </div>
            </div>
          </div>
      
          <div className="debit-card-image">
            <img src={bonitaSenorita} alt="Bonita senorita using her phone" />
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="featuresh2">Features</h2>
        <div className="features-grid">
          <div className="feature-item">
            <Link to="/moneymover">
              <img src={sendMoney} alt="Send Money Icon" />
            </Link>
            <h3>Send Money</h3>
            <p>Send money to friends and family instantly, no matter where they are.</p>
          </div>
          <div className="feature-item">
            <Link to="/moneymover">
              <img src={requestMoney} alt="Request Money Icon" />
            </Link>
            <h3>Request Money</h3>
            <p>Request money from anyone, anywhere, with just a few taps.</p>
          </div>
          <div className="feature-item">
            <Link to="/billpay">
              <img src={billPay} alt="Pay Bills Icon" />
            </Link>
            <h3>Pay Bills</h3>
            <p>Pay your bills directly from your Pagomigo wallet, hassle-free.</p>
          </div>
        </div>
      </section>

      <section className='retailvision'>
        <h2 className='retailpayh2'>Pagar</h2>
        <h2 className='retaileasierh2'>Más fácil
        </h2>
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