// src/config.js

// API base URL - this will be different for development vs production
export const API_BASE = process.env.REACT_APP_API_BASE_URL || '';

// Authentication configuration
export const AUTH_CONFIG = {
  JWT_ISSUER: 'pagomigo.com',
  JWT_AUDIENCE: 'pagomigo.com',
  JWT_EXPIRY: '30d' 
};

// App configuration
export const APP_CONFIG = {
  APP_NAME: 'Pagomigo',
  APP_DESCRIPTION: 'The digital wallet for the Hispanic Community',
  APP_VERSION: '1.0.0',
  APP_URL: 'https://www.pagomigo.com',
  SUPPORT_EMAIL: 'support@pagomigo.com',
  COMPANY_NAME: 'Pagomigo L.L.C.'
};

// Feature flags
export const FEATURES = {
  ENABLE_PLAID: true,
  ENABLE_PERSONA: true,
  ENABLE_UNIT: false,  // Set to true when Unit integration is ready
  DEMO_MODE: process.env.REACT_APP_DEMO_MODE === 'true'
};