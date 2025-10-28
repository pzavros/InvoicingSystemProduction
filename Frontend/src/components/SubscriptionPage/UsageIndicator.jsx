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
        gap: 1.5,
        px: 2,
        py: 1.5,
        borderRadius: 2,
        background: `linear-gradient(135deg, ${color}08 0%, ${color}15 100%)`,
        border: `1px solid ${color}30`,
        minWidth: { xs: '100%', sm: 280 },
        maxWidth: { xs: '100%', sm: 350 }
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.8125rem' }}>
            {label}
          </Typography>
          <Chip
            label="FREE"
            size="small"
            sx={{
              height: 18,
              fontSize: '0.625rem',
              fontWeight: 700,
              backgroundColor: color,
              color: 'white',
              '& .MuiChip-label': { px: 0.75, py: 0 }
            }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography variant="caption" sx={{ color: color, fontWeight: 700, fontSize: '0.75rem' }}>
            {current} / {max}
          </Typography>
          {resetInfo && (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
              {resetInfo}
            </Typography>
          )}
        </Box>

        <LinearProgress
          variant="determinate"
          value={Math.min(percentage, 100)}
          sx={{
            height: 6,
            borderRadius: 1,
            backgroundColor: `${color}20`,
            '& .MuiLinearProgress-bar': {
              backgroundColor: color,
              borderRadius: 1
            }
          }}
        />
      </Box>

      <Tooltip title="Upgrade to Premium for unlimited access" arrow>
        <IconButton
          size="small"
          onClick={() => navigate('/subscription')}
          sx={{
            width: 32,
            height: 32,
            backgroundColor: `${color}15`,
            color: color,
            '&:hover': {
              backgroundColor: `${color}25`,
              transform: 'scale(1.1)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <StarIcon sx={{ fontSize: '1rem' }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default UsageIndicator;
