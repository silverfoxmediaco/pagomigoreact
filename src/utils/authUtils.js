// src/utils/authUtils.js

/**
 * Get the authentication token from localStorage
 * @returns {string|null} The token or null if not found
 */
export const getAuthToken = () => {
    return localStorage.getItem('token');
  };
  
  /**
   * Store the authentication token in localStorage
   * @param {string} token - The JWT token to store
   */
  export const setAuthToken = (token) => {
    localStorage.setItem('token', token);
  };
  
  /**
   * Remove the authentication token from localStorage
   */
  export const removeAuthToken = () => {
    localStorage.removeItem('token');
  };
  
  /**
   * Check if the user is authenticated
   * @returns {boolean} True if authenticated, false otherwise
   */
  export const isAuthenticated = () => {
    return !!getAuthToken();
  };
  
  /**
   * Perform an authenticated fetch request
   * @param {string} url - The URL to fetch
   * @param {Object} options - Fetch options
   * @returns {Promise<Response>} The fetch response
   */
  export const authFetch = async (url, options = {}) => {
    const token = getAuthToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers
    };
    
    return fetch(url, {
      ...options,
      headers
    });
  };
  
  /**
   * Create a service with authenticated methods
   * @param {string} baseUrl - The base URL for the service
   * @returns {Object} An object with get, post, put, and delete methods
   */
  export const createAuthService = (baseUrl) => {
    return {
      get: async (path, options = {}) => {
        const response = await authFetch(`${baseUrl}${path}`, {
          ...options,
          method: 'GET'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        
        return response.json();
      },
      
      post: async (path, data, options = {}) => {
        const response = await authFetch(`${baseUrl}${path}`, {
          ...options,
          method: 'POST',
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        
        return response.json();
      },
      
      put: async (path, data, options = {}) => {
        const response = await authFetch(`${baseUrl}${path}`, {
          ...options,
          method: 'PUT',
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        
        return response.json();
      },
      
      delete: async (path, options = {}) => {
        const response = await authFetch(`${baseUrl}${path}`, {
          ...options,
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        
        return response.json();
      }
    };
  };
  
  /**
   * Get error messages from API responses
   * @param {Error|Response} error - The error or response object
   * @returns {string} The error message
   */
  export const getErrorMessage = async (error) => {
    if (error instanceof Response) {
      try {
        const data = await error.json();
        return data.message || data.error || 'An error occurred';
      } catch {
        return `HTTP error ${error.status}`;
      }
    }
    
    return error.message || 'An error occurred';
  };