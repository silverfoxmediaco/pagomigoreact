// src/Persona/personaService.js

const API_BASE = process.env.REACT_APP_API_BASE || '';

/**
 * Get authentication token from localStorage
 */
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please log in.');
  }
  return token;
};

/**
 * Make authenticated API requests
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    },
    ...options
  };

  const response = await fetch(`${API_BASE}/api${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`API request failed: ${response.status} - ${errorData}`);
  }

  return response.json();
};

/**
 * Get user profile data
 */
export const getUserProfile = async () => {
  try {
    console.log('Fetching user profile for Persona...');
    const profile = await apiRequest('/user/profile');
    console.log('User profile fetched:', profile);
    return profile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Create a new Persona inquiry
 */
export const createPersonaInquiry = async (userData = {}) => {
  try {
    console.log('Creating Persona inquiry with data:', userData);
    
    const inquiryData = await apiRequest('/persona/create-inquiry', {
      method: 'POST',
      body: JSON.stringify({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || ''
      })
    });
    
    console.log('Persona inquiry created:', inquiryData);
    return inquiryData;
  } catch (error) {
    console.error('Error creating Persona inquiry:', error);
    throw error;
  }
};

/**
 * Get verification status for a specific inquiry
 */
export const getVerificationStatus = async (inquiryId) => {
  try {
    console.log('Checking verification status for inquiry:', inquiryId);
    
    const status = await apiRequest(`/persona/status/${inquiryId}`);
    
    console.log('Verification status:', status);
    return status;
  } catch (error) {
    console.error('Error checking verification status:', error);
    throw error;
  }
};

/**
 * Update user's Persona verification status
 */
export const updatePersonaStatus = async (inquiryId, status) => {
  try {
    console.log('Updating Persona status:', { inquiryId, status });
    
    const result = await apiRequest('/persona/update-status', {
      method: 'POST',
      body: JSON.stringify({
        inquiryId,
        status
      })
    });
    
    console.log('Persona status updated:', result);
    return result;
  } catch (error) {
    console.error('Error updating Persona status:', error);
    throw error;
  }
};

/**
 * Get current user's verification status
 */
export const getCurrentVerificationStatus = async () => {
  try {
    console.log('Getting current user verification status...');
    
    const status = await apiRequest('/persona/my-status');
    
    console.log('Current verification status:', status);
    return status;
  } catch (error) {
    console.error('Error getting current verification status:', error);
    // Return default status if API call fails
    return {
      status: 'pending',
      inquiryId: null,
      message: 'Unable to fetch verification status'
    };
  }
};

/**
 * Webhook handler for Persona status updates (for backend use)
 */
export const handlePersonaWebhook = async (webhookData) => {
  try {
    console.log('Processing Persona webhook:', webhookData);
    
    const result = await apiRequest('/persona/webhook', {
      method: 'POST',
      body: JSON.stringify(webhookData)
    });
    
    console.log('Webhook processed:', result);
    return result;
  } catch (error) {
    console.error('Error processing Persona webhook:', error);
    throw error;
  }
};

/**
 * Get supported countries/regions for Persona verification
 */
export const getSupportedRegions = () => {
  return [
    { code: 'MX', name: 'Mexico', flag: 'MX' },
    { code: 'CO', name: 'Colombia', flag: 'CO' },
    { code: 'AR', name: 'Argentina', flag: 'AR' },
    { code: 'PE', name: 'Peru', flag: 'PE' },
    { code: 'ES', name: 'Spain', flag: 'ES' },
    { code: 'CR', name: 'Costa Rica', flag: 'CR' },
    { code: 'GT', name: 'Guatemala', flag: 'GT' },
    { code: 'CL', name: 'Chile', flag: 'CL' },
    { code: 'EC', name: 'Ecuador', flag: 'EC' },
    { code: 'BO', name: 'Bolivia', flag: 'BO' },
    { code: 'PY', name: 'Paraguay', flag: 'PY' },
    { code: 'UY', name: 'Uruguay', flag: 'UY' },
    { code: 'VE', name: 'Venezuela', flag: 'VE' },
    { code: 'PA', name: 'Panama', flag: 'PA' },
    { code: 'SV', name: 'El Salvador', flag: 'SV' },
    { code: 'HN', name: 'Honduras', flag: 'HN' },
    { code: 'NI', name: 'Nicaragua', flag: 'NI' }
  ];
};

/**
 * Check if user's country is supported by Persona
 */
export const isCountrySupported = (countryCode) => {
  const supportedRegions = getSupportedRegions();
  return supportedRegions.some(region => region.code === countryCode.toUpperCase());
};

// Default export with all functions
export default {
  getUserProfile,
  createPersonaInquiry,
  getVerificationStatus,
  updatePersonaStatus,
  getCurrentVerificationStatus,
  handlePersonaWebhook,
  getSupportedRegions,
  isCountrySupported
};