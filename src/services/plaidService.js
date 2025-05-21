// src/services/plaidService.js
import { API_BASE } from '../config';

/**
 * Create a link token for bank account connection
 */
export const createLinkToken = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE}/api/plaid/create-link-token`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to create link token');
  }
  
  const data = await response.json();
  return data.link_token;
};

/**
 * Create a link token for identity verification
 */
export const createIdvLinkToken = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE}/api/plaid/create-idv-link-token`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to create IDV link token');
  }
  
  const data = await response.json();
  return data.link_token;
};

/**
 * Exchange a public token for an access token
 */
export const exchangePublicToken = async (publicToken, institutionName) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE}/api/plaid/exchange-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      public_token: publicToken,
      institution_name: institutionName
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to connect bank account');
  }
  
  return await response.json();
};

/**
 * Complete identity verification
 */
export const completeIdentityVerification = async (identityVerificationId) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE}/api/plaid/complete-idv`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      identity_verification_id: identityVerificationId
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to complete identity verification');
  }
  
  return await response.json();
};

/**
 * Get verification status
 */
export const getVerificationStatus = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE}/api/plaid/verification-status`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to get verification status');
  }
  
  return await response.json();
};

/**
 * Get connected accounts
 */
export const getConnectedAccounts = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE}/api/plaid/accounts`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to get connected accounts');
  }
  
  const data = await response.json();
  return data.accounts;
};

/**
 * Get account balance
 */
export const getAccountBalance = async (accountId) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE}/api/plaid/balance/${accountId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to get account balance');
  }
  
  const data = await response.json();
  return data.balance;
};