// src/components/UserProfilePage/UserProfilePage.jsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Alert
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
import LoadingOverlay from '../ReusableComponents/LoadingOverlay';

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
        <Box
          sx={{
            p: { xs: 3, md: 4 },
            mb: 3,
            borderRadius: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(15, 23, 42, 0.06)',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
            transition: 'all 0.2s ease'
          }}
        >
          <ProfileInfoCard
            formData={formData}
            setFormData={setFormData}
            showButton={false}
          />
        </Box>

        {/* Preferences Section */}
        <Box
          sx={{
            p: { xs: 3, md: 4 },
            mb: 3,
            borderRadius: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(15, 23, 42, 0.06)',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
            transition: 'all 0.2s ease'
          }}
        >
          <PreferencesCard
            preferences={preferences}
            setPreferences={setPreferences}
            showButton={false}
          />
        </Box>

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
              borderRadius: '10px',
              textTransform: "none",
              boxShadow: '0 1px 3px rgba(139, 92, 246, 0.15), 0 0 0 0.5px rgba(139, 92, 246, 0.1)',
              letterSpacing: '-0.01em',
              border: 'none',
              "&:hover": {
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                boxShadow: '0 2px 6px rgba(139, 92, 246, 0.2), 0 0 0 0.5px rgba(139, 92, 246, 0.15)',
                transform: 'translateY(-1px)'
              },
              "&:active": {
                transform: 'translateY(0px)',
                boxShadow: '0 1px 2px rgba(139, 92, 246, 0.15)'
              },
              "&:disabled": {
                backgroundColor: "rgba(15, 23, 42, 0.08)",
                background: "rgba(15, 23, 42, 0.08)",
                color: 'rgba(15, 23, 42, 0.3)',
                boxShadow: 'none'
              },
              transition: 'all 0.15s ease'
            }}
          >
            {saving ? <CircularProgress size={18} color="inherit" /> : 'Save All Changes'}
          </Button>

          <Button
            variant="outlined"
            sx={{
              px: 3,
              py: 1.25,
              fontSize: "0.875rem",
              fontWeight: 600,
              borderRadius: '10px',
              borderWidth: '1px',
              textTransform: "none",
              borderColor: 'rgba(220, 38, 38, 0.25)',
              color: '#dc2626',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              letterSpacing: '-0.01em',
              boxShadow: '0 1px 2px rgba(220, 38, 38, 0.08)',
              "&:hover": {
                backgroundColor: 'rgba(220, 38, 38, 0.06)',
                borderColor: 'rgba(220, 38, 38, 0.35)',
                borderWidth: '1px',
                boxShadow: '0 2px 4px rgba(220, 38, 38, 0.12)',
                transform: 'translateY(-1px)'
              },
              "&:active": {
                transform: 'translateY(0px)',
                boxShadow: '0 1px 2px rgba(220, 38, 38, 0.08)'
              },
              transition: 'all 0.15s ease'
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
              borderRadius: '10px',
              borderWidth: '1px',
              textTransform: "none",
              borderColor: 'rgba(15, 23, 42, 0.12)',
              color: 'rgba(15, 23, 42, 0.65)',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              letterSpacing: '-0.01em',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
              "&:hover": {
                backgroundColor: 'rgba(15, 23, 42, 0.04)',
                borderColor: 'rgba(15, 23, 42, 0.2)',
                borderWidth: '1px',
                boxShadow: '0 2px 4px rgba(15, 23, 42, 0.08)',
                transform: 'translateY(-1px)'
              },
              "&:active": {
                transform: 'translateY(0px)',
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'
              },
              transition: 'all 0.15s ease'
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
      <LoadingOverlay open={loading || saving} message={saving ? "Saving..." : "Loading profile..."} />
    </>
  );
};

export default UserProfilePage;
