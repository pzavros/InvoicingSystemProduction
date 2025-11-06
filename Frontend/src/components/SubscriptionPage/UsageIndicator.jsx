// src/components/SubscriptionPage/UsageIndicator.jsx
import React from 'react';
import { Box, Typography, LinearProgress, Chip, Tooltip, IconButton } from '@mui/material';
import { Info as InfoIcon, Star as StarIcon } from '@mui/icons-material';
import { useSubscription } from '../../utils/SubscriptionContext';
import { useNavigate } from 'react-router-dom';

/**
 * Compact usage indicator for resource limits
 * @param {string} resource - Type of resource: 'client', 'category', 'product', 'invoice', 'template'
 * @param {string} label - Display label (e.g., "Clients", "Products")
 */
const UsageIndicator = ({ resource, label }) => {
  const navigate = useNavigate();
  const { usageStats, isPremium, loading } = useSubscription();

  if (loading || !usageStats) {
    return null;
  }

  // Don't show for premium users
  if (isPremium) {
    return null;
  }

  // Get usage data based on resource type
  let current = 0;
  let max = 0;
  let resetInfo = '';

  switch (resource) {
    case 'client':
      current = usageStats.clientsCount || 0;
      max = usageStats.limits?.maxClients || 1;
      break;
    case 'category':
      current = usageStats.categoriesCount || 0;
      max = usageStats.limits?.maxCategories || 1;
      break;
    case 'product':
      current = usageStats.productsCount || 0;
      max = usageStats.limits?.maxProducts || 1;
      break;
    case 'invoice':
      current = usageStats.invoicesThisMonth || 0;
      max = usageStats.limits?.maxInvoicesPerMonth || 3;
      resetInfo = usageStats.invoiceQuotaResetDate 
        ? `Resets ${new Date(usageStats.invoiceQuotaResetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        : 'Resets monthly';
      break;
    case 'template':
      current = usageStats.templatesCount || 0;
      max = usageStats.limits?.maxTemplates || 0;
      break;
    default:
      return null;
  }

  const percentage = max > 0 ? (current / max) * 100 : 0;
  const isAtLimit = current >= max;
  const isNearLimit = percentage >= 80 && !isAtLimit;

  // Color based on usage
  const getColor = () => {
    if (isAtLimit) return '#dc2626'; // Red
    if (isNearLimit) return '#f59e0b'; // Orange
    return '#10b981'; // Green
  };

  const color = getColor();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2.5,
        py: 2,
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        minWidth: { xs: '100%', sm: 280 },
        maxWidth: { xs: '100%', sm: 350 },
        transition: 'all 0.15s ease',
        '&:hover': {
          borderColor: 'rgba(139, 92, 246, 0.3)',
          boxShadow: '0 12px 40px rgba(139, 92, 246, 0.12)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 600, 
              color: 'rgba(15, 23, 42, 0.9)', 
              fontSize: '0.875rem',
              letterSpacing: '-0.01em'
            }}
          >
            {label}
          </Typography>
          <Chip
            label="FREE"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.6875rem',
              fontWeight: 600,
              backgroundColor: 'rgba(139, 92, 246, 0.08)',
              color: '#8b5cf6',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              '& .MuiChip-label': { px: 1, py: 0 }
            }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: isAtLimit ? '#dc2626' : isNearLimit ? '#d97706' : 'rgba(15, 23, 42, 0.7)', 
              fontWeight: 600, 
              fontSize: '0.8125rem',
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {current} / {max}
          </Typography>
          {resetInfo && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(15, 23, 42, 0.5)', 
                fontSize: '0.75rem',
                fontWeight: 400
              }}
            >
              {resetInfo}
            </Typography>
          )}
        </Box>

        <LinearProgress
          variant="determinate"
          value={Math.min(percentage, 100)}
          sx={{
            height: 4,
            borderRadius: '2px',
            backgroundColor: 'rgba(15, 23, 42, 0.08)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: isAtLimit ? '#dc2626' : isNearLimit ? '#d97706' : '#8b5cf6',
              borderRadius: '2px'
            }
          }}
        />
      </Box>

      <Tooltip title="Upgrade to Premium for unlimited access" arrow>
        <IconButton
          size="small"
          onClick={() => navigate('/subscription')}
          sx={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            backgroundColor: 'rgba(139, 92, 246, 0.08)',
            color: '#8b5cf6',
            '&:hover': {
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
            },
            transition: 'all 0.15s ease'
          }}
        >
          <StarIcon sx={{ fontSize: '1.125rem' }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default UsageIndicator;
