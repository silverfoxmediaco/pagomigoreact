// routes/plaidRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const router = express.Router();
const { PlaidApi, Configuration, PlaidEnvironments } = require('plaid');

// Add fetch for Node.js if not available globally
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

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

// Import User model (adjust path based on your structure)
// For now, we'll define it inline since your User model is in server.js
const getUserModel = () => {
  return mongoose.model('User');
};

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = { userId: user.userId }; // Use userId to match your JWT structure
    next();
  });
};

// ============ IDENTITY VERIFICATION ENDPOINTS ============

// Create identity verification link token - FIXED VERSION
router.post('/identity-verification/create', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('Creating IDV link token for user:', userId);
    console.log('Using template ID:', process.env.PLAID_IDV_TEMPLATE_ID);
    
    // Validate that template ID exists
    if (!process.env.PLAID_IDV_TEMPLATE_ID) {
      console.error('PLAID_IDV_TEMPLATE_ID not found in environment variables');
      return res.status(500).json({ error: 'Identity verification template not configured' });
    }
    
    // Get user info
    const User = getUserModel();
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let idvId = user.plaidIdentityVerificationId;
    
    // Check if user already has an identity verification session
    if (idvId) {
      console.log('Existing IDV session found:', idvId);
      
      try {
        // Check the status of existing session
        const existingIdvResponse = await plaidClient.identityVerificationGet({
          identity_verification_id: idvId
        });
        
        const status = existingIdvResponse.data.status;
        console.log('Existing IDV session status:', status);
        
        // If it's still active (not completed/failed), reuse it
        if (status === 'active' || status === 'pending_review') {
          console.log('Reusing existing active IDV session');
          
          // Create new link token for existing session
          const linkTokenRequest = {
            products: ['identity_verification'],
            client_name: 'Pagomigo',
            country_codes: process.env.PLAID_COUNTRY_CODES.split(','),
            language: 'en',
            user: {
              client_user_id: userId.toString(),
              legal_name: user.name,
              email_address: user.email,
              phone_number: user.phone || undefined
            }
            // NOTE: Do NOT include identity_verification_id when using products: ['identity_verification']
          };

          const linkTokenResponse = await plaidClient.linkTokenCreate(linkTokenRequest);
          
          return res.json({ 
            success: true,
            link_token: linkTokenResponse.data.link_token,
            identity_verification_id: idvId,
            expiration: linkTokenResponse.data.expiration,
            existing_session: true
          });
        }
      } catch (getError) {
        console.log('Error fetching existing session, will create new one:', getError.message);
        // If we can't get the existing session, create a new one
        idvId = null;
      }
    }

    // Create new identity verification session if none exists or previous failed
    if (!idvId) {
      console.log('Creating new IDV session');
      
      const idvRequest = {
        is_shareable: true,
        template_id: process.env.PLAID_IDV_TEMPLATE_ID,
        gave_consent: true,
        user: {
          client_user_id: userId.toString(),
          legal_name: user.name,
          email_address: user.email,
          phone_number: user.phone || undefined
        }
      };

      console.log('Creating IDV session with request:', JSON.stringify(idvRequest, null, 2));
      
      try {
        const idvResponse = await plaidClient.identityVerificationCreate(idvRequest);
        idvId = idvResponse.data.id;
        console.log('New IDV session created:', idvId);

        // Save the identity verification ID to database
        await User.findByIdAndUpdate(userId, { 
          plaidIdentityVerificationId: idvId,
          plaidIdentityStatus: 'pending'
        });
      } catch (createError) {
        // If creation fails due to existing session, look up the existing one
        if (createError.response?.data?.error_code === 'INVALID_FIELD' && 
            createError.response?.data?.error_message?.includes('already exists')) {
          
          console.log('Session already exists - looking up existing session');
          
          try {
            // List existing identity verification sessions for this user
            const listResponse = await plaidClient.identityVerificationList({
              template_id: process.env.PLAID_IDV_TEMPLATE_ID,
              client_user_id: userId.toString()
            });
            
            // Find the most recent session
            const existingSessions = listResponse.data.identity_verifications;
            if (existingSessions && existingSessions.length > 0) {
              // Get the most recent session
              const mostRecent = existingSessions.sort((a, b) => 
                new Date(b.created_at) - new Date(a.created_at)
              )[0];
              
              idvId = mostRecent.id;
              console.log(`Using existing IDV session: ${idvId}, status: ${mostRecent.status}`);
              
              // Update database with existing session ID and current status
              let appStatus = 'pending';
              if (mostRecent.status === 'success') {
                appStatus = 'approved';
              } else if (mostRecent.status === 'failed') {
                appStatus = 'failed';
              } else if (mostRecent.status === 'pending_review') {
                appStatus = 'pending_review';
              }
              
              await User.findByIdAndUpdate(userId, { 
                plaidIdentityVerificationId: idvId,
                plaidIdentityStatus: appStatus,
                personaVerified: appStatus === 'approved'
              });
            } else {
              console.error('No existing sessions found despite "already exists" error');
              throw new Error('No existing sessions found');
            }
          } catch (listError) {
            console.error('Failed to list existing sessions:', listError);
            
            // If listing fails, try direct HTTP request with idempotent=true
            console.log('Attempting direct HTTP request with idempotent=true');
            
            try {
              const response = await fetch(`${plaidClient.configuration.basePath}/identity_verification/create?idempotent=true`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
                  'PLAID-SECRET': process.env.PLAID_SECRET,
                },
                body: JSON.stringify(idvRequest)
              });
              
              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
              }
              
              const idempotentResponse = await response.json();
              idvId = idempotentResponse.id;
              
              console.log(`IDV session retrieved with idempotent: ${idvId}`);
              
              await User.findByIdAndUpdate(userId, { 
                plaidIdentityVerificationId: idvId,
                plaidIdentityStatus: 'pending'
              });
              
            } catch (httpError) {
              console.error('Direct HTTP request also failed:', httpError);
              throw createError; // Re-throw original error
            }
          }
        } else {
          throw createError; // Re-throw other errors
        }
      }
    }

    // Create link token for identity verification
    const linkTokenRequest = {
      products: ['identity_verification'],
      client_name: 'Pagomigo',
      country_codes: process.env.PLAID_COUNTRY_CODES.split(','),
      language: 'en',
      user: {
        client_user_id: userId.toString(),
        legal_name: user.name,
        email_address: user.email,
        phone_number: user.phone || undefined
      }
      // NOTE: Do NOT include identity_verification_id here when products includes 'identity_verification'
      // The identity_verification_id is used internally by Plaid to link the session
    };

    console.log('Creating link token for IDV session:', idvId);
    const linkTokenResponse = await plaidClient.linkTokenCreate(linkTokenRequest);
    console.log('Link token created successfully');

    res.json({ 
      success: true,
      link_token: linkTokenResponse.data.link_token,
      identity_verification_id: idvId,
      expiration: linkTokenResponse.data.expiration
    });

  } catch (error) {
    console.error('Error creating identity verification:', error);
    
    // Handle Plaid-specific errors
    if (error.response?.data) {
      console.error('Plaid error details:', error.response.data);
      return res.status(400).json({ 
        error: 'Plaid error: ' + (error.response.data.error_message || 'Unknown error')
      });
    }
    
    res.status(500).json({ error: 'Failed to create identity verification' });
  }
});

// Complete identity verification
router.post('/identity-verification/complete', authenticateToken, async (req, res) => {
  try {
    const { identity_verification_id } = req.body;
    const userId = req.user.userId;
    
    console.log('Completing identity verification:', identity_verification_id);
    
    if (!identity_verification_id) {
      return res.status(400).json({ error: 'Identity verification ID is required' });
    }

    // Get the current status of the identity verification
    const idvResponse = await plaidClient.identityVerificationGet({
      identity_verification_id: identity_verification_id
    });

    const status = idvResponse.data.status;
    const steps = idvResponse.data.steps;
    
    console.log('IDV Status:', status);
    console.log('IDV Steps:', steps);
    
    // Map Plaid status to your application status
    let appStatus = 'pending';
    if (status === 'success') {
      appStatus = 'approved';
    } else if (status === 'failed') {
      appStatus = 'failed';
    } else if (status === 'pending_review') {
      appStatus = 'pending_review';
    }
    
    // Update user's verification status in your database
    const User = getUserModel();
    await User.findByIdAndUpdate(userId, { 
      plaidIdentityStatus: appStatus,
      plaidIdentityVerificationId: identity_verification_id,
      personaVerified: appStatus === 'approved' // Update the main verification flag
    });

    console.log(`Identity verification completed with status: ${status} -> ${appStatus}`);
    
    res.json({ 
      status: appStatus,
      plaid_status: status,
      message: status === 'success' ? 
        'Identity verification completed successfully!' : 
        'Identity verification submitted for review'
    });
  } catch (error) {
    console.error('Error completing identity verification:', error);
    
    if (error.response?.data) {
      console.error('Plaid error details:', error.response.data);
      return res.status(400).json({ 
        error: 'Plaid error: ' + (error.response.data.error_message || 'Unknown error')
      });
    }
    
    res.status(500).json({ error: 'Failed to complete identity verification' });
  }
});

// Get identity verification status
router.get('/identity-verification/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get the identity verification ID from your database
    const User = getUserModel();
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const idvId = user.plaidIdentityVerificationId;
    
    // If no IDV session exists, return pending
    if (!idvId) {
      return res.json({ 
        status: user.plaidIdentityStatus || 'pending',
        message: 'No identity verification session found'
      });
    }

    try {
      // Get current status from Plaid
      const idvResponse = await plaidClient.identityVerificationGet({
        identity_verification_id: idvId
      });

      const plaidStatus = idvResponse.data.status;
      
      // Map Plaid status to app status
      let appStatus = 'pending';
      if (plaidStatus === 'success') {
        appStatus = 'approved';
      } else if (plaidStatus === 'failed') {
        appStatus = 'failed';
      } else if (plaidStatus === 'pending_review') {
        appStatus = 'pending_review';
      }
      
      // Update database if status changed
      if (user.plaidIdentityStatus !== appStatus) {
        await User.findByIdAndUpdate(userId, { 
          plaidIdentityStatus: appStatus,
          personaVerified: appStatus === 'approved'
        });
      }

      res.json({ 
        status: appStatus,
        plaid_status: plaidStatus
      });
    } catch (plaidError) {
      // If Plaid call fails, return cached status
      console.error('Error fetching from Plaid, using cached status:', plaidError);
      res.json({ 
        status: user.plaidIdentityStatus || 'pending',
        message: 'Using cached status'
      });
    }
  } catch (error) {
    console.error('Error getting identity verification status:', error);
    res.status(500).json({ error: 'Failed to get verification status' });
  }
});

// ============ REGULAR PLAID ENDPOINTS (Bank Connections) ============

// Create link token for bank connections
router.post('/link-token', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const linkTokenResponse = await plaidClient.linkTokenCreate({
      products: process.env.PLAID_PRODUCTS.split(','),
      client_name: 'Pagomigo',
      country_codes: process.env.PLAID_COUNTRY_CODES.split(','),
      language: 'en',
      webhook: process.env.PLAID_WEBHOOKS,
      user: {
        client_user_id: userId.toString()
      }
    });

    console.log('Link token created for bank connection');
    res.json({ link_token: linkTokenResponse.data.link_token });
  } catch (error) {
    console.error('Error creating link token:', error);
    
    if (error.response?.data) {
      console.error('Plaid error details:', error.response.data);
      return res.status(400).json({ 
        error: 'Plaid error: ' + (error.response.data.error_message || 'Unknown error')
      });
    }
    
    res.status(500).json({ error: 'Failed to create link token' });
  }
});

// Exchange public token for access token
router.post('/exchange-token', authenticateToken, async (req, res) => {
  try {
    const { public_token, institution_name } = req.body;
    const userId = req.user.userId;

    if (!public_token) {
      return res.status(400).json({ error: 'Public token is required' });
    }

    console.log('Exchanging public token for access token');

    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: public_token
    });

    const { access_token, item_id } = exchangeResponse.data;

    // Get account information
    const accountsResponse = await plaidClient.accountsGet({
      access_token: access_token
    });

    const accounts = accountsResponse.data.accounts;
    console.log(`Found ${accounts.length} accounts for institution: ${institution_name}`);

    // Save access_token and account info to your database
    const User = getUserModel();
    await User.findByIdAndUpdate(userId, {
      $push: {
        plaidAccounts: {
          accessToken: access_token,
          itemId: item_id,
          institutionName: institution_name || 'Unknown Bank',
          accountId: accounts[0]?.account_id, // Primary account
          accountType: accounts[0]?.type,
          linkedAt: new Date()
        }
      }
    });

    console.log('Bank account connected successfully');
    
    res.json({ 
      success: true, 
      message: 'Bank account connected successfully',
      accounts: accounts.map(acc => ({
        id: acc.account_id,
        name: acc.name,
        mask: acc.mask,
        type: acc.type,
        subtype: acc.subtype
      }))
    });
  } catch (error) {
    console.error('Error exchanging token:', error);
    
    if (error.response?.data) {
      console.error('Plaid error details:', error.response.data);
      return res.status(400).json({ 
        error: 'Plaid error: ' + (error.response.data.error_message || 'Unknown error')
      });
    }
    
    res.status(500).json({ error: 'Failed to connect bank account' });
  }
});

// Get connected accounts
router.get('/accounts', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user's Plaid tokens from database
    const User = getUserModel();
    const user = await User.findById(userId);
    
    if (!user || !user.plaidAccounts || user.plaidAccounts.length === 0) {
      return res.json({ accounts: [] });
    }

    const allAccounts = [];
    
    // Fetch accounts for each connected institution
    for (const plaidAccount of user.plaidAccounts) {
      try {
        const accountsResponse = await plaidClient.accountsGet({
          access_token: plaidAccount.accessToken
        });
        
        const accounts = accountsResponse.data.accounts.map(acc => ({
          id: acc.account_id,
          name: acc.name,
          institution: plaidAccount.institutionName,
          mask: acc.mask,
          type: acc.type,
          subtype: acc.subtype,
          linkedAt: plaidAccount.linkedAt
        }));
        
        allAccounts.push(...accounts);
      } catch (accountError) {
        console.error(`Error fetching accounts for ${plaidAccount.institutionName}:`, accountError);
        // Continue with other accounts if one fails
      }
    }
    
    res.json({ accounts: allAccounts });
  } catch (error) {
    console.error('Error getting accounts:', error);
    res.status(500).json({ error: 'Failed to get accounts' });
  }
});

// Get account balance
router.get('/accounts/:accountId/balance', authenticateToken, async (req, res) => {
  try {
    const { accountId } = req.params;
    const userId = req.user.userId;
    
    // Find the access token for this account
    const User = getUserModel();
    const user = await User.findById(userId);
    
    if (!user || !user.plaidAccounts) {
      return res.status(404).json({ error: 'No connected accounts found' });
    }

    let accessToken = null;
    
    // Find the correct access token by checking each account
    for (const plaidAccount of user.plaidAccounts) {
      try {
        const accountsResponse = await plaidClient.accountsGet({
          access_token: plaidAccount.accessToken
        });
        
        const account = accountsResponse.data.accounts.find(acc => acc.account_id === accountId);
        if (account) {
          accessToken = plaidAccount.accessToken;
          break;
        }
      } catch (err) {
        // Continue searching in other accounts
        continue;
      }
    }
    
    if (!accessToken) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Get balance for the specific account
    const balanceResponse = await plaidClient.accountsBalanceGet({
      access_token: accessToken,
      options: {
        account_ids: [accountId]
      }
    });

    const account = balanceResponse.data.accounts[0];
    
    if (!account) {
      return res.status(404).json({ error: 'Account balance not found' });
    }

    res.json({
      balance: {
        current: account.balances.current,
        available: account.balances.available,
        currency: account.balances.iso_currency_code || 'USD'
      }
    });
  } catch (error) {
    console.error('Error getting account balance:', error);
    
    if (error.response?.data) {
      console.error('Plaid error details:', error.response.data);
      return res.status(400).json({ 
        error: 'Plaid error: ' + (error.response.data.error_message || 'Unknown error')
      });
    }
    
    res.status(500).json({ error: 'Failed to get account balance' });
  }
});

// Debug endpoint to check Plaid configuration
router.get('/debug/config', authenticateToken, async (req, res) => {
  try {
    const config = {
      environment: process.env.PLAID_ENV || 'sandbox',
      client_id_set: !!process.env.PLAID_CLIENT_ID,
      secret_set: !!process.env.PLAID_SECRET,
      products: process.env.PLAID_PRODUCTS || 'Not set',
      country_codes: process.env.PLAID_COUNTRY_CODES || 'Not set',
      idv_template_id_set: !!process.env.PLAID_IDV_TEMPLATE_ID,
      webhook_url: process.env.PLAID_WEBHOOKS || 'Not set'
    };
    
    // Test basic Plaid connectivity
    try {
      await plaidClient.institutionsGet({
        count: 1,
        offset: 0,
        country_codes: ['US']
      });
      config.plaid_connectivity = 'Success';
    } catch (testError) {
      config.plaid_connectivity = `Failed: ${testError.message}`;
    }
    
    res.json({
      success: true,
      config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Webhook handler for Plaid events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const { webhook_type, webhook_code, item_id, identity_verification_id } = req.body;
    
    console.log('Plaid webhook received:', { webhook_type, webhook_code, item_id, identity_verification_id });
    
    // Handle different webhook types
    switch (webhook_type) {
      case 'ITEM':
        console.log(`Item webhook: ${webhook_code} for item ${item_id}`);
        break;
      case 'TRANSACTIONS':
        console.log(`Transactions webhook: ${webhook_code} for item ${item_id}`);
        break;
      case 'IDENTITY_VERIFICATION':
        console.log(`Identity verification webhook: ${webhook_code}`);
        if (identity_verification_id) {
          // Update user's verification status
          try {
            const idvResponse = await plaidClient.identityVerificationGet({
              identity_verification_id: identity_verification_id
            });
            
            const status = idvResponse.data.status;
            let appStatus = 'pending';
            
            if (status === 'success') {
              appStatus = 'approved';
            } else if (status === 'failed') {
              appStatus = 'failed';
            } else if (status === 'pending_review') {
              appStatus = 'pending_review';
            }
            
            // Find and update user
            const User = getUserModel();
            await User.findOneAndUpdate(
              { plaidIdentityVerificationId: identity_verification_id },
              { 
                plaidIdentityStatus: appStatus,
                personaVerified: appStatus === 'approved'
              }
            );
            
            console.log(`Updated user verification status to: ${appStatus}`);
          } catch (updateError) {
            console.log('Error updating verification status from webhook:', updateError);
          }
        }
        break;
      default:
        console.log(`Unhandled webhook type: ${webhook_type}`);
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Error handling Plaid webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;