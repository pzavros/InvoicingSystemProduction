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