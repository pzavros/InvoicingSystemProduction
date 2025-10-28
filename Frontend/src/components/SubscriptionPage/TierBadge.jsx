import React from 'react';
import { Chip, Box, Tooltip } from '@mui/material';
import { Star, Lock } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../utils/SubscriptionContext';

const TierBadge = ({ showUpgradeButton = false }) => {
  const navigate = useNavigate();
  const { isPremium, loading } = useSubscription();

  if (loading) {
    return null;
  }

  if (isPremium) {
    return (
      <Tooltip title="You have unlimited access to all features">
        <Chip
          icon={<Star sx={{ color: 'white !important' }} />}
          label="Premium"
          size="small"
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 'bold',
            '& .MuiChip-icon': {
              color: 'white',
            }
          }}
        />
      </Tooltip>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Tooltip title="You are on the free tier with limited features">
        <Chip
          icon={<Lock sx={{ fontSize: 16 }} />}
          label="Free Tier"
          size="small"
          color="default"
          variant="outlined"
        />
      </Tooltip>
      {showUpgradeButton && (
        <Chip
          label="Upgrade"
          size="small"
          onClick={() => navigate('/subscription')}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
            }
          }}
        />
      )}
    </Box>
  );
};

export default TierBadge;
