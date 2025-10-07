// src/components/ClientsPage/NotificationSnackbar.jsx
import React from "react";
import {
  Snackbar,
  Alert
} from "@mui/material";

const NotificationSnackbar = ({ notification, onClose }) => {
  return (
    <Snackbar
      open={notification.open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      sx={{
        '& .MuiSnackbarContent-root': {
          borderRadius: 2,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
        }
      }}
    >
      <Alert
        onClose={onClose}
        severity={notification.severity}
        sx={{ 
          width: "100%",
          borderRadius: 2,
          fontWeight: 500,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          ...(notification.severity === 'success' && {
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: '#059669',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            '& .MuiAlert-icon': {
              color: '#059669'
            }
          }),
          ...(notification.severity === 'error' && {
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#dc2626',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            '& .MuiAlert-icon': {
              color: '#dc2626'
            }
          })
        }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationSnackbar;
