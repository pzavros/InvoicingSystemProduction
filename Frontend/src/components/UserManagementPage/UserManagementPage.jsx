// src/components/UserManagementPage/UserManagementPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Section from "../ReusableComponents/Section";
import UserManagementPageHeader from "./UserManagementPageHeader";
import UsersDataGrid from "./UsersDataGrid";
import NotificationSnackbar from "./NotificationSnackbar";
import useUsersData from "./useUsersData";
import useNotification from "./useNotification";
import { Box, Alert, CircularProgress } from "@mui/material";

const UserManagementPage = () => {
  const navigate = useNavigate();
  const { users, loading, error, refreshData } = useUsersData();
  const { notification, showNotification, hideNotification } = useNotification();

  const handleAddUser = () => {
    // Navigate to user registration/add page
    navigate('/users/add');
  };

  const handleEditUser = (user) => {
    // Navigate to user edit page
    navigate(`/users/edit/${user.id}`);
  };

  const handleUserUpdated = async () => {
    try {
      await refreshData();
      showNotification("User updated successfully!", "success");
    } catch (error) {
      showNotification(error.message, "error");
    }
  };

  // Calculate statistics
  const totalUsers = users.length;
  const adminUsers = users.filter(user => user.isAdmin).length;
  const activeUsers = users.filter(user => user.isActive).length;

  if (error) {
    return (
      <Section>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load users: {error}
        </Alert>
      </Section>
    );
  }

  return (
    <Section>
      <UserManagementPageHeader 
        totalUsers={totalUsers}
        adminUsers={adminUsers}
        activeUsers={activeUsers}
        onAddUser={handleAddUser}
      />

      <UsersDataGrid
        users={users}
        loading={loading}
        onEditUser={handleEditUser}
        onReloadUsers={refreshData}
        onNotification={showNotification}
      />

      <NotificationSnackbar
        notification={notification}
        onClose={hideNotification}
      />
    </Section>
  );
};

export default UserManagementPage;
