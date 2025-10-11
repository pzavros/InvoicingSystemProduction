// src/components/UserProfilePage/UserProfilePage.jsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { useAuth } from '../../utils/AuthContext';
import Section from '../ReusableComponents/Section';
import UserProfilePageHeader from './UserProfilePageHeader';
import ProfileInfoCard from './ProfileInfoCard';
import PreferencesCard from './PreferencesCard';
import SubscriptionAlert from './SubscriptionAlert';
import NotificationSnackbar from './NotificationSnackbar';
import useProfileData from './useProfileData';
import useNotification from './useNotification';

const UserProfilePage = () => {
  const [saving, setSaving] = useState(false);
  const { authenticated, user, loading: authLoading } = useAuth();
  const { notification, showNotification, hideNotification } = useNotification();
  
  const {
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
    savePreferences
  } = useProfileData();

  const handleSaveAll = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Save profile information
      const profileResult = await updateProfile(formData);
      if (!profileResult.success) {
        showNotification(profileResult.error || 'Failed to update profile', 'error');
        setSaving(false);
        return;
      }

      // Save preferences
      const preferencesResult = await savePreferences(preferences);
      if (!preferencesResult.success) {
        showNotification(preferencesResult.error || 'Failed to update preferences', 'error');
        setSaving(false);
        return;
      }

      // If both successful
      showNotification('All changes saved successfully!', 'success');
    } catch (error) {
      showNotification('An error occurred while saving changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Check authentication first
  if (authLoading) {
    return (
      <Section>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      </Section>
    );
  }

  if (!authenticated || !user) {
    return (
      <Section>
        <Alert severity="error" sx={{ mb: 2 }}>
          You must be logged in to view your profile. Please log in and try again.
        </Alert>
      </Section>
    );
  }

  if (loading) {
    return (
      <Section>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      </Section>
    );
  }

  if (error) {
    return (
      <Section>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load profile: {error}
        </Alert>
        {error.includes('Authentication') && (
          <Alert severity="info" sx={{ mt: 2 }}>
            You may need to log out and log back in to refresh your authentication.
          </Alert>
        )}
      </Section>
    );
  }

  return (
    <Section>
      <UserProfilePageHeader profile={profile} />

      <SubscriptionAlert />

      {/* Combined Form */}
      <Box component="form" onSubmit={handleSaveAll}>
        {/* Profile Information Section */}
        <Box sx={{ mb: 4 }}>
          <ProfileInfoCard
            formData={formData}
            setFormData={setFormData}
            showButton={false}
          />
        </Box>

        {/* Preferences Section */}
        <Box sx={{ mb: 4 }}>
          <PreferencesCard
            preferences={preferences}
            setPreferences={setPreferences}
            showButton={false}
          />
        </Box>

        {/* Action Buttons */}
        <Box sx={{ mb: 4, display: 'flex', gap: 2, justifyContent: 'flex-start' }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={saving}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              px: 5,
              py: 1.5,
              fontSize: "0.95rem",
              fontWeight: 600,
              borderRadius: 2,
              textTransform: "none",
              "&:hover": {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                transform: "translateY(-1px)"
              },
              "&:active": {
                transform: "translateY(0)"
              },
              "&:disabled": {
                backgroundColor: "#9ca3af",
                background: "none",
                transform: "none"
              },
              transition: "all 0.2s ease"
            }}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Save All Changes'}
          </Button>

          <Button
            variant="contained"
            color="error"
            size="large"
            sx={{
              px: 5,
              py: 1.5,
              fontSize: "0.95rem",
              fontWeight: 600,
              borderRadius: 2,
              textTransform: "none",
              "&:hover": {
                transform: "translateY(-1px)"
              },
              "&:active": {
                transform: "translateY(0)"
              },
              transition: "all 0.2s ease"
            }}
            onClick={() => {
              // TODO: Implement change password functionality
              showNotification('Change Password functionality coming soon!', 'info');
            }}
          >
            Change Password
          </Button>
        </Box>
      </Box>

      <NotificationSnackbar
        notification={notification}
        onClose={hideNotification}
      />
    </Section>
  );
};

export default UserProfilePage;
