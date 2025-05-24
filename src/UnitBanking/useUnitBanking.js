// src/hooks/useUnitBanking.js
import { useState, useEffect } from 'react';
import unitService from '../services/unitService';

/**
 * Custom hook for interacting with Unit banking services
 * Provides state management and methods for Unit banking functionality
 */
const useUnitBanking = () => {
  const [unitAccounts, setUnitAccounts] = useState([]);
  const [hasAccount, setHasAccount] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user has a Unit account on component mount
  useEffect(() => {
    checkUnitAccount();
  }, []);

  // Check if user has a Unit account
  const checkUnitAccount = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await unitService.checkUnitAccount();
      setHasAccount(result.exists);
      
      if (result.exists && result.accounts) {
        setUnitAccounts(result.accounts);
      }
    } catch (err) {
      setError('Failed to check banking status');
      console.error('Error checking Unit account:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new Unit account
  const createUnitAccount = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await unitService.createUnitAccount();
      
      if (result.success) {
        setHasAccount(true);
        setUnitAccounts(result.accounts || []);
      } else {
        setError(result.error || 'Failed to create banking account');
      }
      
      return result;
    } catch (err) {
      setError('Failed to create banking account');
      console.error('Unit account creation error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get Unit transactions
  const getTransactions = async (accountId = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await unitService.getUnitTransactions(accountId);
      setTransactions(result || []);
      return result;
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error('Error fetching transactions:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Make a bank transfer
  const makeBankTransfer = async (transferData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await unitService.makeBankTransfer(transferData);
      
      if (result.success) {
        // Refresh account data after successful transfer
        await checkUnitAccount();
        // Add the new transaction to the list if available
        if (result.transaction) {
          setTransactions(prev => [result.transaction, ...prev]);
        }
      } else {
        setError(result.error || 'Transfer failed');
      }
      
      return result;
    } catch (err) {
      setError('Failed to process transfer');
      console.error('Bank transfer error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reset any errors
  const clearError = () => {
    setError(null);
  };

  return {
    // State
    unitAccounts,
    hasAccount,
    transactions,
    loading,
    error,
    
    // Methods
    checkUnitAccount,
    createUnitAccount,
    getTransactions,
    makeBankTransfer,
    clearError
  };
};

export default useUnitBanking;