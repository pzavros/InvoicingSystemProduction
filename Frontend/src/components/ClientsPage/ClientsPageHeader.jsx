// src/components/ClientsPage/ClientsPageHeader.jsx
import React from "react";
import {
  Box,
  Typography,
  Button,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  Lock as LockIcon
} from "@mui/icons-material";
import UsageIndicator from "../SubscriptionPage/UsageIndicator";
import { useSubscription } from "../../utils/SubscriptionContext";

const ClientsPageHeader = ({ clientsCount, onAddClient }) => {
  const { canCreate, isPremium } = useSubscription();
  const canAddClient = canCreate?.client !== false;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleAddClick = () => {
    if (canAddClient) {
      onAddClient();
    }
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: 2, sm: 3 },
          mb: 3,
          pb: 3,
          borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
        }}
      >
        {/* Left Side - Title and Description */}
        <Box>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 700,
              fontSize: { xs: '1.75rem', sm: '2rem' },
              color: 'rgba(15, 23, 42, 0.95)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              mb: 0.5
            }}
          >
            Clients
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
            Manage your client relationships
          </Typography>
        </Box>

        {/* Right Side - Action Button */}
        <Tooltip 
          title={!canAddClient ? "You've reached the maximum number of clients on the free plan. Upgrade to premium for unlimited clients." : ""}
          arrow
        >
          <span>
            <Button
              variant="contained"
              startIcon={canAddClient ? <AddIcon /> : <LockIcon />}
              onClick={handleAddClick}
              disabled={!canAddClient}
              fullWidth={{ xs: true, sm: false }}
              sx={{ 
                background: canAddClient 
                  ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' 
                  : 'rgba(15, 23, 42, 0.3)',
                color: 'white',
                boxShadow: 'none',
                borderRadius: '8px',
                px: 2.5,
                py: 1,
                fontSize: '0.9375rem',
                fontWeight: 600,
                textTransform: 'none',
                letterSpacing: '-0.01em',
                minWidth: { xs: 'auto', sm: 140 },
                transition: 'all 0.15s ease',
                '&:hover': canAddClient ? { 
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                  boxShadow: 'none',
                } : {},
                '&.Mui-disabled': {
                  color: 'rgba(255, 255, 255, 0.6)',
                  opacity: 1
                }
              }}
            >
              {canAddClient ? 'New Client' : 'Limit Reached'}
            </Button>
          </span>
        </Tooltip>
      </Box>

      {/* Usage Indicator for Free Tier - Below Header */}
      <Box sx={{ mb: 3 }}>
        <UsageIndicator resource="client" label="Clients" />
      </Box>
    </>
  );
};

export default ClientsPageHeader;
