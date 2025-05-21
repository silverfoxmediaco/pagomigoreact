// src/services/api/unitConfig.js

/**
 * Configuration for Unit API integration
 * Note: In React, we're not directly connecting to Unit API from the client
 * Instead, we'll make calls to our backend which will use the Unit SDK
 */

// Base API URL for our backend that handles Unit API calls
export const UNIT_API_BASE = process.env.REACT_APP_API_URL + '/api/unit';

// API endpoints for Unit-related operations
export const UNIT_ENDPOINTS = {
  // Account operations
  ACCOUNTS: {
    GET_MY_ACCOUNTS: '/accounts/me',
    CREATE_ACCOUNT: '/accounts/create',
    GET_ACCOUNT_DETAILS: '/accounts/:id',
  },
  
  // Payment operations
  PAYMENTS: {
    SEND: '/payments/send',
    REQUEST: '/payments/request',
    GET_HISTORY: '/payments/history',
  },
  
  // Transaction operations
  TRANSACTIONS: {
    LIST: '/transactions',
    GET_DETAILS: '/transactions/:id',
  }
};

/**
 * Helper function to construct a full Unit API endpoint URL
 * @param {string} endpoint - The endpoint path
 * @param {Object} params - URL parameters to replace in the endpoint
 * @returns {string} - The full URL
 */
export const getUnitEndpoint = (endpoint, params = {}) => {
  let url = UNIT_API_BASE + endpoint;
  
  // Replace any :param placeholders with actual values
  Object.keys(params).forEach(key => {
    url = url.replace(`:${key}`, params[key]);
  });
  
  return url;
};

// Export the configuration
export default {
  UNIT_API_BASE,
  UNIT_ENDPOINTS,
  getUnitEndpoint,
};