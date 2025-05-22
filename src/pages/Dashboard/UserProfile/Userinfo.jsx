// src/pages/Dashboard/UserProfile/Userinfo.jsx
import React, { useState, useEffect } from 'react';
import { useUserProfile } from '../../../hooks/useUserProfile';

// User profile data management component
const Userinfo = () => {
  const { userData, loading, error, updateUserProfile } = useUserProfile();
  const [profileData, setProfileData] = useState(null);

  // Initialize profile data when userData changes
  useEffect(() => {
    if (userData) {
      setProfileData(userData);
    }
  }, [userData]);

  // Function to update user profile
  const updateProfile = async (newProfileData) => {
    try {
      // If useUserProfile hook has an update function, use it
      if (updateUserProfile) {
        const result = await updateUserProfile(newProfileData);
        if (result.success) {
          setProfileData(newProfileData);
          return { success: true };
        } else {
          return { success: false, error: result.error };
        }
      } else {
        // Simulate API call for now
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update local state
        setProfileData(newProfileData);
        
        return { success: true };
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }
  };

  // Function to get current profile data
  const getProfile = () => {
    return profileData || userData;
  };

  // Function to refresh profile data
  const refreshProfile = async () => {
    // This would typically refetch from the server
    // For now, we'll just return the current data
    return getProfile();
  };

  return {
    profile: getProfile(),
    loading,
    error,
    updateProfile,
    refreshProfile
  };
};

// Custom hook for using user info
export const useUserInfo = () => {
  const { userData, loading, error } = useUserProfile();
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    if (userData) {
      setProfileData(userData);
    }
  }, [userData]);

  const updateProfile = async (newProfileData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setProfileData({ ...profileData, ...newProfileData });
      
      return { success: true, message: 'Profile updated successfully!' };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  };

  return {
    userData: profileData || userData,
    loading,
    error,
    updateProfile
  };
};

export default Userinfo;