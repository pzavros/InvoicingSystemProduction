import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  Box,
  Fade,
  Grow,
  Stack,
} from '@mui/material';
import {
  CheckCircle,
  Schedule,
  Warning,
  Cancel,
  Payment,
  History,
  Star,
  CreditCard,
} from '@mui/icons-material';
import Page from '../ReusableComponents/Page';
import Section from '../ReusableComponents/Section';
import { subscriptionAPI } from './subscriptionAPI';
import { useSubscription } from '../../utils/SubscriptionContext';
import PaymentDialog from './PaymentDialog';
import UsageDashboard from './UsageDashboard';

const SubscriptionPage = () => {
  const { subscriptionStatus, loading: subscriptionLoading, refreshStatus } = useSubscription();
  const [payments, setPayments] = useState([]);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [isTrialMode, setIsTrialMode] = useState(false); // Track if opening dialog for trial

  useEffect(() => {
    fetchSubscriptionData();
    
    // Check if returning from Stripe payment
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('payment_success');
    
    if (paymentSuccess === 'true') {
      setSuccess('Payment successful! Your subscription has been activated. Welcome to Premium! 🎉');
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
      // Refresh subscription status
      setTimeout(() => {
        refreshStatus();
        fetchSubscriptionData();
      }, 2000);
    }
  }, []);

    const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      const [paymentsResponse, subscriptionResponse] = await Promise.all([
        subscriptionAPI.getPayments(),
        subscriptionAPI.getSubscription()
      ]);
      setPayments(paymentsResponse.data);
      // Handle null subscription for new users who haven't started trial yet
      setSubscriptionDetails(subscriptionResponse.data || null);
    } catch (error) {
      console.error('Error fetching payment data:', error);
      // Don't show error for new users without subscription
      if (error.response?.status !== 404) {
        setError('Failed to load payment data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrial = () => {
    setIsTrialMode(true);
    setPaymentDialogOpen(true);
  };

  const handleUpgradeToPremium = () => {
    setIsTrialMode(false);
    setPaymentDialogOpen(true);
  };

  const handleCancelSubscription = async () => {
    try {
      setActionLoading(true);
      await subscriptionAPI.cancelSubscription();
      setSuccess('Subscription cancelled successfully');
      setCancelDialogOpen(false);
      // Refresh subscription status from context
      await refreshStatus();
      await fetchSubscriptionData();
      
      // Reload page after 1.5 seconds to ensure all state is refreshed
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      setError(error.response?.data?.message || 'Failed to cancel subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusChip = (status, isTrialActive, isActive) => {
    let customStyles = {};
    let label = status;
    let icon = null;

    if (isTrialActive) {
      label = 'Trial Active';
      icon = <Star />;
      customStyles = {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        color: '#059669',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        fontWeight: 600
      };
    } else if (isActive) {
      label = 'Active';
      icon = <CheckCircle />;
      customStyles = {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        color: '#059669',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        fontWeight: 600
      };
    } else {
      switch (status) {
        case 'Trial':
          icon = <Schedule />;
          customStyles = {
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            color: '#2563eb',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            fontWeight: 600
          };
          break;
        case 'Expired':
          icon = <Warning />;
          customStyles = {
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#dc2626',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            fontWeight: 600
          };
          break;
        case 'Cancelled':
          icon = <Cancel />;
          customStyles = {
            backgroundColor: 'rgba(107, 114, 128, 0.1)',
            color: '#4b5563',
            border: '1px solid rgba(107, 114, 128, 0.2)',
            fontWeight: 600
          };
          break;
        default:
          customStyles = {
            backgroundColor: 'rgba(107, 114, 128, 0.1)',
            color: '#4b5563',
            border: '1px solid rgba(107, 114, 128, 0.2)',
            fontWeight: 600
          };
      }
    }

    return (
      <Chip 
        icon={icon} 
        label={label} 
        sx={{
          ...customStyles,
          borderRadius: 2,
          fontSize: '0.75rem',
          minWidth: '100px',
          '& .MuiChip-label': {
            px: 1.5,
            py: 0.5
          },
          '& .MuiChip-icon': {
            color: 'inherit'
          }
        }}
      />
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading || subscriptionLoading) {
    return (
      <Page>
        <Section>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress size={60} sx={{ color: 'var(--color-primary)' }} />
          </Box>
        </Section>
      </Page>
    );
  }

  // For freemium model, we show fixed pricing
  const monthlyPrice = parseFloat(import.meta.env.VITE_SUBSCRIPTION_MONTHLY_PRICE || '13.99');
  const currentTier = subscriptionStatus?.tier || 'free';
  const isPremium = subscriptionStatus?.isPremium || false;
  
  // Check if subscription has actually expired (end date in the past)
  const hasExpired = subscriptionDetails?.endDate && new Date(subscriptionDetails.endDate) < new Date();
  
  // Check if cancellation warning should be shown (cancelled but still has future access)
  const showCancellationWarning = isPremium && 
    subscriptionDetails?.cancelAtPeriodEnd && 
    !hasExpired &&
    subscriptionDetails?.daysRemainingAfterCancellation > 0;

  return (
    <Page>
      <Section>
        <Fade in={true} timeout={800}>
          <Box>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', md: 'center' },
                gap: 3,
                mb: 4,
                p: 4,
                borderRadius: 3,
                background: 'linear-gradient(145deg, #ffffff 0%, #faf5ff 100%)',
                border: '2px solid rgba(139, 92, 246, 0.25)',
                boxShadow: '0 8px 24px rgba(139, 92, 246, 0.15)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: '0 12px 32px rgba(139, 92, 246, 0.2)',
                  border: '2px solid rgba(139, 92, 246, 0.35)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '6px',
                  background: 'linear-gradient(90deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%)',
                  borderRadius: '3px 3px 0 0'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 260 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '18px',
                    background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 12px 24px rgba(20, 184, 166, 0.4)',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05) rotate(2deg)'
                    }
                  }}
                >
                  <CreditCard sx={{ color: 'white', fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 0.5,
                      letterSpacing: '-0.5px'
                    }}
                  >
                    Subscription Management
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 500
                    }}
                  >
                    Monitor your plan, manage billing, and unlock unlimited potential.
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: { xs: 'flex-start', md: 'center' },
                  gap: { xs: 1.5, md: 3 },
                  minWidth: { xs: '100%', md: 'auto' }
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#7c3aed' }}>
                    Current Plan
                  </Typography>
                  <Chip
                    label={isPremium ? 'Premium' : 'Free'}
                    icon={isPremium ? <Star /> : null}
                    sx={{
                      backgroundColor: isPremium ? 'rgba(16, 185, 129, 0.12)' : 'rgba(107, 114, 128, 0.12)',
                      color: isPremium ? '#059669' : '#4b5563',
                      border: isPremium ? '2px solid rgba(16, 185, 129, 0.3)' : '2px solid rgba(107, 114, 128, 0.3)',
                      fontWeight: 700,
                      borderRadius: 2,
                      fontSize: '0.8rem',
                      minWidth: '110px',
                      height: '32px',
                      '& .MuiChip-label': {
                        px: 2,
                        py: 0.5
                      },
                      '& .MuiChip-icon': {
                        color: 'inherit',
                        fontSize: '1.1rem'
                      }
                    }}
                  />
                </Stack>
                <Stack spacing={0.5}>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {isPremium ? `€${monthlyPrice.toFixed(2)} per month` : 'Free plan with limited features'}
                  </Typography>
                  {!isPremium && (
                    <Typography variant="body2" sx={{ color: '#8b5cf6', fontWeight: 700 }}>
                      ✨ Upgrade to unlock unlimited access
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
                  {success}
                </Alert>
              )}

              {/* Cancellation pending alert */}
              {showCancellationWarning && (
                <Alert 
                  severity="warning" 
                  sx={{ 
                    mb: 3,
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(251, 191, 36, 0.08) 100%)',
                    border: '2px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      color: '#f59e0b'
                    }
                  }}
                  icon={<Warning />}
                >
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#b45309', mb: 1 }}>
                    ⚠️ Subscription Cancelled - Access Until {subscriptionDetails.endDate && new Date(subscriptionDetails.endDate).getFullYear() > 1970 
                      ? new Date(subscriptionDetails.endDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })
                      : 'End of Period'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    You've cancelled your subscription. You'll continue to have Premium access for {subscriptionDetails.daysRemainingAfterCancellation} more day{subscriptionDetails.daysRemainingAfterCancellation !== 1 ? 's' : ''}, until the end of your current billing period. After that, you'll be downgraded to the Free plan.
                  </Typography>
                </Alert>
              )}

              {/* Trial offer for new users */}
              {!isPremium && !subscriptionDetails && (
                <Alert 
                  severity="info" 
                  sx={{ 
                    mb: 3,
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
                    border: '2px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      color: '#8b5cf6'
                    }
                  }}
                  icon={<Star />}
                >
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#6d28d9', mb: 1 }}>
                    🎉 Welcome! Start Your Free Trial
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Get 7 days of full Premium access with unlimited invoices, clients, and all features. No credit card required!
                  </Typography>
                </Alert>
              )}

              {/* Usage Dashboard for Free users */}
              {!isPremium && (
                <Box sx={{ mb: 4 }}>
                  <UsageDashboard mode="full" />
                </Box>
              )}

              <Box
                sx={{
                  display: 'grid',
                  gap: 3,
                  gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
                  mb: 4
                }}
              >
                {/* Subscription Status Card */}
                <Grow in={true} timeout={600}>
                  <Paper
                    elevation={6}
                    sx={{
                      p: 4,
                      borderRadius: 3,
                      background: 'linear-gradient(145deg, #ffffff 0%, #faf5ff 100%)',
                      border: '2px solid rgba(139, 92, 246, 0.2)',
                      backdropFilter: 'blur(10px)',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 16px 32px rgba(139, 92, 246, 0.2)',
                        border: '2px solid rgba(139, 92, 246, 0.35)',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)',
                      }
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#7c3aed' }}>
                        Current Plan Status
                      </Typography>
                      <Chip
                        label={isPremium ? 'Premium' : 'Free'}
                        icon={isPremium ? <Star /> : null}
                        sx={{
                          backgroundColor: isPremium ? 'rgba(16, 185, 129, 0.12)' : 'rgba(107, 114, 128, 0.12)',
                          color: isPremium ? '#059669' : '#4b5563',
                          border: isPremium ? '2px solid rgba(16, 185, 129, 0.3)' : '2px solid rgba(107, 114, 128, 0.3)',
                          fontWeight: 700,
                          borderRadius: 2,
                          height: '36px',
                          fontSize: '0.85rem',
                          '& .MuiChip-icon': {
                            color: 'inherit',
                            fontSize: '1.2rem'
                          }
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        display: 'grid',
                        gap: 2,
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }
                      }}
                    >
                      <Box
                        sx={{
                          p: 2.5,
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
                          border: '1px solid rgba(139, 92, 246, 0.2)'
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                          Plan Type
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#7c3aed' }}>
                          {isPremium ? '✨ Premium' : '🆓 Free Tier'}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          p: 2.5,
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
                          border: '1px solid rgba(139, 92, 246, 0.2)'
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                          Monthly Cost
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: isPremium ? '#059669' : '#6b7280' }}>
                          {isPremium ? `€${monthlyPrice.toFixed(2)}` : '€0.00'}
                        </Typography>
                      </Box>

                      {isPremium && subscriptionDetails?.endDate && (
                        <Box
                          sx={{
                            p: 2.5,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
                            border: '1px solid rgba(139, 92, 246, 0.2)',
                            gridColumn: { xs: '1', sm: '1 / -1', md: 'auto' }
                          }}
                        >
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                            {subscriptionDetails.monthlyPrice === 0 ? 'Premium Until' : 'Renews On'}
                          </Typography>
                          {(() => {
                            const endDate = new Date(subscriptionDetails.endDate);
                            const year = endDate.getFullYear();
                            
                            // If date is invalid or before year 2000, show a fallback message
                            if (isNaN(endDate.getTime()) || year < 2000) {
                              return (
                                <>
                                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#7c3aed' }}>
                                    Active
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                    Subscription is active
                                  </Typography>
                                </>
                              );
                            }
                            
                            const daysLeft = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
                            
                            return (
                              <>
                                <Typography variant="h5" sx={{ fontWeight: 800, color: '#7c3aed' }}>
                                  {endDate.toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                  {daysLeft < 0 ? 'Expired' : 
                                   daysLeft === 0 ? 'Expires today' : 
                                   daysLeft === 1 ? '1 day remaining' : 
                                   `${daysLeft} days remaining`}
                                </Typography>
                              </>
                            );
                          })()}
                        </Box>
                      )}
                    </Box>

                    <Stack mt={3} direction="row" spacing={2} flexWrap="wrap">
                      {/* Show Start Trial button for new users with no subscription */}
                      {!isPremium && !subscriptionDetails && (
                        <Button
                          variant="contained"
                          onClick={handleStartTrial}
                          disabled={actionLoading}
                          startIcon={<Star />}
                          size="large"
                          sx={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            boxShadow: '0 6px 16px rgba(16, 185, 129, 0.35)',
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 4,
                            py: 1.5,
                            fontSize: '1rem',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.45)',
                              transform: 'translateY(-2px)',
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          Start 7-Day Free Trial
                        </Button>
                      )}

                      {/* Show Upgrade button for free users who have had a trial */}
                      {!isPremium && subscriptionDetails && (
                        <Button
                          variant="contained"
                          onClick={handleUpgradeToPremium}
                          disabled={actionLoading}
                          startIcon={<Star />}
                          size="large"
                          sx={{
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                            boxShadow: '0 6px 16px rgba(139, 92, 246, 0.35)',
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 4,
                            py: 1.5,
                            fontSize: '1rem',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
                              boxShadow: '0 8px 20px rgba(139, 92, 246, 0.45)',
                              transform: 'translateY(-2px)',
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          Upgrade to Premium
                        </Button>
                      )}

                      {isPremium && !subscriptionDetails?.cancelAtPeriodEnd && (
                        <Button
                          variant="outlined"
                          onClick={() => setCancelDialogOpen(true)}
                          disabled={actionLoading}
                          startIcon={<Cancel />}
                          size="large"
                          sx={{
                            borderColor: '#dc2626',
                            borderWidth: '2px',
                            color: '#dc2626',
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 4,
                            py: 1.5,
                            '&:hover': {
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              borderColor: '#dc2626',
                              borderWidth: '2px',
                              transform: 'translateY(-2px)',
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          Cancel Subscription
                        </Button>
                      )}

                      {isPremium && subscriptionDetails?.cancelAtPeriodEnd && subscriptionDetails.endDate && new Date(subscriptionDetails.endDate).getFullYear() > 1970 && (
                        <Chip
                          label={`Cancels on ${new Date(subscriptionDetails.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                          icon={<Schedule />}
                          sx={{
                            backgroundColor: 'rgba(245, 158, 11, 0.12)',
                            color: '#b45309',
                            border: '2px solid rgba(245, 158, 11, 0.3)',
                            fontWeight: 700,
                            borderRadius: 2,
                            height: '42px',
                            fontSize: '0.9rem',
                            px: 2,
                            '& .MuiChip-icon': {
                              color: 'inherit',
                              fontSize: '1.2rem'
                            }
                          }}
                        />
                      )}
                    </Stack>
                      </Paper>
                    </Grow>

                {/* Pricing Info Card */}
                <Grow in={true} timeout={800}>
                  <Paper
                    elevation={4}
                    sx={{
                      p: 4,
                      borderRadius: 3,
                      background: 'linear-gradient(145deg, #ffffff 0%, #faf5ff 100%)',
                      border: '2px solid rgba(139, 92, 246, 0.3)',
                      backdropFilter: 'blur(10px)',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 20px 40px rgba(139, 92, 246, 0.25)',
                        border: '2px solid rgba(139, 92, 246, 0.5)',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '6px',
                        background: 'linear-gradient(90deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%)',
                      }
                    }}
                  >
                    {/* Premium Badge */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#6d28d9' }}>
                        Premium Plan
                      </Typography>
                      <Chip
                        icon={<Star sx={{ fontSize: '1rem' }} />}
                        label="POPULAR"
                        size="small"
                        sx={{
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          letterSpacing: '0.5px',
                          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)'
                        }}
                      />
                    </Box>

                    {/* Price Display */}
                    <Box 
                      textAlign="center" 
                      py={3}
                      sx={{
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
                        borderRadius: 2,
                        mb: 3
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 0.5 }}>
                        <Typography 
                          variant="h2" 
                          sx={{ 
                            fontWeight: 'bold', 
                            background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                        >
                          €{monthlyPrice}
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, mt: 0.5 }}>
                        per month · billed monthly
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#8b5cf6', fontWeight: 600, display: 'block', mt: 1 }}>
                        Cancel anytime, no commitment
                      </Typography>
                    </Box>

                    {/* Features List */}
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700, color: '#6d28d9', mb: 2 }}>
                      Everything you need to grow:
                    </Typography>
                    <Stack spacing={1.5}>
                      {[
                        { icon: '∞', text: 'Unlimited clients, categories & products', highlight: true },
                        { icon: '📄', text: 'Unlimited invoices every month' },
                        { icon: '🎨', text: 'Custom invoice templates' },
                        { icon: '✨', text: 'Professional PDFs with no watermarks' },
                        { icon: '📊', text: 'Advanced dashboard analytics' },
                        { icon: '⚡', text: 'Priority email support' }
                      ].map((feature, index) => (
                        <Box 
                          key={index}
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1.5,
                            p: 1.5,
                            borderRadius: 2,
                            background: feature.highlight ? 'rgba(139, 92, 246, 0.08)' : 'transparent',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              background: 'rgba(139, 92, 246, 0.12)',
                              transform: 'translateX(4px)'
                            }
                          }}
                        >
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '8px',
                              background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.1rem',
                              flexShrink: 0
                            }}
                          >
                            {feature.icon}
                          </Box>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: feature.highlight ? 600 : 500,
                              color: feature.highlight ? '#6d28d9' : 'text.primary',
                              flex: 1
                            }}
                          >
                            {feature.text}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>

                    {/* CTA Button for Free Users */}
                    {!isPremium && !subscriptionDetails && (
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        startIcon={<Star />}
                        onClick={handleStartTrial}
                        sx={{
                          mt: 3,
                          py: 1.5,
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)',
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '1rem',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                            boxShadow: '0 12px 28px rgba(16, 185, 129, 0.5)',
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        Start 7-Day Free Trial
                      </Button>
                    )}
                    {!isPremium && subscriptionDetails && (
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        startIcon={<Star />}
                        onClick={() => {
                          setIsTrialMode(false);
                          setPaymentDialogOpen(true);
                        }}
                        sx={{
                          mt: 3,
                          py: 1.5,
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                          boxShadow: '0 8px 20px rgba(139, 92, 246, 0.4)',
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '1rem',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
                            boxShadow: '0 12px 28px rgba(139, 92, 246, 0.5)',
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        Upgrade to Premium Now
                      </Button>
                    )}
                  </Paper>
                </Grow>
              </Box>

              {/* Payment History */}
              <Grow in={true} timeout={1000}>
                <Paper
                  elevation={6}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    background: 'linear-gradient(145deg, #ffffff 0%, #faf5ff 100%)',
                    border: '2px solid rgba(139, 92, 246, 0.2)',
                    backdropFilter: 'blur(10px)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 16px 32px rgba(139, 92, 246, 0.2)',
                      border: '2px solid rgba(139, 92, 246, 0.35)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #8b5cf6 0%, #a855f7 100%)',
                    }
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 6px 16px rgba(139, 92, 246, 0.3)'
                      }}
                    >
                      <History sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#6d28d9' }}>
                      Payment History
                    </Typography>
                  </Box>
                  {payments.length > 0 ? (
                    <Stack spacing={2}>
                      {payments.map((payment) => (
                        <Paper 
                          key={payment.id} 
                          sx={{ 
                            p: 3, 
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.04) 0%, rgba(168, 85, 247, 0.04) 100%)',
                            border: '2px solid rgba(139, 92, 246, 0.15)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              border: '2px solid rgba(139, 92, 246, 0.3)',
                              transform: 'translateX(4px)',
                              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.15)'
                            }
                          }}
                        >
                          <Box
                            sx={{
                              display: 'grid',
                              gap: 2,
                              gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' },
                              alignItems: 'center'
                            }}
                          >
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600, display: 'block' }}>
                                Amount
                              </Typography>
                              <Typography variant="h5" sx={{ fontWeight: 800, color: '#8b5cf6' }}>
                                €{payment.amount.toFixed(2)}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600, display: 'block' }}>
                                Date
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {formatDate(payment.paymentDate)}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600, display: 'block' }}>
                                Status
                              </Typography>
                              <Chip
                                label={payment.status}
                                size="small"
                                sx={{
                                  backgroundColor: payment.status === 'Succeeded' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(107, 114, 128, 0.12)',
                                  color: payment.status === 'Succeeded' ? '#059669' : '#4b5563',
                                  border: payment.status === 'Succeeded' ? '2px solid rgba(16, 185, 129, 0.3)' : '2px solid rgba(107, 114, 128, 0.3)',
                                  fontWeight: 700,
                                  borderRadius: 2,
                                  height: '28px'
                                }}
                              />
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600, display: 'block' }}>
                                Description
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {payment.description || 'Monthly subscription'}
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      ))}
                    </Stack>
                  ) : (
                    <Box
                      sx={{
                        textAlign: 'center',
                        py: 6,
                        px: 3,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
                        border: '2px dashed rgba(139, 92, 246, 0.2)'
                      }}
                    >
                      <Payment sx={{ fontSize: 48, color: '#a855f7', mb: 2, opacity: 0.5 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1 }}>
                        No payment history yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Your payment transactions will appear here once you upgrade to Premium
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grow>

              {/* Payment Dialog */}
              <PaymentDialog
                open={paymentDialogOpen}
                onClose={() => {
                  setPaymentDialogOpen(false);
                  setIsTrialMode(false);
                }}
                amount={isTrialMode ? 0 : monthlyPrice}
                isTrial={isTrialMode}
                onSuccess={() => {
                  setPaymentDialogOpen(false);
                  setIsTrialMode(false);
                  setSuccess(isTrialMode 
                    ? '7-day free trial started successfully! Enjoy full Premium access.' 
                    : 'Payment processed successfully! You are now on the Premium plan.'
                  );
                  refreshStatus();
                  fetchSubscriptionData();
                }}
                onError={(error) => {
                  setError(error);
                  setIsTrialMode(false);
                }}
              />

              {/* Cancel/Downgrade Confirmation Dialog */}
              <Dialog 
                open={cancelDialogOpen} 
                onClose={() => setCancelDialogOpen(false)}
                PaperProps={{
                  sx: {
                    borderRadius: 3,
                    background: 'linear-gradient(145deg, #ffffff 0%, #fef2f2 100%)',
                    border: '2px solid rgba(220, 38, 38, 0.2)',
                  }
                }}
              >
                <DialogTitle sx={{ fontWeight: 800, color: '#dc2626', fontSize: '1.5rem' }}>
                  ⚠️ Cancel Subscription
                </DialogTitle>
                <DialogContent>
                  {subscriptionDetails?.endDate && (
                    <Alert 
                      severity="info" 
                      sx={{ 
                        mb: 3,
                        background: 'rgba(59, 130, 246, 0.08)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Don't worry! You'll keep Premium access until{' '}
                        <strong>
                          {new Date(subscriptionDetails.endDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </strong>
                        {' '}({(() => {
                          const daysLeft = Math.ceil((new Date(subscriptionDetails.endDate) - new Date()) / (1000 * 60 * 60 * 24));
                          return daysLeft === 1 ? '1 day' : `${daysLeft} days`;
                        })()}).
                      </Typography>
                    </Alert>
                  )}
                  
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                    After your current period ends, you will lose access to:
                  </Typography>
                  <Stack spacing={1.5}>
                    {[
                      '❌ Unlimited clients (limited to 1)',
                      '❌ Unlimited categories (limited to 1)',
                      '❌ Unlimited products (limited to 1)',
                      '❌ Unlimited invoices (limited to 3/month)',
                      '❌ Custom invoice templates',
                      '❌ PDF exports without watermarks'
                    ].map((item, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          background: 'rgba(220, 38, 38, 0.05)',
                          border: '1px solid rgba(220, 38, 38, 0.15)'
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#dc2626' }}>
                          {item}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 2 }}>
                  <Button 
                    onClick={() => setCancelDialogOpen(false)} 
                    disabled={actionLoading}
                    variant="contained"
                    size="large"
                    sx={{ 
                      textTransform: 'none', 
                      borderRadius: 2,
                      fontWeight: 700,
                      px: 3,
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
                      }
                    }}
                  >
                    Keep Premium
                  </Button>
                  <Button
                    onClick={handleCancelSubscription}
                    disabled={actionLoading}
                    variant="outlined"
                    size="large"
                    startIcon={actionLoading && <CircularProgress size={16} />}
                    sx={{
                      borderColor: '#dc2626',
                      borderWidth: '2px',
                      color: '#dc2626',
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 700,
                      px: 3,
                      '&:hover': {
                        backgroundColor: 'rgba(220, 38, 38, 0.1)',
                        borderColor: '#dc2626',
                        borderWidth: '2px',
                      }
                    }}
                  >
                    Downgrade to Free
                  </Button>
                </DialogActions>
              </Dialog>
            </Box>
          </Fade>
        </Section>
      </Page>
    );
  };

  export default SubscriptionPage;
