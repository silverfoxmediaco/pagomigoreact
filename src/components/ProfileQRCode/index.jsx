// src/components/ProfileQRCode/index.jsx
import React, { useEffect, useRef } from 'react';
import styles from '../../styles/ProfileQrCode.module.css'; // Updated path to the CSS module

const ProfileQRCode = ({ userData }) => {
  const qrContainerRef = useRef(null);
  
  useEffect(() => {
    // Only attempt to generate QR code if userData exists and has an ID
    if (userData && userData._id && qrContainerRef.current) {
      generateQR();
    }
  }, [userData]);

  const generateQR = () => {
    if (!userData || !userData._id) return;
    
    // Clear previous QR code
    if (qrContainerRef.current) {
      qrContainerRef.current.innerHTML = '';
    }
    
    // The data to encode in the QR code - typically a URL with user ID
    const qrData = `https://www.pagomigo.com/find-user?id=${userData._id}`;
    
    // Make sure QRCode library is loaded
    if (typeof window.QRCode !== 'undefined') {
      // Generate QR code
      // eslint-disable-next-line no-undef
      new window.QRCode(qrContainerRef.current, {
        text: qrData,
        width: 200,
        height: 200,
        colorDark: "#0055FF", // Use your app's primary color
        colorLight: "#FFFFFF",
        correctLevel: window.QRCode.CorrectLevel.H
      });
    } else {
      console.error('QRCode library not loaded');
    }
  };

  const handleDownload = () => {
    const canvas = qrContainerRef.current?.querySelector('canvas');
    if (canvas) {
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `pagomigo-${userData?.username || 'profile'}.png`;
      link.click();
    }
  };

  return (
    <div className={styles.qrSection}>
      <div className={styles.profileQrcode}>
        <h3>Friends can scan this to connect with you</h3>
        <div ref={qrContainerRef} className={styles.qrcodeContainer}></div>
        <button 
          className={styles.secondaryBtn}
          onClick={handleDownload}
          disabled={!userData?._id}
        >
          Download QR Code
        </button>
      </div>
    </div>
  );
};

export default ProfileQRCode;