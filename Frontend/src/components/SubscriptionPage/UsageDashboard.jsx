import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Button,
  Chip,
  Grid,
  Alert,
} from '@mui/material';
import {
  Star,
  TrendingUp,
  People,
  Category,
  Inventory,
  Receipt,
  Description,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../utils/SubscriptionContext';

const UsageItem = ({ icon: Icon, label, current, max, color = 'primary' }) => {
  const percentage = max === Infinity ? 0 : (current / max) * 100;
  const isLimitReached = current >= max && max !== Infinity;
  
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Icon sx={{ mr: 1, color: `${color}.main`, fontSize: 20 }} />
        <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 500 }}>
          {label}
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 'bold',
            color: isLimitReached ? 'error.main' : 'text.secondary'
          }}
        >
          {current} / {max === Infinity ? '∞' : max}
        </Typography>
      </Box>
      {max !== Infinity && (
        <LinearProgress 
          variant="determinate" 
          value={Math.min(percentage, 100)} 
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: `${color}.50`,
            '& .MuiLinearProgress-bar': {
              backgroundColor: isLimitReached ? 'error.main' : `${color}.main`,
              borderRadius: 4,
            }
          }}
        />
      )}
    </Box>
  );
};

const UsageDashboard = ({ compact = false }) => {
  const navigate = useNavigate();
  const { usageStats, isPremium, tier, loading } = useSubscription();

  if (loading || !usageStats) {
    return null;
  }

  // Premium users don't need to see usage limits
  if (isPremium) {
    return compact ? null : (
      <Card elevation={2} sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <CardContent sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Star sx={{ color: 'white', mr: 1 }} />
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                Premium Plan
              </Typography>
            </Box>
            <Chip 
              label="Unlimited" 
              size="small" 
              sx={{ 
                backgroundColor: 'rgba(255,255,255,0.3)', 
                color: 'white',
                fontWeight: 'bold'
              }} 
            />
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Compact version for sidebar or small spaces
  if (compact) {
    const hasLimitsReached = !usageStats.canCreateClient || 
                            !usageStats.canCreateCategory || 
                            !usageStats.canCreateProduct || 
                            !usageStats.canCreateInvoice;
    
    return (
      <Alert 
        severity={hasLimitsReached ? "warning" : "info"} 
        sx={{ mb: 2 }}
        action={
          <Button 
            size="small" 
            onClick={() => navigate('/subscription')}
            sx={{ color: 'inherit', fontWeight: 'bold' }}
          >
            Upgrade
          </Button>
        }
      >
        <Typography variant="caption" display="block">
          <strong>Free Tier</strong> - {usageStats.invoicesThisMonth}/{usageStats.maxInvoicesPerMonth} invoices this month
        </Typography>
      </Alert>
    );
  }

  // Full dashboard
  const nextResetDate = usageStats.nextResetDate ? new Date(usageStats.nextResetDate).toLocaleDateString() : 'N/A';
  
  return (
    <Card elevation={3} sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Your Usage
            </Typography>
            <Chip 
              label="Free Tier" 
              size="small" 
              color="default"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
          <Button
            variant="contained"
            startIcon={<TrendingUp />}
            onClick={() => navigate('/subscription')}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
              }
            }}
          >
            Upgrade to Premium
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <UsageItem
              icon={People}
              label="Clients"
              current={usageStats.clientsCount}
              max={usageStats.maxClients}
              color="primary"
            />
            <UsageItem
              icon={Category}
              label="Categories"
              current={usageStats.categoriesCount}
              max={usageStats.maxCategories}
              color="secondary"
            />
            <UsageItem
              icon={Inventory}
              label="Products"
              current={usageStats.productsCount}
              max={usageStats.maxProducts}
              color="success"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <UsageItem
              icon={Receipt}
              label="Invoices (This Month)"
              current={usageStats.invoicesThisMonth}
              max={usageStats.maxInvoicesPerMonth}
              color="warning"
            />
            <UsageItem
              icon={Description}
              label="Templates"
              current={usageStats.templatesCount}
              max={usageStats.maxTemplates}
              color="error"
            />
            
            {usageStats.maxInvoicesPerMonth !== Infinity && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="caption">
                  Invoice quota resets on: <strong>{nextResetDate}</strong>
                </Typography>
              </Alert>
            )}
          </Grid>
        </Grid>

        {!usageStats.canCreateTemplate && (
          <Alert severity="warning" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Template creation</strong> is a premium-only feature. Upgrade to create custom invoice templates.
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default UsageDashboard;
