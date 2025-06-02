// routes/unit.js
const express = require('express');
const router = express.Router();

// GET /api/unit/token - Generate JWT token for Unit Elements
router.get('/token', async (req, res) => {
  try {
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
    const mockAccounts = [
      {
        id: 'account_demo_001',
        type: 'checking',
        balance: 150000,
        name: 'Pagomigo Checking',
        status: 'open'
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
      error: 'Failed to fetch accounts'
    });
  }
});

// GET /api/unit/status - Check Unit integration status
router.get('/status', async (req, res) => {
  try {
    res.json({
      success: true,
      status: 'demo_mode',
      message: 'Unit Banking integration is in demo mode'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check status'
    });
  }
});

module.exports = router;