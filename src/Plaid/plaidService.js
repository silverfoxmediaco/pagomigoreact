// src/services/plaidService.js
const API_BASE = process.env.REACT_APP_API_BASE_URL || '';

// Regular Plaid Link functions (for bank connections)
export const createLinkToken = async () => {
  const response = await fetch(`${API_BASE}/api/plaid/link-token`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to create link token');
  }
  
  const data = await response.json();
  return data.link_token;
};

export const exchangePublicToken = async (publicToken, institutionName) => {
  const response = await fetch(`${API_BASE}/api/plaid/exchange-token`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      public_token: publicToken,
      institution_name: institutionName 
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to exchange public token');
  }
  
  return response.json();
};

export const getConnectedAccounts = async () => {
  const response = await fetch(`${API_BASE}/api/plaid/accounts`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to get connected accounts');
  }
  
  const data = await response.json();
  return data.accounts || [];
};

export const getAccountBalance = async (accountId) => {
  const response = await fetch(`${API_BASE}/api/plaid/accounts/${accountId}/balance`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to get account balance');
  }
  
  const data = await response.json();
  return data.balance;
};

// Identity Verification functions
export const createIdvLinkToken = async () => {
  const response = await fetch(`${API_BASE}/api/plaid/identity-verification/create`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('IDV Link Token Error:', response.status, errorText);
    throw new Error('Failed to create identity verification link token');
  }
  
  const data = await response.json();
  return data.link_token;
};

export const completeIdentityVerification = async (identityVerificationId) => {
  const response = await fetch(`${API_BASE}/api/plaid/identity-verification/complete`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ identity_verification_id: identityVerificationId })
  });
  
  if (!response.ok) {
    throw new Error('Failed to complete identity verification');
  }
  
  return response.json();
};

export const getVerificationStatus = async () => {
  const response = await fetch(`${API_BASE}/api/plaid/identity-verification/status`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to get verification status');
  }
  
  return response.json();
};