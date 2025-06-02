// routes/persona.js - BACKEND ROUTES (not frontend service)
const express = require('express');
const crypto = require('crypto');
const router = express.Router();

// Persona API configuration - ONLY use environment variables
const PERSONA_API_KEY = process.env.PERSONA_API_KEY;
const PERSONA_VERSION = process.env.PERSONA_VERSION || '2023-01-05';
const PERSONA_BASE_URL = 'https://withpersona.com/api/v1';

// Check for required environment variables
if (!PERSONA_API_KEY) {
  console.error('PERSONA_API_KEY environment variable is required');
}

// Helper function to make Persona API calls
const personaApiCall = async (endpoint, method = 'GET', data = null) => {
  if (!PERSONA_API_KEY) {
    throw new Error('Persona API key not configured');
  }

  const url = `${PERSONA_BASE_URL}${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${PERSONA_API_KEY}`,
      'Persona-Version': PERSONA_VERSION,
      'Content-Type': 'application/json'
    }
  };

  if (data && (method === 'POST' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  console.log(`Persona API Call: ${method} ${url}`);
  console.log('Request data:', JSON.stringify(data, null, 2));
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Persona API Error: ${response.status} - ${errorText}`);
    throw new Error(`Persona API Error: ${response.status} - ${errorText}`);
  }

  return await response.json();
};

// POST /api/persona/create-inquiry - FIXED VERSION
router.post('/create-inquiry', async (req, res) => {
  try {
    console.log('Creating Persona inquiry for user:', req.user?.userId);
    console.log('Raw request body:', JSON.stringify(req.body, null, 2));
    
    const { firstName, lastName, email, phone } = req.body;
    
    // Strict email validation
    if (!email) {
      console.error('Email validation failed: Email is required');
      return res.status(400).json({
        success: false,
        error: 'Email address is required'
      });
    }

    if (typeof email !== 'string') {
      console.error('Email validation failed: Email must be a string, received:', typeof email, email);
      return res.status(400).json({
        success: false,
        error: 'Email address must be a valid string'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      console.error('Email validation failed: Invalid email format:', email);
      return res.status(400).json({
        success: false,
        error: 'Invalid email address format'
      });
    }

    // Clean and validate all data
    const userData = {
      firstName: firstName && typeof firstName === 'string' ? firstName.trim() : '',
      lastName: lastName && typeof lastName === 'string' ? lastName.trim() : '',
      email: email.trim().toLowerCase(),
      phone: phone && typeof phone === 'string' ? phone.trim() : ''
    };
    
    console.log('Cleaned user data:', JSON.stringify(userData, null, 2));
    
    // Validate template ID
    if (!process.env.PERSONA_TEMPLATE_ID) {
      console.error('PERSONA_TEMPLATE_ID environment variable is required');
      return res.status(500).json({
        success: false,
        error: 'Persona template not configured'
      });
    }

    // Build the inquiry request with proper field structure
    const inquiryData = {
      data: {
        type: 'inquiry',
        attributes: {
          'inquiry-template-id': process.env.PERSONA_TEMPLATE_ID,
          'reference-id': String(req.user?.userId || `user_${Date.now()}`),
          'note': `Pagomigo verification for ${userData.email}`
        }
      }
    };

    // Add fields using the correct Persona field names and structure
    const fields = {};
    
    if (userData.firstName) {
      fields['name-first'] = {
        type: 'string',
        value: userData.firstName
      };
    }
    
    if (userData.lastName) {
      fields['name-last'] = {
        type: 'string', 
        value: userData.lastName
      };
    }
    
    // This is the critical fix - ensure email is properly structured
    if (userData.email) {
      fields['email-address'] = {
        type: 'string',
        value: userData.email
      };
    }
    
    if (userData.phone) {
      fields['phone-number'] = {
        type: 'string',
        value: userData.phone
      };
    }
    
    // Only add fields if we have any
    if (Object.keys(fields).length > 0) {
      inquiryData.data.attributes.fields = fields;
    }
    
    console.log('Final Persona request:', JSON.stringify(inquiryData, null, 2));

    const result = await personaApiCall('/inquiries', 'POST', inquiryData);
    
    console.log('Persona API success:', JSON.stringify(result, null, 2));
    
    // Update user in database
    if (req.user?.userId && result.data?.id) {
      try {
        await req.db.collection('users').updateOne(
          { _id: req.user.userId },
          { 
            $set: { 
              persona_inquiry_id: result.data.id,
              persona_status: 'created',
              persona_updated_at: new Date()
            }
          }
        );
        console.log('Updated user database with inquiry ID:', result.data.id);
      } catch (dbError) {
        console.error('Database update error:', dbError);
        // Don't fail the request for DB errors
      }
    }

    res.json({
      success: true,
      inquiry: {
        id: result.data.id,
        status: result.data.attributes.status,
        reference_id: result.data.attributes['reference-id']
      }
    });

  } catch (error) {
    console.error('Persona inquiry creation error:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      error: 'Failed to create identity verification inquiry',
      details: error.message
    });
  }
});

// GET /api/persona/status/:inquiryId
router.get('/status/:inquiryId', async (req, res) => {
  try {
    const { inquiryId } = req.params;
    
    console.log('Checking Persona status for inquiry:', inquiryId);
    
    const result = await personaApiCall(`/inquiries/${inquiryId}`);
    
    res.json({
      success: true,
      inquiry_id: result.data.id,
      status: result.data.attributes.status,
      created_at: result.data.attributes['created-at'],
      updated_at: result.data.attributes['updated-at'],
      reference_id: result.data.attributes['reference-id']
    });

  } catch (error) {
    console.error('Error checking Persona status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check verification status',
      details: error.message
    });
  }
});

// GET /api/persona/my-status
router.get('/my-status', async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const user = await req.db.collection('users').findOne({ _id: req.user.userId });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    let status = user.persona_status || 'pending';
    let inquiryId = user.persona_inquiry_id || null;

    // If we have an inquiry ID, check the latest status from Persona
    if (inquiryId) {
      try {
        const result = await personaApiCall(`/inquiries/${inquiryId}`);
        const latestStatus = result.data.attributes.status;
        
        if (latestStatus !== status) {
          status = latestStatus;
          await req.db.collection('users').updateOne(
            { _id: req.user.userId },
            { 
              $set: { 
                persona_status: status,
                persona_updated_at: new Date()
              }
            }
          );
        }
      } catch (personaError) {
        console.error('Error fetching latest status from Persona:', personaError);
      }
    }

    res.json({
      success: true,
      status: status,
      inquiryId: inquiryId,
      message: getStatusMessage(status)
    });

  } catch (error) {
    console.error('Error getting user verification status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get verification status',
      details: error.message
    });
  }
});

// POST /api/persona/update-status
router.post('/update-status', async (req, res) => {
  try {
    const { inquiryId, status } = req.body;
    
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    await req.db.collection('users').updateOne(
      { _id: req.user.userId },
      { 
        $set: { 
          persona_inquiry_id: inquiryId,
          persona_status: status,
          persona_updated_at: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: 'Verification status updated successfully'
    });

  } catch (error) {
    console.error('Error updating Persona status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update verification status',
      details: error.message
    });
  }
});

// POST /api/persona/webhook - Handle Persona webhooks with signature verification
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    console.log('Persona webhook received');
    
    // Verify webhook signature if secret is configured
    const webhookSecret = process.env.PERSONA_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = req.headers['persona-signature'];
      const timestamp = req.headers['persona-timestamp'];
      
      if (!signature || !timestamp) {
        console.error('Missing Persona signature or timestamp');
        return res.status(400).json({ error: 'Missing webhook signature' });
      }
      
      const payload = timestamp + '.' + req.body;
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payload, 'utf8')
        .digest('hex');
      
      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature');
        return res.status(400).json({ error: 'Invalid webhook signature' });
      }
    }
    
    const webhookData = JSON.parse(req.body);
    console.log('Webhook data:', webhookData);
    
    const { data } = webhookData;
    
    if (data && data.type === 'inquiry' && data.attributes) {
      const inquiryId = data.id;
      const status = data.attributes.status;
      const referenceId = data.attributes['reference-id'];
      
      console.log(`Processing inquiry ${inquiryId} with status: ${status}`);
      
      const user = await req.db.collection('users').findOne({ 
        $or: [
          { _id: referenceId },
          { persona_inquiry_id: inquiryId }
        ]
      });
      
      if (user) {
        const updateData = { 
          persona_inquiry_id: inquiryId,
          persona_status: status,
          persona_updated_at: new Date(),
          kyc_status: mapPersonaStatusToKyc(status)
        };
        
        if (status === 'completed' || status === 'approved') {
          updateData.persona_completed_at = new Date();
          updateData.kyc_completed_at = new Date();
        }
        
        await req.db.collection('users').updateOne(
          { _id: user._id },
          { $set: updateData }
        );
        
        console.log(`Updated user ${user._id} Persona status to: ${status}`);
        
      } else {
        console.warn(`No user found for Persona inquiry: ${inquiryId} with reference: ${referenceId}`);
      }
    }

    res.status(200).json({ 
      received: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error processing Persona webhook:', error);
    
    res.status(200).json({
      error: 'Webhook processing failed',
      details: error.message
    });
  }
});

// Helper functions
function getStatusMessage(status) {
  switch (status) {
    case 'created':
      return 'Verification started. Please complete the process.';
    case 'pending':
      return 'Verification is pending. Please complete the identity check.';
    case 'completed':
    case 'approved':
      return 'Identity verification completed successfully.';
    case 'failed':
    case 'declined':
      return 'Identity verification failed. Please contact support.';
    case 'needs_review':
    case 'pending_review':
      return 'Your verification is under review. We\'ll notify you when complete.';
    case 'expired':
      return 'Verification session expired. Please start a new verification.';
    default:
      return 'Verification status unknown. Please contact support.';
  }
}

function mapPersonaStatusToKyc(personaStatus) {
  switch (personaStatus) {
    case 'completed':
    case 'approved':
      return 'completed';
    case 'failed':
    case 'declined':
      return 'failed';
    case 'needs_review':
    case 'pending_review':
    case 'pending':
      return 'pending';
    case 'expired':
      return 'expired';
    default:
      return 'pending';
  }
}

module.exports = router;