// src/components/UserProfilePage/api.js
// Re-export the existing auth API functions to maintain consistency
export { 
  getUserProfile, 
  updateUserProfile 
} from '../AuthPages/api';

// For password update and preferences, we'll use the existing auth API instance
import authApi from '../AuthPages/api';

// Update password
export const updatePassword = async (passwordData) => {
  try {
    const response = await authApi.put('/api/auth/password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

// Update preferences
export const updatePreferences = async (preferences) => {
  try {
    const response = await authApi.put('/api/auth/preferences', preferences);
    return response.data;
  } catch (error) {
    console.error('Error updating preferences:', error);
    throw error;
  }
};

// OTP-based password change functions
export const requestPasswordChangeOtp = async (data) => {
  try {
    const response = await authApi.post('/api/auth/request-password-change-otp', data);
    return response.data;
  } catch (error) {
    console.error('Error requesting password change OTP:', error);
    throw error;
  }
};

export const verifyPasswordChangeOtp = async (data) => {
  try {
    const response = await authApi.post('/api/auth/verify-password-change-otp', data);
    return response.data;
  } catch (error) {
    console.error('Error verifying password change OTP:', error);
    throw error;
  }
};

export const changePasswordWithOtp = async (data) => {
  try {
    const response = await authApi.post('/api/auth/change-password-with-otp', data);
    return response.data;
  } catch (error) {
    console.error('Error changing password with OTP:', error);
    throw error;
  }
};