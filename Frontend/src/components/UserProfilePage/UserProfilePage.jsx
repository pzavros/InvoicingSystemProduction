// src/components/UserProfilePage/UserProfilePage.jsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import { useAuth } from '../../utils/AuthContext';
import UserProfilePageHeader from './UserProfilePageHeader';
import ProfileInfoCard from './ProfileInfoCard';
import PreferencesCard from './PreferencesCard';
import SubscriptionAlert from './SubscriptionAlert';
import NotificationSnackbar from './NotificationSnackbar';
import ChangePasswordDialog from './ChangePasswordDialog';
import useProfileData from './useProfileData';
import useNotification from './useNotification';

const UserProfilePage = () => {
  const [saving, setSaving] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
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
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!authenticated || !user) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        You must be logged in to view your profile. Please log in and try again.
      </Alert>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load profile: {error}
        </Alert>
        {error.includes('Authentication') && (
          <Alert severity="info" sx={{ mt: 2 }}>
            You may need to log out and log back in to refresh your authentication.
          </Alert>
        )}
      </>
    );
  }

  return (
    <>
      <UserProfilePageHeader profile={profile} />

      <SubscriptionAlert />

      {/* Combined Form */}
      <Box component="form" onSubmit={handleSaveAll}>
        {/* Profile Information Section */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: '12px',
            backgroundColor: 'white',
            border: '1px solid rgba(15, 23, 42, 0.08)',
          }}
        >
          <ProfileInfoCard
            formData={formData}
            setFormData={setFormData}
            showButton={false}
          />
        </Paper>

        {/* Preferences Section */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: '12px',
            backgroundColor: 'white',
            border: '1px solid rgba(15, 23, 42, 0.08)',
          }}
        >
          <PreferencesCard
            preferences={preferences}
            setPreferences={setPreferences}
            showButton={false}
          />
        </Paper>

        {/* Action Buttons */}
        <Box sx={{ mb: 4, display: 'flex', gap: 2, justifyContent: 'flex-start', flexWrap: 'wrap' }}>
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            sx={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              px: 3,
              py: 1.25,
              fontSize: "0.875rem",
              fontWeight: 600,
              borderRadius: '8px',
              textTransform: "none",
              boxShadow: 'none',
              "&:hover": {
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                boxShadow: 'none'
              },
              "&:disabled": {
                backgroundColor: "rgba(15, 23, 42, 0.12)",
                background: "none",
                color: 'rgba(15, 23, 42, 0.4)'
              }
            }}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Save All Changes'}
          </Button>

          <Button
            variant="outlined"
            sx={{
              px: 3,
              py: 1.25,
              fontSize: "0.875rem",
              fontWeight: 600,
              borderRadius: '8px',
              textTransform: "none",
              borderColor: '#dc2626',
              color: '#dc2626',
              "&:hover": {
                backgroundColor: 'rgba(220, 38, 38, 0.04)',
                borderColor: '#dc2626'
              }
            }}
            onClick={() => setPasswordDialogOpen(true)}
          >
            Change Password
          </Button>

          <Button
            variant="outlined"
            sx={{
              px: 3,
              py: 1.25,
              fontSize: "0.875rem",
              fontWeight: 600,
              borderRadius: '8px',
              textTransform: "none",
              borderColor: 'rgba(15, 23, 42, 0.2)',
              color: 'rgba(15, 23, 42, 0.7)',
              "&:hover": {
                backgroundColor: 'rgba(15, 23, 42, 0.04)',
                borderColor: 'rgba(15, 23, 42, 0.3)'
              }
            }}
            onClick={() => {
              // TODO: Implement change email functionality
              showNotification('Change Email functionality coming soon!', 'info');
            }}
          >
            Change Email
          </Button>
        </Box>
      </Box>

      <NotificationSnackbar
        notification={notification}
        onClose={hideNotification}
      />

      <ChangePasswordDialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        onChangePassword={changePassword}
        showNotification={showNotification}
      />
    </>
  );
};

export default UserProfilePage;
