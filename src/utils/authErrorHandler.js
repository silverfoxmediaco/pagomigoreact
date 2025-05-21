// src/utils/authErrorHandler.js

/**
 * Helper function to handle API authentication errors consistently
 * @param {Error} error - The error object
 * @param {string} customMessage - Custom error message to log
 * @returns {Object} Error result object
 */
export const handleAuthError = (error, customMessage = 'API Error:') => {
    // Handle authentication errors consistently
    if (error.message === 'Authentication required' || 
        (error.response && error.response.status === 401)) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login?session=expired';
      return { 
        success: false, 
        error: 'Your session has expired. Please log in again.' 
      };
    }
    
    console.error(customMessage, error);
    return { success: false, error: error.message };
  };
  
  export default handleAuthError;