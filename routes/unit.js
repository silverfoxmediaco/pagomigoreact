// routes/unit.js - Unit Banking API Routes
const express = require('express');
const router = express.Router();

// Unit API configuration
const UNIT_API_KEY = process.env.UNIT_API_KEY;
const UNIT_BASE_URL = process.env.UNIT_BASE_URL || 'https://api.s.unit.sh';

// Helper function to make Unit API calls
const unitApiCall = async (endpoint, method = 'GET', data = null) => {
  if (!UNIT_API_KEY) {
    throw new Error('Unit API key not configured');
  }

  const url = `${UNIT_BASE_URL}${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${UNIT_API_KEY}`,
      'Content-Type': 'application/vnd.api+json',
      'Accept': 'application/vnd.api+json'
    }
  };

  if (data && (method === 'POST' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  console.log(`Unit API Call: ${method} ${url}`);
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Unit API Error: ${response.status} - ${errorText}`);
    throw new Error(`Unit API Error: ${response.status} - ${errorText}`);
  }

  return await response.json();
};

// GET /api/unit/token - Generate JWT token for Unit Elements
router.get('/token', async (req, res) => {
  try {
    console.log('Generating Unit JWT token for user:', req.user?.userId);
    
    if (!UNIT_API_KEY) {
      return res.json({
        token: 'demo.jwt.token',
        expires_in: 3600,
        message: 'Demo token - Unit API key not configured'
      });
    }

    // In production, you would generate a proper JWT token for Unit Elements
    // For now, return a demo token
    res.json({
      token: 'demo.jwt.token',
      expires_in: 3600,
      message: 'Demo token - Unit integration in progress'
    });

  } catch (error) {
    console.error('Error generating Unit token:', error);
    res.status(500).json({
      error: 'Failed to generate Unit token',
      details: error.message
    });
  }
});

// GET /api/unit/accounts - Get user's Unit accounts
router.get('/accounts', async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // For demo purposes, return mock account data
    const mockAccounts = [
      {
        id: 'account_demo_001',
        type: 'checking',
        balance: 150000, // in cents
        name: 'Pagomigo Checking',
        status: 'open',
        created_at: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      accounts: mockAccounts
    });

  } catch (error) {
    console.error('Error fetching Unit accounts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch accounts',
      details: error.message
    });
  }
});

// POST /api/unit/create-account - Create a new Unit account
router.post('/create-account', async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // For demo purposes, simulate account creation
    const newAccount = {
      id: `account_${Date.now()}`,
      type: 'checking',
      balance: 0,
      name: 'Pagomigo Checking',
      status: 'open',
      created_at: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Account created successfully (demo)',
      account: newAccount
    });

  } catch (error) {
    console.error('Error creating Unit account:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create account',
      details: error.message
    });
  }
});

// GET /api/unit/transactions - Get account transactions
router.get('/transactions/:accountId?', async (req, res) => {
  try {
    const { accountId } = req.params;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // For demo purposes, return mock transaction data
    const mockTransactions = [
      {
        id: 'txn_demo_001',
        amount: -2500, // in cents
        description: 'Coffee Shop Purchase',
        date: new Date(Date.now() - 86400000).toISOString(), // yesterday
        status: 'completed'
      },
      {
        id: 'txn_demo_002',
        amount: 50000, // in cents
        description: 'Direct Deposit',
        date: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
        status: 'completed'
      }
    ];

    res.json({
      success: true,
      transactions: mockTransactions
    });

  } catch (error) {
    console.error('Error fetching Unit transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions',
      details: error.message
    });
  }
});

// POST /api/unit/transfer - Make a transfer
router.post('/transfer', async (req, res) => {
  try {
    const { amount, recipient, description } = req.body;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    if (!amount || !recipient) {
      return res.status(400).json({
        success: false,
        error: 'Amount and recipient are required'
      });
    }

    // For demo purposes, simulate transfer
    const transfer = {
      id: `transfer_${Date.now()}`,
      amount: amount,
      recipient: recipient,
      description: description || 'Transfer',
      status: 'completed',
      created_at: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Transfer completed successfully (demo)',
      transfer: transfer
    });

  } catch (error) {
    console.error('Error processing Unit transfer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process transfer',
      details: error.message
    });
  }
});

// GET /api/unit/status - Check Unit integration status
router.get('/status', async (req, res) => {
  try {
    res.json({
      success: true,
      status: 'demo_mode',
      message: 'Unit Banking integration is in demo mode',
      hasApiKey: !!UNIT_API_KEY,
      baseUrl: UNIT_BASE_URL
    });
  } catch (error) {
    console.error('Error checking Unit status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check status',
      details: error.message
    });
  }
});

module.exports = router;