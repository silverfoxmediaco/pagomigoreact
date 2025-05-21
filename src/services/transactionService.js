// src/services/transactionService.js
import { API_BASE } from '../config';

// Helper for authenticated requests
const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };
  
  const response = await fetch(url, mergedOptions);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'API request failed');
  }
  
  return await response.json();
};

// Get user transactions
export const getUserTransactions = async () => {
  return authFetch(`${API_BASE}/api/transactions`);
};

// Get transaction by ID
export const getTransactionById = async (id) => {
  return authFetch(`${API_BASE}/api/transactions/${id}`);
};

// Create a new transaction
export const createTransaction = async (transactionData) => {
  return authFetch(`${API_BASE}/api/transactions`, {
    method: 'POST',
    body: JSON.stringify(transactionData)
  });
};

// Get money requests
export const getMoneyRequests = async () => {
  return authFetch(`${API_BASE}/api/requests`);
};

// Create money request
export const createMoneyRequest = async (requestData) => {
  return authFetch(`${API_BASE}/api/requests`, {
    method: 'POST',
    body: JSON.stringify(requestData)
  });
};

// Respond to money request (pay or decline)
export const respondToRequest = async (requestId, action) => {
  return authFetch(`${API_BASE}/api/requests/${requestId}/${action}`, {
    method: 'POST'
  });
};