// src/components/ClientsPage/ClientsPageHeader.jsx
import React from "react";
import {
  Box,
  Typography,
  Button
} from "@mui/material";
import {
  Add as AddIcon,
  People as PeopleIcon
} from "@mui/icons-material";

const ClientsPageHeader = ({ clientsCount, onAddClient }) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4,
        p: 3,
        borderRadius: 3,
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid rgba(16, 185, 129, 0.1)',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.08)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #10b981 0%, #3b82f6 50%, #8b5cf6 100%)',
          borderRadius: '3px 3px 0 0'
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)'
          }}
        >
          <PeopleIcon sx={{ color: 'white', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography 
            variant="h5" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5
            }}
          >
            Client & Contact Management
          </Typography>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              color: 'text.secondary',
              fontWeight: 'medium'
            }}
          >
            Manage your clients, contacts, and customer relationships
          </Typography>
        </Box>
      </Box>
      
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onAddClient}
        sx={{ 
          backgroundColor: '#10b981', 
          backgroundImage: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)',
          border: 'none',
          borderRadius: 2,
          px: 3,
          py: 1.5,
          fontWeight: 600,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': { 
            backgroundColor: '#059669',
            backgroundImage: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 24px rgba(16, 185, 129, 0.4)'
          } 
        }}
      >
        Add Client
      </Button>
    </Box>
  );
};

export default ClientsPageHeader;
