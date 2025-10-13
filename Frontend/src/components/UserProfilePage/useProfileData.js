// src/components/UserProfilePage/useProfileData.js
import { useState, useEffect, useCallback } from 'react';
import { 
  getUserProfile, 
  updateUserProfile, 
  updatePassword, 
  updatePreferences,
  requestPasswordChangeOtp,
  verifyPasswordChangeOtp,
  changePasswordWithOtp
} from './api';

const useProfileData = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [preferences, setPreferences] = useState({
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    language: 'English',
    emailNotifications: true,
    darkMode: false
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
        lastName: profileData.lastName
      });
      
      // Set preferences from profile data
      setPreferences({
        currency: profileData.currency || 'USD',
        dateFormat: profileData.dateFormat || 'MM/DD/YYYY',
        language: profileData.language || 'English',
        emailNotifications: profileData.emailNotifications ?? true,
        darkMode: profileData.darkMode ?? false
      });
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
      // Merge the form data with existing profile data to create a complete UserDto
      const completeUserData = {
        id: profile.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: profile.email,
        isActive: profile.isActive ?? true,
        subscriptionPlan: profile.subscriptionPlan,
        subscriptionExpiryDate: profile.subscriptionExpiryDate,
        isTrialUser: profile.isTrialUser ?? false,
        isAdmin: profile.isAdmin ?? false,
        lastLoginDate: profile.lastLoginDate,
        dateEntered: profile.dateEntered,
        enteredBy: profile.enteredBy,
        // Include preferences
        currency: profile.currency,
        dateFormat: profile.dateFormat,
        language: profile.language,
        emailNotifications: profile.emailNotifications ?? true,
        darkMode: profile.darkMode ?? false
      };
      
      await updateUserProfile(completeUserData);
      await fetchProfile(); // Refresh data
      return { success: true };
    } catch (err) {
      console.error('Update profile error:', err);
      return { success: false, error: err.response?.data?.message || err.message || 'Failed to update profile' };
    }
  }, [profile, fetchProfile]);

  const changePassword = useCallback({
    // Legacy password change (for backward compatibility)
    legacy: async (data) => {
      try {
        await updatePassword(data);
        return { success: true };
      } catch (err) {
        return { success: false, error: err.response?.data?.message || err.message || 'Failed to update password' };
      }
    },
    
    // Step 1: Request OTP
    requestOtp: async (data) => {
      try {
        await requestPasswordChangeOtp(data);
        return { success: true };
      } catch (err) {
        return { success: false, error: err.response?.data?.message || err.message || 'Failed to send OTP' };
      }
    },
    
    // Step 2: Verify OTP
    verifyOtp: async (data) => {
      try {
        await verifyPasswordChangeOtp(data);
        return { success: true };
      } catch (err) {
        return { success: false, error: err.response?.data?.message || err.message || 'Invalid or expired OTP' };
      }
    },
    
    // Step 3: Change password with OTP
    changePassword: async (data) => {
      try {
        await changePasswordWithOtp(data);
        return { success: true };
      } catch (err) {
        return { success: false, error: err.response?.data?.message || err.message || 'Failed to change password' };
      }
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
