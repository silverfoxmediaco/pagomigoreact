// src/hooks/plaidService.js
const API_BASE = process.env.REACT_APP_API_BASE || '';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Create link token for bank connection
export const createLinkToken = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/plaid/link-token`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    const data = await handleResponse(response);
    return data.link_token; // Changed from linkToken to link_token
  } catch (error) {
    console.error('Error creating link token:', error);
    throw error;
  }
};

// Create identity verification link token
export const createIdvLinkToken = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/plaid/identity-verification/create`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    const data = await handleResponse(response);
    return data.link_token; // Changed from linkToken to link_token
  } catch (error) {
    console.error('Error creating IDV link token:', error);
    throw error;
  }
};

// Exchange public token for access token
export const exchangePublicToken = async (publicToken, institutionName) => {
  try {
    const response = await fetch(`${API_BASE}/api/plaid/exchange-token`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        public_token: publicToken, // Changed to match backend expectation
        institution_name: institutionName // Changed to match backend expectation
      })
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error exchanging public token:', error);
    throw error;
  }
};

// Complete identity verification
export const completeIdentityVerification = async (identityVerificationId) => {
  try {
    const response = await fetch(`${API_BASE}/api/plaid/identity-verification/complete`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        identity_verification_id: identityVerificationId // Changed to match backend expectation
      })
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error completing identity verification:', error);
    throw error;
  }
};

// Get verification status
export const getVerificationStatus = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/plaid/identity-verification/status`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error getting verification status:', error);
    throw error;
  }
};

// Get connected accounts
export const getConnectedAccounts = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/plaid/accounts`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    const data = await handleResponse(response);
    return data.accounts || [];
  } catch (error) {
    console.error('Error getting connected accounts:', error);
    throw error;
  }
};

// Get account balance
export const getAccountBalance = async (accountId) => {
  try {
    const response = await fetch(`${API_BASE}/api/plaid/accounts/${accountId}/balance`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    const data = await handleResponse(response);
    return data.balance;
  } catch (error) {
    console.error('Error getting account balance:', error);
    throw error;
  }
};