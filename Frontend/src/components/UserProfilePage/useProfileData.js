// src/components/UserProfilePage/useProfileData.js
import { useState, useEffect, useCallback } from 'react';
import { getUserProfile, updateUserProfile, updatePassword, updatePreferences } from './api';

const useProfileData = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    marketingEmails: false,
    securityAlerts: true
  });

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Debug: Check if we have auth token
      const token = localStorage.getItem('authToken');
      const user = localStorage.getItem('user');
      console.log('Auth debug - Token exists:', !!token, 'User exists:', !!user);
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const profileData = await getUserProfile();
      
      setProfile(profileData);
      setFormData({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email
      });
      
      // Set preferences if they exist in profile data
      if (profileData.preferences) {
        setPreferences({
          emailNotifications: profileData.preferences.emailNotifications ?? true,
          marketingEmails: profileData.preferences.marketingEmails ?? false,
          securityAlerts: profileData.preferences.securityAlerts ?? true
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      
      // Handle authentication errors specifically
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError(err.message || 'Failed to fetch profile data');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (data) => {
    try {
      await updateUserProfile(data);
      await fetchProfile(); // Refresh data
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to update profile' };
    }
  }, [fetchProfile]);

  const changePassword = useCallback(async (data) => {
    try {
      await updatePassword(data);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to update password' };
    }
  }, []);

  const savePreferences = useCallback(async (prefs) => {
    try {
      await updatePreferences(prefs);
      setPreferences(prefs);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to save preferences' };
    }
  }, []);

  const refreshData = useCallback(() => {
    return fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    formData,
    setFormData,
    passwordData,
    setPasswordData,
    preferences,
    setPreferences,
    updateProfile,
    changePassword,
    savePreferences,
    refreshData
  };
};

export default useProfileData;
