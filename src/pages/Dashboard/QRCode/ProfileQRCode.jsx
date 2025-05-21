// src/pages/Dashboard/QRCode/ProfileQRCode.jsx
import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode.js';
import { useUserProfile } from '../../../hooks/useUserProfile';
import styles from '../../../styles/QRCode.module.css';

const ProfileQRCode = () => {
  const { userData } = useUserProfile();
  const [qrCodeGenerated, setQrCodeGenerated] = useState(false);
  
  useEffect(() => {
    if (userData && userData._id && !qrCodeGenerated) {
      const qrContainer = document.getElementById('qrcode-container');
      if (qrContainer) {
        // Clear previous QR code
        qrContainer.innerHTML = '';
        
        // The data to encode in the QR code
        const qrData = `https://www.pagomigo.com/find-user?id=${userData._id}`;
        
        // Generate QR code
        new QRCode(qrContainer, {
          text: qrData,
          width: 200,
          height: 200,
          colorDark: "#0055FF",
          colorLight: "#FFFFFF",
          correctLevel: QRCode.CorrectLevel.H
        });
        
        setQrCodeGenerated(true);
      }
    }
  }, [userData, qrCodeGenerated]);
  
  const handleDownload = () => {
    const canvas = document.querySelector('#qrcode-container canvas');
    if (canvas) {
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `pagomigo-${userData.username || 'profile'}.png`;
      link.click();
    }
  };
  
  return (
    <section className={styles.outerqrcodeSection}>
      <section className={styles.qrcodeSection}>
        <div className={styles.profileQrcode}>
          <h3>My Profile QR Code</h3>
          <p>Friends can scan this to connect with you</p>
          <div id="qrcode-container"></div>
          <button 
            onClick={handleDownload}
            className={styles.secondaryBtn}
          >
            Download QR Code
          </button>
        </div>
      </section>
    </section>
  );
};

export default ProfileQRCode;