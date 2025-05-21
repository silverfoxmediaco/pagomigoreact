// src/hooks/usePlaid.js
import { useState, useEffect, useCallback } from 'react';
import { 
  createLinkToken, 
  exchangePublicToken, 
  getConnectedAccounts,
  getAccountBalance,
  createIdvLinkToken,
  completeIdentityVerification,
  getVerificationStatus
} from '../services/plaidService';

export const usePlaid = () => {
  const [accounts, setAccounts] = useState([]);
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load Plaid script
  const loadPlaidScript = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (window.Plaid) {
        resolve(window.Plaid);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
      script.async = true;
      script.onload = () => resolve(window.Plaid);
      script.onerror = () => reject(new Error('Failed to load Plaid Link script'));
      document.head.appendChild(script);
    });
  }, []);

  // Load connected accounts
  const loadAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const accountsData = await getConnectedAccounts();
      setAccounts(accountsData);
    } catch (err) {
      setError('Failed to load accounts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load verification status
  const loadVerificationStatus = useCallback(async () => {
    try {
      setLoading(true);
      const { status } = await getVerificationStatus();
      setVerificationStatus(status);
    } catch (err) {
      console.error('Error getting verification status:', err);
      // Don't set error for this one, just fail silently
    } finally {
      setLoading(false);
    }
  }, []);

  // Open Plaid Link for bank connection
  const openPlaidLink = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const linkToken = await createLinkToken();
      const Plaid = await loadPlaidScript();
      
      const handler = Plaid.create({
        token: linkToken,
        onSuccess: async (publicToken, metadata) => {
          try {
            await exchangePublicToken(publicToken, metadata.institution.name);
            setSuccess('Bank account connected successfully!');
            loadAccounts();
          } catch (err) {
            setError('Failed to connect bank account');
            console.error(err);
          } finally {
            setLoading(false);
          }
        },
        onExit: (err) => {
          setLoading(false);
          if (err) {
            console.error('Plaid Link error:', err);
          }
        },
        onEvent: (eventName, metadata) => {
          console.log('Plaid Link event:', eventName, metadata);
        }
      });
      
      handler.open();
    } catch (err) {
      setError('Failed to connect to your bank');
      console.error(err);
      setLoading(false);
    }
  }, [loadPlaidScript, loadAccounts]);

  // Open Plaid Link for identity verification
  const openIdentityVerification = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const linkToken = await createIdvLinkToken();
      const Plaid = await loadPlaidScript();
      
      const handler = Plaid.create({
        token: linkToken,
        onSuccess: async (publicToken, metadata) => {
          try {
            const identityVerificationId = metadata.identity_verification?.id;
            
            if (!identityVerificationId) {
              throw new Error('Identity verification ID not found');
            }
            
            const result = await completeIdentityVerification(identityVerificationId);
            
            setSuccess(
              result.status === 'success' ? 
                'Identity verification completed successfully!' : 
                'Identity verification submitted for review'
            );
            
            loadVerificationStatus();
          } catch (err) {
            setError('Failed to complete identity verification');
            console.error(err);
          } finally {
            setLoading(false);
          }
        },
        onExit: (err) => {
          setLoading(false);
          if (err) {
            console.error('Plaid Link error:', err);
            setError('Verification process was interrupted');
          }
        },
        onEvent: (eventName, metadata) => {
          console.log('Plaid Link event:', eventName, metadata);
        }
      });
      
      handler.open();
    } catch (err) {
      setError('Failed to start identity verification');
      console.error(err);
      setLoading(false);
    }
  }, [loadPlaidScript, loadVerificationStatus]);

  // Check account balance
  const checkBalance = useCallback(async (accountId) => {
    try {
      setLoading(true);
      const balance = await getAccountBalance(accountId);
      return balance;
    } catch (err) {
      console.error('Error checking balance:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize on component mount
  useEffect(() => {
    loadAccounts();
    loadVerificationStatus();
  }, [loadAccounts, loadVerificationStatus]);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return {
    accounts,
    verificationStatus,
    loading,
    error,
    success,
    openPlaidLink,
    openIdentityVerification,
    checkBalance,
    loadAccounts,
    loadVerificationStatus
  };
};