// src/utils/auth.js
export const getAuthToken = () => {
    return localStorage.getItem('token');
  };
  
  export const setAuthToken = (token) => {
    localStorage.setItem('token', token);
  };
  
  export const removeAuthToken = () => {
    localStorage.removeItem('token');
  };
  
  export const isAuthenticated = () => {
    return !!getAuthToken();
  };
  
  // Helper for authenticated API requests
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