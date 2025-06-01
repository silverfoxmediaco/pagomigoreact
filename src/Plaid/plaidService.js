// Enhanced plaidService.js with better error handling and debugging
const API_BASE = process.env.REACT_APP_API_BASE || '';

// Enhanced error handler that captures more details
const handleResponse = async (response) => {
  console.log(`[PLAID DEBUG] Response status: ${response.status}`);
  console.log(`[PLAID DEBUG] Response headers:`, response.headers);
  
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
      console.log(`[PLAID DEBUG] Error response body:`, errorData);
    } catch (parseError) {
      console.log(`[PLAID DEBUG] Could not parse error response as JSON`);
      const textError = await response.text();
      console.log(`[PLAID DEBUG] Error response text:`, textError);
      throw new Error(`HTTP error! status: ${response.status} - ${textError}`);
    }
    
    // More specific error message
    const errorMessage = errorData.error || 
                        errorData.message || 
                        errorData.plaid_error_code ||
                        `HTTP error! status: ${response.status}`;
    
    console.error(`[PLAID DEBUG] API Error:`, {
      status: response.status,
      error: errorMessage,
      plaid_error_code: errorData.plaid_error_code,
      plaid_error_type: errorData.plaid_error_type,
      full_response: errorData
    });
    
    throw new Error(errorMessage);
  }
  return response.json();
};

// Enhanced auth headers with debugging
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  console.log(`[PLAID DEBUG] Auth token exists: ${!!token}`);
  
  if (token) {
    console.log(`[PLAID DEBUG] Token length: ${token.length}`);
    console.log(`[PLAID DEBUG] Token prefix: ${token.substring(0, 20)}...`);
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Create identity verification link token with enhanced debugging
export const createIdvLinkToken = async () => {
  try {
    console.log(`[PLAID DEBUG] Creating IDV link token...`);
    console.log(`[PLAID DEBUG] API Base: ${API_BASE}`);
    console.log(`[PLAID DEBUG] Full URL: ${API_BASE}/api/plaid/identity-verification/create`);
    
    const headers = getAuthHeaders();
    console.log(`[PLAID DEBUG] Request headers:`, headers);
    
    const response = await fetch(`${API_BASE}/api/plaid/identity-verification/create`, {
      method: 'POST',
      headers
    });
    
    const data = await handleResponse(response);
    console.log(`[PLAID DEBUG] IDV link token created successfully:`, data);
    return data.link_token;
  } catch (error) {
    console.error('[PLAID DEBUG] Error creating IDV link token:', error);
    throw error;
  }
};

// Test function to check your backend directly
export const testBackendConnection = async () => {
  try {
    console.log('[PLAID DEBUG] Testing backend connection...');
    
    // Test 1: Check if API is responding
    const pingResponse = await fetch(`${API_BASE}/api/ping`);
    console.log('[PLAID DEBUG] Ping test:', pingResponse.ok ? 'SUCCESS' : 'FAILED');
    
    // Test 2: Check auth endpoint
    const headers = getAuthHeaders();
    const authTestResponse = await fetch(`${API_BASE}/api/plaid/debug/config`, {
      method: 'GET',
      headers
    });
    
    if (authTestResponse.ok) {
      const configData = await authTestResponse.json();
      console.log('[PLAID DEBUG] Backend config:', configData);
      return configData;
    } else {
      console.log('[PLAID DEBUG] Auth test failed:', authTestResponse.status);
      const errorText = await authTestResponse.text();
      console.log('[PLAID DEBUG] Auth error details:', errorText);
      return null;
    }
  } catch (error) {
    console.error('[PLAID DEBUG] Backend connection test failed:', error);
    return null;
  }
};

// Test function for step-by-step debugging
export const debugPlaidSetup = async () => {
  console.log('=== PLAID SETUP DEBUGGING ===');
  
  // Step 1: Test backend connection
  console.log('\n1. Testing backend connection...');
  const backendTest = await testBackendConnection();
  
  if (!backendTest) {
    console.log('Backend connection failed. Check if server is running.');
    return false;
  }
  
  // Step 2: Check authentication
  console.log('\n2. Checking authentication...');
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('No auth token found. Please login first.');
    return false;
  }
  
  // Step 3: Test bank link token (simpler endpoint)
  console.log('\n3. Testing bank link token creation...');
  try {
    const bankLinkToken = await createLinkToken();
    console.log('Bank link token created successfully');
  } catch (error) {
    console.log('Bank link token failed:', error.message);
    return false;
  }
  
  // Step 4: Test IDV link token
  console.log('\n4. Testing IDV link token creation...');
  try {
    const idvLinkToken = await createIdvLinkToken();
    console.log('IDV link token created successfully');
    return true;
  } catch (error) {
    console.log('IDV link token failed:', error.message);
    
    // More specific troubleshooting
    if (error.message.includes('Template')) {
      console.log('Solution: Create an Identity Verification template in Plaid Dashboard');
    } else if (error.message.includes('401')) {
      console.log('Solution: Check your authentication token');
    } else if (error.message.includes('403')) {
      console.log('Solution: Check your Plaid API credentials');
    }
    
    return false;
  }
};

// Also keep your existing functions but with enhanced debugging
export const createLinkToken = async () => {
  try {
    console.log(`[PLAID DEBUG] Creating bank link token...`);
    
    const response = await fetch(`${API_BASE}/api/plaid/link-token`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    const data = await handleResponse(response);
    return data.link_token;
  } catch (error) {
    console.error('[PLAID DEBUG] Error creating bank link token:', error);
    throw error;
  }
};

export const exchangePublicToken = async (publicToken, institutionName) => {
  try {
    console.log(`[PLAID DEBUG] Exchanging public token for ${institutionName}...`);
    
    const response = await fetch(`${API_BASE}/api/plaid/exchange-token`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        public_token: publicToken,
        institution_name: institutionName
      })
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('[PLAID DEBUG] Error exchanging public token:', error);
    throw error;
  }
};

export const completeIdentityVerification = async (identityVerificationId) => {
  try {
    console.log(`[PLAID DEBUG] Completing identity verification: ${identityVerificationId}`);
    
    const response = await fetch(`${API_BASE}/api/plaid/identity-verification/complete`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        identity_verification_id: identityVerificationId
      })
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('[PLAID DEBUG] Error completing identity verification:', error);
    throw error;
  }
};

export const getVerificationStatus = async () => {
  try {
    console.log(`[PLAID DEBUG] Getting verification status...`);
    
    const response = await fetch(`${API_BASE}/api/plaid/identity-verification/status`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('[PLAID DEBUG] Error getting verification status:', error);
    throw error;
  }
};

export const getConnectedAccounts = async () => {
  try {
    console.log(`[PLAID DEBUG] Getting connected accounts...`);
    
    const response = await fetch(`${API_BASE}/api/plaid/accounts`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    const data = await handleResponse(response);
    return data.accounts || [];
  } catch (error) {
    console.error('[PLAID DEBUG] Error getting connected accounts:', error);
    throw error;
  }
};

export const getAccountBalance = async (accountId) => {
  try {
    console.log(`[PLAID DEBUG] Getting account balance for: ${accountId}`);
    
    const response = await fetch(`${API_BASE}/api/plaid/accounts/${accountId}/balance`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    const data = await handleResponse(response);
    return data.balance;
  } catch (error) {
    console.error('[PLAID DEBUG] Error getting account balance:', error);
    throw error;
  }
};