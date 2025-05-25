// routes/plaidRoutes.js
const express = require('express');
const router = express.Router();
const { PlaidApi, Configuration, PlaidEnvironments } = require('plaid');

// Configure Plaid client
const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

// You'll need to import your auth middleware and User model
// Adjust these paths based on your project structure
// const requireAuth = require('../middleware/requireAuth');
// const User = require('../models/User');

// Temporary: Skip auth for testing
const requireAuth = (req, res, next) => {
  // TODO: Replace with your actual auth middleware
  req.user = { id: 'test-user-id' };
  next();
};

// ============ IDENTITY VERIFICATION ENDPOINTS ============

// Create identity verification link token (Original endpoint - keep for compatibility)
router.post('/create-idv-link-token', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Create the identity verification session first
    const idvResponse = await plaidClient.identityVerificationCreate({
      is_shareable: true,
      template_id: 'idvtmp_4FrXJvfQU3zGUR', // Plaid's default template
      gave_consent: true,
      user: {
        client_user_id: userId.toString(),
      }
    });

    // Then create link token for the identity verification
    const linkTokenResponse = await plaidClient.linkTokenCreate({
      products: ['identity_verification'],
      client_name: 'Pagomigo',
      country_codes: ['US', 'CA'],
      language: 'en',
      identity_verification: {
        identity_verification_id: idvResponse.data.id
      },
      user: {
        client_user_id: userId.toString()
      }
    });

    // TODO: Save the identity verification ID to your database
    // await User.findByIdAndUpdate(userId, { 
    //   plaid_identity_verification_id: idvResponse.data.id 
    // });

    console.log('IDV Link token created successfully');
    res.json({ link_token: linkTokenResponse.data.link_token });
  } catch (error) {
    console.error('Error creating identity verification:', error);
    res.status(500).json({ error: 'Failed to create identity verification' });
  }
});

// Create identity verification link token (New REST-style endpoint)
router.post('/identity-verification/create', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Create the identity verification session first
    const idvResponse = await plaidClient.identityVerificationCreate({
      is_shareable: true,
      template_id: 'idvtmp_4FrXJvfQU3zGUR', // Plaid's default template
      gave_consent: true,
      user: {
        client_user_id: userId.toString(),
      }
    });

    // Then create link token for the identity verification
    const linkTokenResponse = await plaidClient.linkTokenCreate({
      products: ['identity_verification'],
      client_name: 'Pagomigo',
      country_codes: ['US', 'CA'],
      language: 'en',
      identity_verification: {
        identity_verification_id: idvResponse.data.id
      },
      user: {
        client_user_id: userId.toString()
      }
    });

    // TODO: Save the identity verification ID to your database
    // await User.findByIdAndUpdate(userId, { 
    //   plaid_identity_verification_id: idvResponse.data.id 
    // });

    console.log('IDV Link token created successfully');
    res.json({ link_token: linkTokenResponse.data.link_token });
  } catch (error) {
    console.error('Error creating identity verification:', error);
    res.status(500).json({ error: 'Failed to create identity verification' });
  }
});

// Complete identity verification (Original endpoint - keep for compatibility)
router.post('/complete-idv', requireAuth, async (req, res) => {
  try {
    const { identity_verification_id } = req.body;
    
    if (!identity_verification_id) {
      return res.status(400).json({ error: 'Identity verification ID is required' });
    }

    // Get the current status of the identity verification
    const idvResponse = await plaidClient.identityVerificationGet({
      identity_verification_id: identity_verification_id
    });

    const status = idvResponse.data.status;
    
    // TODO: Update user's verification status in your database
    // await User.findByIdAndUpdate(req.user.id, { 
    //   plaid_identity_status: status === 'success' ? 'approved' : status 
    // });

    console.log(`Identity verification completed with status: ${status}`);
    
    res.json({ 
      status: status,
      message: status === 'success' ? 'Identity verification completed successfully' : 'Identity verification submitted for review'
    });
  } catch (error) {
    console.error('Error completing identity verification:', error);
    res.status(500).json({ error: 'Failed to complete identity verification' });
  }
});

// Complete identity verification (New REST-style endpoint)
router.post('/identity-verification/complete', requireAuth, async (req, res) => {
  try {
    const { identity_verification_id } = req.body;
    
    if (!identity_verification_id) {
      return res.status(400).json({ error: 'Identity verification ID is required' });
    }

    // Get the current status of the identity verification
    const idvResponse = await plaidClient.identityVerificationGet({
      identity_verification_id: identity_verification_id
    });

    const status = idvResponse.data.status;
    
    // TODO: Update user's verification status in your database
    // await User.findByIdAndUpdate(req.user.id, { 
    //   plaid_identity_status: status === 'success' ? 'approved' : status 
    // });

    console.log(`Identity verification completed with status: ${status}`);
    
    res.json({ 
      status: status,
      message: status === 'success' ? 'Identity verification completed successfully' : 'Identity verification submitted for review'
    });
  } catch (error) {
    console.error('Error completing identity verification:', error);
    res.status(500).json({ error: 'Failed to complete identity verification' });
  }
});

// Get identity verification status (Original endpoint - keep for compatibility)
router.get('/verification-status', requireAuth, async (req, res) => {
  try {
    // TODO: Get the identity verification ID from your database
    // const user = await User.findById(req.user.id);
    // const idvId = user.plaid_identity_verification_id;
    
    // For now, return pending status
    // if (!idvId) {
    //   return res.json({ status: 'pending' });
    // }

    // const idvResponse = await plaidClient.identityVerificationGet({
    //   identity_verification_id: idvId
    // });

    // res.json({ status: idvResponse.data.status });
    
    // Temporary response for testing
    res.json({ status: 'pending' });
  } catch (error) {
    console.error('Error getting identity verification status:', error);
    res.status(500).json({ error: 'Failed to get verification status' });
  }
});

// Get identity verification status (New REST-style endpoint)
router.get('/identity-verification/status', requireAuth, async (req, res) => {
  try {
    // TODO: Get the identity verification ID from your database
    // const user = await User.findById(req.user.id);
    // const idvId = user.plaid_identity_verification_id;
    
    // For now, return pending status
    // if (!idvId) {
    //   return res.json({ status: 'pending' });
    // }

    // const idvResponse = await plaidClient.identityVerificationGet({
    //   identity_verification_id: idvId
    // });

    // res.json({ status: idvResponse.data.status });
    
    // Temporary response for testing
    res.json({ status: 'pending' });
  } catch (error) {
    console.error('Error getting identity verification status:', error);
    res.status(500).json({ error: 'Failed to get verification status' });
  }
});

// ============ REGULAR PLAID ENDPOINTS (Bank Connections) ============

// Create link token for bank connections
router.post('/create-link-token', requireAuth, async (req, res) => {
  try {
    const linkTokenResponse = await plaidClient.linkTokenCreate({
      products: ['transactions', 'identity'],
      client_name: 'Pagomigo',
      country_codes: ['US', 'CA'],
      language: 'en',
      user: {
        client_user_id: req.user.id.toString()
      }
    });

    res.json({ link_token: linkTokenResponse.data.link_token });
  } catch (error) {
    console.error('Error creating link token:', error);
    res.status(500).json({ error: 'Failed to create link token' });
  }
});

// Create link token for bank connections (Alternative endpoint name)
router.post('/link-token', requireAuth, async (req, res) => {
  try {
    const linkTokenResponse = await plaidClient.linkTokenCreate({
      products: ['transactions', 'identity'],
      client_name: 'Pagomigo',
      country_codes: ['US', 'CA'],
      language: 'en',
      user: {
        client_user_id: req.user.id.toString()
      }
    });

    res.json({ link_token: linkTokenResponse.data.link_token });
  } catch (error) {
    console.error('Error creating link token:', error);
    res.status(500).json({ error: 'Failed to create link token' });
  }
});

// Exchange public token for access token
router.post('/exchange-token', requireAuth, async (req, res) => {
  try {
    const { public_token, institution_name } = req.body;

    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: public_token
    });

    const { access_token, item_id } = exchangeResponse.data;

    // TODO: Save access_token and item_id to your database
    console.log('Bank account connected successfully');
    
    res.json({ 
      success: true, 
      message: 'Bank account connected successfully' 
    });
  } catch (error) {
    console.error('Error exchanging token:', error);
    res.status(500).json({ error: 'Failed to connect bank account' });
  }
});

// Get connected accounts
router.get('/accounts', requireAuth, async (req, res) => {
  try {
    // TODO: Get user's Plaid tokens from database and fetch accounts
    // For now, return empty array
    res.json({ accounts: [] });
  } catch (error) {
    console.error('Error getting accounts:', error);
    res.status(500).json({ error: 'Failed to get accounts' });
  }
});

// Get account balance (with accountId parameter)
router.get('/balance/:accountId', requireAuth, async (req, res) => {
  try {
    const { accountId } = req.params;
    
    // TODO: Implement balance fetching
    res.json({
      balance: {
        current: 0,
        available: 0
      }
    });
  } catch (error) {
    console.error('Error getting account balance:', error);
    res.status(500).json({ error: 'Failed to get account balance' });
  }
});

// Get account balance (alternative endpoint structure)
router.get('/accounts/:accountId/balance', requireAuth, async (req, res) => {
  try {
    const { accountId } = req.params;
    
    // TODO: Implement balance fetching
    res.json({
      balance: {
        current: 0,
        available: 0
      }
    });
  } catch (error) {
    console.error('Error getting account balance:', error);
    res.status(500).json({ error: 'Failed to get account balance' });
  }
});

module.exports = router;