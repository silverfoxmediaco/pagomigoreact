// src/services/unitService.js
import { API_BASE } from '../config';

// Mock data for development
const mockAccounts = [
  {
    id: 'acct-123456',
    name: 'Checking Account',
    type: 'checking',
    balance: 2500,
    currency: 'USD',
    status: 'active',
    created: new Date().toISOString()
  },
  {
    id: 'acct-789012',
    name: 'Savings Account',
    type: 'savings',
    balance: 10000,
    currency: 'USD',
    status: 'active',
    created: new Date().toISOString()
  }
];

const mockTransactions = [
  {
    id: 'tx-123456',
    amount: 750,
    type: 'deposit',
    status: 'completed',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    description: 'Direct Deposit - Payroll'
  },
  {
    id: 'tx-234567',
    amount: -120,
    type: 'payment',
    status: 'completed',
    date: new Date(Date.now() - 86400000).toISOString(),
    description: 'Online Payment - Electric Bill'
  },
  {
    id: 'tx-345678',
    amount: -45.99,
    type: 'payment',
    status: 'completed',
    date: new Date().toISOString(),
    description: 'Subscription Payment - Netflix'
  }
];

// Helper function to safely parse JSON responses
const safelyParseJson = async (response) => {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      console.log('Response content:', await response.text());
      throw new Error('Invalid JSON response from server');
    }
  } else {
    // Not a JSON response, log and throw error
    const text = await response.text();
    console.error('Non-JSON response:', text);
    throw new Error('Server returned a non-JSON response');
  }
};

// Check if user has Unit account
export const checkUnitAccount = async () => {
  // For development with mock data
  if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
    console.log('Using mock data for Unit account check');
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    return { exists: true, accounts: mockAccounts };
  }
  
  // For production with real API
  try {
    console.log('Checking Unit account with API_BASE:', API_BASE);
    
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_BASE}/api/unit/accounts/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Unit account API response status:', response.status);
    
    if (response.status === 404) {
      return { exists: false };
    }
    
    if (!response.ok) {
      // Try to parse error response, but handle non-JSON errors
      try {
        const errorData = await safelyParseJson(response);
        throw new Error(errorData.message || 'Failed to check Unit account status');
      } catch (parseError) {
        if (parseError.message === 'Invalid JSON response from server' || 
            parseError.message === 'Server returned a non-JSON response') {
          throw parseError;
        }
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
    }
    
    const data = await safelyParseJson(response);
    return { exists: true, accounts: data.accounts || [] };
  } catch (error) {
    console.error('Error checking Unit account:', error);
    return { exists: false, error: error.message };
  }
};

// Create Unit account
export const createUnitAccount = async () => {
  // For development with mock data
  if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
    console.log('Using mock data for Unit account creation');
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
    return { success: true, accounts: mockAccounts };
  }
  
  // For production with real API
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_BASE}/api/unit/accounts/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await safelyParseJson(response);
      throw new Error(errorData.message || 'Failed to create Unit account');
    }
    
    const data = await safelyParseJson(response);
    return { success: true, accounts: data.accounts || [] };
  } catch (error) {
    console.error('Error creating Unit account:', error);
    return { success: false, error: error.message };
  }
};

// Get Unit transactions
export const getUnitTransactions = async (accountId) => {
  // For development with mock data
  if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
    console.log('Using mock data for Unit transactions');
    await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API delay
    return mockTransactions;
  }
  
  // For production with real API
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_BASE}/api/unit/transactions${accountId ? `?accountId=${accountId}` : ''}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await safelyParseJson(response);
      throw new Error(errorData.message || 'Failed to fetch transactions');
    }
    
    const data = await safelyParseJson(response);
    return data.transactions || [];
  } catch (error) {
    console.error('Error fetching Unit transactions:', error);
    throw error;
  }
};

// Make bank payment/transfer
export const makeBankTransfer = async (transferData) => {
  // For development with mock data
  if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
    console.log('Using mock data for bank transfer', transferData);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    return { 
      success: true, 
      transaction: {
        id: `tx-${Date.now()}`,
        amount: transferData.amount,
        type: 'transfer',
        status: 'completed',
        date: new Date().toISOString(),
        description: transferData.description || 'Bank Transfer'
      }
    };
  }
  
  // For production with real API
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_BASE}/api/unit/payments/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(transferData)
    });
    
    if (!response.ok) {
      const errorData = await safelyParseJson(response);
      throw new Error(errorData.message || 'Failed to process transfer');
    }
    
    const data = await safelyParseJson(response);
    return { success: true, transaction: data.transaction };
  } catch (error) {
    console.error('Error making bank transfer:', error);
    return { success: false, error: error.message };
  }
};

export default {
  checkUnitAccount,
  createUnitAccount,
  getUnitTransactions,
  makeBankTransfer
};