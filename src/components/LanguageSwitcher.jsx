// src/components/LanguageSwitcher.jsx
import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher = () => {
  const { language, toggleLanguage, isEnglish } = useLanguage();

  return (
    <button 
      className="language-switcher"
      onClick={toggleLanguage}
      aria-label={`Switch to ${isEnglish ? 'Spanish' : 'English'}`}
      title={`Switch to ${isEnglish ? 'Español' : 'English'}`}
    >
      <div className="language-toggle">
        <span className={`lang-option ${isEnglish ? 'active' : ''}`}>EN</span>
        <span className="separator">|</span>
        <span className={`lang-option ${!isEnglish ? 'active' : ''}`}>ES</span>
      </div>
    </button>
  );
};

export default LanguageSwitcher;