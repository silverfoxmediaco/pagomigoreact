// src/hooks/useUserProfile.js
import { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../config';

export const useUserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch user profile from real API
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return null;
      }
      
      console.log('Fetching profile from API...');
      
      const response = await fetch(`${API_BASE}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid, remove it
          localStorage.removeItem('token');
          setError('Session expired. Please log in again.');
          return null;
        }
        
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch profile');
      }
      
      const profileData = await response.json();
      console.log('Profile data received:', profileData);
      
      setUserData(profileData);
      return profileData;
      
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load user profile: ' + err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (profileData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found');
        return { success: false, error: 'Not authenticated' };
      }
      
      const updatableFields = {
        name: profileData.name,
        username: profileData.username,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address
      };
      
      const response = await fetch(`${API_BASE}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatableFields)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      const updatedProfile = await response.json();
      setUserData(updatedProfile);
      setSuccess('Profile updated successfully!');
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
      return { success: true, data: updatedProfile };
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    userData,
    loading,
    error,
    success,
    fetchProfile,
    updateProfile
  };
};

export default useUserProfile;