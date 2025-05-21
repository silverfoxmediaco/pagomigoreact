// src/hooks/useTransactions.js
import { useState, useEffect, useCallback } from 'react';
import { 
  getUserTransactions, 
  getMoneyRequests,
  createTransaction,
  createMoneyRequest,
  respondToRequest
} from '../services/transactionService';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getUserTransactions();
      setTransactions(data);
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch money requests
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getMoneyRequests();
      setRequests(data);
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Send money
  const sendMoney = useCallback(async (transactionData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await createTransaction(transactionData);
      setSuccess('Money sent successfully!');
      
      // Update transactions list
      fetchTransactions();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
      return { success: true, data: result };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchTransactions]);

  // Request money
  const requestMoney = useCallback(async (requestData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await createMoneyRequest(requestData);
      setSuccess('Money request sent!');
      
      // Update requests list
      fetchRequests();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
      return { success: true, data: result };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchRequests]);

  // Pay request
  const payRequest = useCallback(async (requestId) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await respondToRequest(requestId, 'pay');
      setSuccess('Payment successful!');
      
      // Update both transactions and requests
      await Promise.all([fetchTransactions(), fetchRequests()]);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchTransactions, fetchRequests]);

  // Decline request
  const declineRequest = useCallback(async (requestId) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await respondToRequest(requestId, 'decline');
      setSuccess('Request declined');
      
      // Update requests list
      fetchRequests();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchRequests]);

  // Load data on mount
  useEffect(() => {
    fetchTransactions();
    fetchRequests();
  }, [fetchTransactions, fetchRequests]);

  return {
    transactions,
    requests,
    loading,
    error,
    success,
    fetchTransactions,
    fetchRequests,
    sendMoney,
    requestMoney,
    payRequest,
    declineRequest
  };
};