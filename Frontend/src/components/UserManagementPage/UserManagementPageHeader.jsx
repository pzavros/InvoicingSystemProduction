// src/components/UserManagementPage/UserManagementPageHeader.jsx
import React from 'react';
import {
  Box,
  Typography,
  Button
} from '@mui/material';
import {
  PersonAdd,
  People,
  AdminPanelSettings,
  CheckCircle
} from '@mui/icons-material';

const UserManagementPageHeader = ({ 
  totalUsers, 
  adminUsers, 
  activeUsers,
  onAddUser 
}) => {
  const stats = [
    {
      icon: People,
      label: 'Total Users',
      value: totalUsers,
      color: '#667eea',
      bgColor: 'rgba(102, 126, 234, 0.08)'
    },
    {
      icon: CheckCircle,
      label: 'Active Users',
      value: activeUsers,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.08)'
    },
    {
      icon: AdminPanelSettings,
      label: 'Administrators',
      value: adminUsers,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.08)'
    }
  ];
  
  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        mb: 4
      }}>
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              fontSize: { xs: '1.75rem', sm: '2rem' },
              color: 'rgba(15, 23, 42, 0.95)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              mb: 0.5
            }}
          >
            Users
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(15, 23, 42, 0.5)',
              fontSize: '0.9375rem',
              fontWeight: 400,
              letterSpacing: '-0.01em'
            }}
          >
            Manage system users and permissions
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={onAddUser}
          sx={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: 'white',
            boxShadow: 'none',
            borderRadius: '8px',
            px: 2.5,
            py: 1,
            fontSize: '0.9375rem',
            fontWeight: 600,
            textTransform: 'none',
            letterSpacing: '-0.01em',
            transition: 'all 0.15s ease',
            '&:hover': { 
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              boxShadow: 'none',
            }
          }}
        >
          Add User
        </Button>
      </Box>

      {/* Stats Grid */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
        gap: 2,
        mb: 4
      }}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Box
              key={index}
              sx={{
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid rgba(15, 23, 42, 0.08)',
                p: 3,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                  transform: 'translateY(-2px)',
                  borderColor: 'rgba(15, 23, 42, 0.12)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    backgroundColor: stat.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: stat.color
                  }}
                >
                  <Icon sx={{ fontSize: '1.5rem' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700,
                      fontSize: '1.875rem',
                      color: 'rgba(15, 23, 42, 0.95)',
                      letterSpacing: '-0.02em',
                      lineHeight: 1,
                      mb: 0.5
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'rgba(15, 23, 42, 0.5)',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      letterSpacing: '-0.01em'
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default UserManagementPageHeader;
